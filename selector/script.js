/**
 * Size of the selection window
 * @type {number}
 */
SELECTION_SIZE = 128;
/**
 * Position of the mouse cursor
 * @type {number}
 */
let mouseX, mouseY;
/**
 * Colors for selection squares
 * @type {string[]}
 */
const colors = ["#00ff25", "#ff0000", "#ffffff", "#ff2de0", "#00becc", "#fffa00"];
/**
 * Dictionary mapping image names to the list of selected areas
 */
let selection = {};

/**
 * Clamps a value between two extreme values
 * @param x {number} current value
 * @param minValue {number} minimal value allowed
 * @param maxValue {number} maximal value allowed
 * @returns {number} minValue if x <= minValue, maxValue if x >= maxValue, x otherwise
 */
function clamp(x, minValue, maxValue) {
    return (Math.min(maxValue - 1, Math.max(minValue, x)));
}

let image_width = undefined;
let image_height = undefined;
const image_selector = document.getElementById("image-select");
const annotations = SVG.Image(0, 0);
const rectangles = SVG.Group().update({
    stroke: 'black',
    stroke_width: SELECTION_SIZE / 16,
    fill_opacity: .4,
});
const selectionSquare = SVG.Rect(0, 0, SELECTION_SIZE, SELECTION_SIZE).update({
    stroke: 'black',
    stroke_width: SELECTION_SIZE / 16,
    fill: 'none',
});
selectionSquare.classList.add("no-pointer");

annotations.add(rectangles).add(selectionSquare);
document.getElementById("image-container").appendChild(annotations);

const image = document.getElementById("page-image");
image.onload = () => {
    // get image dimensions and resize canvas
    image_width = image.naturalWidth;
    image_height = image.naturalHeight;
    annotations.update({
        viewBox: `0 0 ${image_width} ${image_height}`,
    });

    updateSelectionSquare();
    rectangles.clear();
    if (selection[image_selector.value] === undefined) {
        selection[image_selector.value] = [];
    }
    for (let s of selection[image_selector.value]) {
        this.addSelectionSquare(s);
    }
};

// // Handle clicks on the image
// annotations.addEventListener("click", e => select(e.clientX, e.clientY, 0));


function select(px, py, color) {
    const rect = annotations.getBoundingClientRect();
    let x = ~~((px - rect.left) / rect.width * image_width);
    x = clamp(x - SELECTION_SIZE / 2, 0, image_width - SELECTION_SIZE);
    let y = ~~((py - rect.top) / rect.height * image_height);
    y = clamp(y - SELECTION_SIZE / 2, 0, image_height - SELECTION_SIZE);
    const s = {x: x, y: y, color: color};
    selection[image_selector.value].push(s);
    saveSelection();
    addSelectionSquare(s)
}

function addSelectionSquare(s) {
    const node = SVG.Rect(s.x, s.y, SELECTION_SIZE, SELECTION_SIZE).update({
        fill: colors[s.color],
    });
    // when the node is right-clicked, it is deleted and the corresponding selection is removed
    node.addEventListener("contextmenu", (e) => {
        const sel = selection[image_selector.value];
        e.preventDefault();
        for (let i = 0; i < sel.length; i++) {
            if (sel[i].x === s.x && sel[i].y === s.y) {
                sel.splice(i, 1);
                break;
            }
        }
        saveSelection();
        rectangles.removeChild(node);
    });
    rectangles.appendChild(node);
}

/**
 * Moves the selection square to follow the mouse cursor
 */
function updateSelectionSquare() {
    if (selectionSquare !== undefined) {
        const rect = annotations.getBoundingClientRect();
        let x = ~~((mouseX - rect.left) / rect.width * image_width);
        x = clamp(x - SELECTION_SIZE / 2, 0, image_width - SELECTION_SIZE);
        let y = ~~((mouseY - rect.top) / rect.height * image_height);
        y = clamp(y - SELECTION_SIZE / 2, 0, image_height - SELECTION_SIZE);
        selectionSquare.setAttribute("x", x);
        selectionSquare.setAttribute("y", y);
    }
}

function updateImage() {
    image.src = `images/${image_selector.value}.jpg`;
    const page = image_selector.selectedOptions[0].innerText;
    const book = image_selector.selectedOptions[0].parentElement.label;
    document.getElementById("page-name").innerText = `${book} (${page})`;
}

// Keyboard controls
window.addEventListener("keydown", (e) => {
    console.log(e.key);
    switch (e.key) {
        case "ArrowRight":
            if (image_selector.selectedIndex < image_selector.length - 1) {
                image_selector.selectedIndex += 1;
                updateImage();
            }
            break;
        case "ArrowLeft":
            if (image_selector.selectedIndex > 0) {
                image_selector.selectedIndex -= 1;
                updateImage();
            }
            break;
        case "0":
        case "à":
            select(mouseX, mouseY, 0);
            break;
        case "1":
        case "&":
            select(mouseX, mouseY, 1);
            break;
        case "2":
        case "é":
            select(mouseX, mouseY, 2);
            break;
        case "3":
        case "\"":
            select(mouseX, mouseY, 3);
            break;
        case "4":
        case "'":
            select(mouseX, mouseY, 4);
            break;
        case "5":
        case "(":
            select(mouseX, mouseY, 5);
            break;
        case "Shift":
            console.log("opacity");
            image.style.opacity = ".2";
            break;
    }
});

window.addEventListener("keyup", (e) => {
    switch (e.key) {
        case "Shift":
            image.style.opacity = "1";
            break;
    }
});

// Track the cursor position
window.onmousemove = (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    updateSelectionSquare();
};
window.onscroll = (e) => {
    updateSelectionSquare();
};

function makePagesGroup(groupName, nbPages, prefix) {
    const group = document.createElement("optgroup");
    group.label = groupName;
    for (let i = 0; i < nbPages; i++) {
        let opt = document.createElement("option");
        opt.value = prefix + String(i).padStart(2, '0');
        opt.innerText = `page ${i + 1}`;
        group.appendChild(opt);
    }
    return group;
}

function clearSelection() {
    localStorage.setItem("previous_selection", JSON.stringify(selection));
    selection = {};
    saveSelection();
    updateImage();
}

function saveSelection() {
    localStorage.setItem("selection", JSON.stringify(selection));
}

function loadSelection() {
    try {
        let stored_selection = JSON.parse(localStorage.getItem("selection"));
        if (stored_selection !== null) selection = stored_selection;
    } catch (e) {
    }
}

function copySelection() {
    const textArea = document.createElement('textarea');
    textArea.value = JSON.stringify(selection);
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
}

window.onload = function () {
    const selector = document.getElementById("image-select");
    selector.appendChild(makePagesGroup(
        "Où est Charlie ?",
        24,
        "charlie"));
    selector.appendChild(makePagesGroup(
        "Charlie remonte le temps",
        24,
        "temps"));
    selector.appendChild(makePagesGroup(
        "Le voyage fantastique",
        24,
        "voyage"));
    selector.appendChild(makePagesGroup(
        "À Hollywood",
        24,
        "hollywood"));
    selector.appendChild(makePagesGroup(
        "Le carnet secret",
        14,
        "carnet"));

    loadSelection();
    // selection = {"charlie00":[{"x":2503,"y":2680,"color":1},{"x":2542,"y":2152,"color":3},{"x":1303,"y":2930,"color":1},{"x":1106,"y":3196,"color":2},{"x":991,"y":2942,"color":3},{"x":796,"y":2946,"color":4},{"x":615,"y":2935,"color":5}],"charlie01":[{"x":858,"y":2803,"color":4},{"x":458,"y":3463,"color":5},{"x":379,"y":1082,"color":2},{"x":119,"y":3088,"color":0},{"x":1712,"y":3357,"color":0}],"charlie02":[{"x":1512,"y":1141,"color":4},{"x":523,"y":1151,"color":5},{"x":1583,"y":2261,"color":0},{"x":883,"y":2872,"color":0}],"charlie03":[{"x":628,"y":1226,"color":1},{"x":1577,"y":1373,"color":3},{"x":1027,"y":1236,"color":2},{"x":124,"y":2885,"color":0}],"charlie04":[{"x":1674,"y":2645,"color":2},{"x":270,"y":2773,"color":4},{"x":2819,"y":1472,"color":3},{"x":1794,"y":2328,"color":5},{"x":2345,"y":2828,"color":0},{"x":2464,"y":2184,"color":0}],"charlie05":[{"x":2066,"y":2658,"color":1}],"charlie06":[{"x":1533,"y":2649,"color":1},{"x":1747,"y":2256,"color":4},{"x":2644,"y":3130,"color":2}],"charlie07":[{"x":2321,"y":1587,"color":3},{"x":145,"y":2708,"color":5}],"charlie08":[{"x":1097,"y":2473,"color":5},{"x":1703,"y":2413,"color":3},{"x":1999,"y":1249,"color":4},{"x":1320,"y":1552,"color":0},{"x":2101,"y":2365,"color":0}],"charlie09":[{"x":1284,"y":1141,"color":1},{"x":2243,"y":3417,"color":0},{"x":1631,"y":2099,"color":0},{"x":928,"y":1102,"color":0},{"x":0,"y":2528,"color":2}],"charlie10":[{"x":1618,"y":1250,"color":1},{"x":543,"y":2453,"color":5},{"x":2399,"y":2478,"color":0},{"x":2510,"y":2931,"color":0},{"x":1351,"y":2595,"color":0},{"x":814,"y":3024,"color":0}],"charlie11":[{"x":2657,"y":2975,"color":4},{"x":1436,"y":2814,"color":2},{"x":2211,"y":2463,"color":3},{"x":1065,"y":2903,"color":0}],"charlie12":[{"x":1582,"y":1135,"color":1},{"x":1402,"y":2645,"color":3},{"x":1111,"y":2798,"color":0}],"charlie13":[{"x":597,"y":3156,"color":4},{"x":515,"y":2325,"color":5},{"x":589,"y":1535,"color":2},{"x":1389,"y":2045,"color":0},{"x":644,"y":2978,"color":0}],"charlie14":[{"x":804,"y":2307,"color":5},{"x":2717,"y":1740,"color":2}],"charlie15":[{"x":1479,"y":2351,"color":3},{"x":2265,"y":2429,"color":1},{"x":153,"y":1985,"color":4}],"charlie16":[{"x":2112,"y":2702,"color":5}],"charlie17":[{"x":2149,"y":2823,"color":1},{"x":2287,"y":3111,"color":0},{"x":1629,"y":3475,"color":0},{"x":791,"y":3428,"color":2},{"x":527,"y":2567,"color":4},{"x":1280,"y":2749,"color":0},{"x":120,"y":2575,"color":3}],"charlie18":[{"x":776,"y":2152,"color":5},{"x":1719,"y":2738,"color":0},{"x":2651,"y":776,"color":1},{"x":2162,"y":2818,"color":3}],"charlie19":[{"x":1598,"y":2106,"color":0},{"x":2352,"y":2547,"color":0},{"x":903,"y":1474,"color":4},{"x":1437,"y":1844,"color":2},{"x":800,"y":1738,"color":0}],"charlie20":[{"x":1713,"y":2660,"color":3},{"x":1114,"y":2633,"color":5},{"x":2407,"y":595,"color":1}],"charlie21":[{"x":618,"y":1807,"color":2},{"x":1019,"y":94,"color":4}],"charlie22":[{"x":545,"y":2804,"color":3},{"x":1930,"y":2187,"color":0},{"x":2698,"y":3209,"color":2},{"x":2383,"y":2078,"color":4}],"charlie23":[{"x":1322,"y":1853,"color":1},{"x":469,"y":953,"color":5}],"temps00":[{"x":1676,"y":1528,"color":0},{"x":2431,"y":3548,"color":2},{"x":1289,"y":2964,"color":1},{"x":1104,"y":3207,"color":2},{"x":983,"y":2959,"color":3},{"x":791,"y":2966,"color":4},{"x":608,"y":2966,"color":5}],"temps01":[{"x":1819,"y":275,"color":1},{"x":1100,"y":3222,"color":3},{"x":2235,"y":2925,"color":4},{"x":1144,"y":2137,"color":5}],"temps02":[{"x":1614,"y":1199,"color":4},{"x":2145,"y":3287,"color":3},{"x":2370,"y":2412,"color":0},{"x":284,"y":2875,"color":0},{"x":1472,"y":2723,"color":0},{"x":2457,"y":2982,"color":2}],"temps03":[{"x":928,"y":2711,"color":5},{"x":1916,"y":1853,"color":0},{"x":163,"y":3026,"color":0},{"x":1590,"y":950,"color":1}],"temps04":[{"x":194,"y":2620,"color":5},{"x":2625,"y":520,"color":4},{"x":2383,"y":996,"color":1}],"temps05":[{"x":2216,"y":2158,"color":0},{"x":624,"y":2328,"color":0},{"x":2660,"y":290,"color":3},{"x":2152,"y":2738,"color":2}],"temps06":[{"x":533,"y":2673,"color":1},{"x":1041,"y":3259,"color":0},{"x":2421,"y":3184,"color":0},{"x":419,"y":2110,"color":4}],"temps07":[{"x":846,"y":2974,"color":2},{"x":2692,"y":2268,"color":5},{"x":2527,"y":1170,"color":3}],"temps08":[{"x":2317,"y":1782,"color":3},{"x":245,"y":3015,"color":1},{"x":1015,"y":2289,"color":0},{"x":2013,"y":3137,"color":2}],"temps09":[{"x":835,"y":1893,"color":5},{"x":573,"y":1330,"color":3},{"x":1208,"y":1403,"color":0}],"temps10":[{"x":314,"y":3119,"color":1},{"x":1802,"y":3281,"color":0},{"x":1746,"y":2568,"color":0},{"x":1027,"y":2495,"color":0},{"x":1228,"y":2621,"color":2}],"temps11":[{"x":1256,"y":3077,"color":5},{"x":1936,"y":2458,"color":0},{"x":1287,"y":1872,"color":3},{"x":867,"y":3438,"color":4}],"temps12":[{"x":1109,"y":1771,"color":0},{"x":1137,"y":2453,"color":3},{"x":175,"y":2505,"color":0},{"x":731,"y":2080,"color":0}],"temps13":[{"x":946,"y":1643,"color":0},{"x":2597,"y":1961,"color":1},{"x":451,"y":3262,"color":4},{"x":593,"y":2194,"color":0},{"x":1106,"y":2646,"color":5},{"x":314,"y":3118,"color":2}],"temps14":[{"x":1328,"y":2115,"color":3},{"x":2164,"y":1498,"color":4}],"temps15":[{"x":232,"y":1710,"color":5},{"x":1800,"y":653,"color":1},{"x":1037,"y":2732,"color":2}],"temps16":[{"x":1410,"y":2098,"color":5},{"x":72,"y":2805,"color":3},{"x":689,"y":1744,"color":4}],"temps17":[{"x":1894,"y":2475,"color":2},{"x":2778,"y":1398,"color":1}],"temps18":[{"x":2350,"y":3367,"color":1},{"x":889,"y":3196,"color":0},{"x":337,"y":2099,"color":2},{"x":2171,"y":1807,"color":5}],"temps19":[{"x":1965,"y":3229,"color":0},{"x":2353,"y":2767,"color":3},{"x":2684,"y":665,"color":4}],"temps20":[{"x":2130,"y":319,"color":5},{"x":975,"y":1518,"color":1},{"x":2181,"y":2797,"color":0}],"temps21":[{"x":398,"y":3006,"color":3},{"x":2506,"y":911,"color":4},{"x":1389,"y":1200,"color":0},{"x":1759,"y":2233,"color":0},{"x":1652,"y":698,"color":0},{"x":1259,"y":756,"color":2}],"temps22":[{"x":1629,"y":1916,"color":3},{"x":234,"y":2610,"color":5},{"x":799,"y":2999,"color":0},{"x":2307,"y":2346,"color":1}],"temps23":[{"x":1663,"y":2151,"color":4},{"x":476,"y":3500,"color":2}],"voyage00":[{"x":2226,"y":1132,"color":3},{"x":1253,"y":2769,"color":1},{"x":1052,"y":3033,"color":2},{"x":953,"y":2771,"color":3},{"x":751,"y":2767,"color":4},{"x":562,"y":2760,"color":5},{"x":2219,"y":2767,"color":0},{"x":2299,"y":2142,"color":5}],"voyage01":[{"x":356,"y":1233,"color":1},{"x":1992,"y":3062,"color":4},{"x":394,"y":2029,"color":0},{"x":1018,"y":2223,"color":2},{"x":2194,"y":1880,"color":0}],"voyage02":[{"x":863,"y":1664,"color":1},{"x":350,"y":2457,"color":5},{"x":1653,"y":2940,"color":2}],"voyage03":[{"x":973,"y":1966,"color":3},{"x":2437,"y":1483,"color":4}],"voyage04":[{"x":1818,"y":812,"color":4},{"x":1903,"y":3351,"color":2},{"x":2457,"y":2529,"color":1},{"x":2244,"y":3404,"color":0},{"x":481,"y":3036,"color":0}],"voyage05":[{"x":1659,"y":860,"color":3},{"x":1193,"y":3113,"color":0},{"x":2458,"y":3246,"color":0},{"x":477,"y":1121,"color":5}],"voyage06":[{"x":2118,"y":2274,"color":4},{"x":322,"y":2024,"color":2},{"x":501,"y":2752,"color":3}],"voyage07":[{"x":1424,"y":2711,"color":5},{"x":1565,"y":1525,"color":1}],"voyage08":[{"x":2259,"y":2360,"color":5},{"x":1773,"y":2649,"color":2}],"voyage09":[{"x":1705,"y":2846,"color":3},{"x":494,"y":506,"color":1},{"x":2682,"y":718,"color":3}],"voyage10":[{"x":1230,"y":2694,"color":1},{"x":2604,"y":1925,"color":4}],"voyage11":[{"x":1616,"y":1127,"color":5},{"x":1925,"y":2956,"color":0},{"x":1218,"y":2956,"color":0},{"x":617,"y":1426,"color":3},{"x":2095,"y":1702,"color":2}],"voyage12":[{"x":2378,"y":2588,"color":3},{"x":293,"y":3360,"color":0},{"x":481,"y":3039,"color":2},{"x":1331,"y":3443,"color":0},{"x":2033,"y":2871,"color":0}],"voyage13":[{"x":673,"y":1151,"color":1},{"x":2597,"y":1076,"color":4},{"x":1361,"y":2647,"color":5}],"voyage14":[{"x":1154,"y":2670,"color":0},{"x":1775,"y":603,"color":5},{"x":1986,"y":290,"color":0}],"voyage15":[{"x":914,"y":516,"color":1},{"x":70,"y":808,"color":3},{"x":1632,"y":391,"color":4},{"x":2534,"y":1010,"color":2}],"voyage16":[{"x":2663,"y":214,"color":4},{"x":1430,"y":2457,"color":1},{"x":406,"y":2704,"color":5}],"voyage17":[{"x":1349,"y":1119,"color":2},{"x":1888,"y":2574,"color":3}],"voyage18":[{"x":749,"y":1893,"color":0},{"x":2347,"y":2658,"color":0},{"x":1848,"y":3225,"color":0},{"x":1022,"y":2331,"color":1},{"x":115,"y":2623,"color":2},{"x":1929,"y":2442,"color":0}],"voyage19":[{"x":452,"y":3231,"color":5},{"x":2651,"y":2790,"color":4},{"x":1065,"y":2858,"color":3}],"voyage20":[{"x":928,"y":45,"color":5},{"x":2492,"y":2996,"color":0}],"voyage21":[{"x":2114,"y":1394,"color":1},{"x":738,"y":1211,"color":4},{"x":2209,"y":267,"color":2},{"x":1164,"y":93,"color":3}],"voyage22":[{"x":2188,"y":1477,"color":5},{"x":1598,"y":2646,"color":2}],"voyage23":[{"x":724,"y":2954,"color":0},{"x":1091,"y":2347,"color":0},{"x":2449,"y":2173,"color":0},{"x":1936,"y":731,"color":0},{"x":2508,"y":2737,"color":3},{"x":1718,"y":3020,"color":4}],"hollywood00":[{"x":1538,"y":1911,"color":1},{"x":1345,"y":2168,"color":2},{"x":1236,"y":1915,"color":3},{"x":1041,"y":1912,"color":4},{"x":855,"y":1909,"color":5},{"x":334,"y":3394,"color":0},{"x":1253,"y":3099,"color":5},{"x":2831,"y":1682,"color":2},{"x":2818,"y":2644,"color":0}],"hollywood01":[{"x":823,"y":2121,"color":3},{"x":2676,"y":508,"color":0},{"x":2647,"y":3044,"color":1},{"x":558,"y":2256,"color":0},{"x":2381,"y":351,"color":4}],"hollywood02":[{"x":2136,"y":1091,"color":5},{"x":1566,"y":2240,"color":3},{"x":236,"y":2612,"color":1},{"x":1733,"y":1346,"color":2}],"hollywood03":[{"x":1521,"y":522,"color":4},{"x":2028,"y":3180,"color":0},{"x":2472,"y":2808,"color":0}],"hollywood04":[{"x":1608,"y":138,"color":4},{"x":855,"y":2997,"color":1},{"x":1597,"y":2070,"color":0}],"hollywood05":[{"x":2325,"y":2511,"color":0},{"x":1539,"y":2669,"color":3},{"x":993,"y":3298,"color":0},{"x":646,"y":2426,"color":2},{"x":2214,"y":2902,"color":5}],"hollywood06":[{"x":1859,"y":142,"color":4},{"x":1753,"y":2456,"color":2},{"x":2677,"y":2480,"color":5},{"x":686,"y":1668,"color":1}],"hollywood07":[{"x":1232,"y":3179,"color":3},{"x":1977,"y":1712,"color":0},{"x":798,"y":3447,"color":0},{"x":2193,"y":2566,"color":0}],"hollywood08":[{"x":43,"y":2899,"color":5},{"x":609,"y":2861,"color":0},{"x":1373,"y":3229,"color":0},{"x":610,"y":2127,"color":0},{"x":1997,"y":796,"color":0}],"hollywood09":[{"x":2771,"y":1385,"color":3},{"x":1345,"y":906,"color":4},{"x":2796,"y":2883,"color":1},{"x":288,"y":3539,"color":0},{"x":872,"y":1356,"color":2}],"hollywood10":[{"x":541,"y":2300,"color":4},{"x":2156,"y":2592,"color":2},{"x":1245,"y":2327,"color":0}],"hollywood11":[{"x":2112,"y":648,"color":3},{"x":1310,"y":2165,"color":1},{"x":2496,"y":1936,"color":5}],"hollywood12":[{"x":1169,"y":1301,"color":3},{"x":562,"y":2794,"color":5},{"x":89,"y":3107,"color":0},{"x":1703,"y":3377,"color":2},{"x":2088,"y":2255,"color":0},{"x":1161,"y":3015,"color":0}],"hollywood13":[{"x":2499,"y":1506,"color":1},{"x":2670,"y":3206,"color":0},{"x":2251,"y":901,"color":0},{"x":1522,"y":319,"color":3}],"hollywood14":[{"x":823,"y":1298,"color":5},{"x":1315,"y":1634,"color":0},{"x":2501,"y":2027,"color":3},{"x":1008,"y":3038,"color":2}],"hollywood15":[{"x":2541,"y":1032,"color":4},{"x":2422,"y":2498,"color":0},{"x":118,"y":2909,"color":1}],"hollywood16":[{"x":208,"y":1762,"color":5},{"x":1388,"y":2954,"color":0}],"hollywood17":[{"x":966,"y":2610,"color":4},{"x":1891,"y":2090,"color":3},{"x":2405,"y":2011,"color":1},{"x":1764,"y":3264,"color":2}],"hollywood18":[{"x":577,"y":3403,"color":0},{"x":2743,"y":3207,"color":0},{"x":1309,"y":2257,"color":5},{"x":1657,"y":1508,"color":2},{"x":2248,"y":1690,"color":4}],"hollywood19":[{"x":1993,"y":3515,"color":0},{"x":2632,"y":3374,"color":0},{"x":705,"y":2488,"color":1},{"x":1690,"y":1050,"color":3}],"hollywood20":[],"hollywood21":[{"x":1199,"y":1475,"color":1},{"x":501,"y":2450,"color":3},{"x":274,"y":2951,"color":5},{"x":694,"y":2553,"color":0},{"x":394,"y":3163,"color":0},{"x":1316,"y":3401,"color":0},{"x":2129,"y":2373,"color":2},{"x":1112,"y":2456,"color":4}],"hollywood22":[],"hollywood23":[],"carnet00":[{"x":1058,"y":2514,"color":1},{"x":813,"y":2759,"color":2},{"x":714,"y":2495,"color":3},{"x":530,"y":2493,"color":4},{"x":337,"y":2473,"color":5},{"x":2261,"y":550,"color":1},{"x":1614,"y":3217,"color":0},{"x":2072,"y":1825,"color":3}],"carnet01":[{"x":1254,"y":1756,"color":0},{"x":0,"y":2550,"color":5},{"x":2101,"y":1757,"color":2},{"x":2126,"y":176,"color":0},{"x":1567,"y":2031,"color":4}],"carnet02":[{"x":86,"y":2803,"color":4},{"x":2413,"y":1253,"color":5},{"x":858,"y":1891,"color":0},{"x":546,"y":3591,"color":0}],"carnet03":[{"x":2199,"y":825,"color":1},{"x":397,"y":3177,"color":3},{"x":523,"y":3531,"color":0},{"x":1101,"y":2319,"color":2}],"carnet04":[{"x":577,"y":1704,"color":5},{"x":402,"y":3215,"color":0},{"x":2730,"y":1500,"color":1}],"carnet05":[{"x":2039,"y":1501,"color":4},{"x":341,"y":1517,"color":2},{"x":708,"y":950,"color":0},{"x":1687,"y":2466,"color":3}],"carnet06":[{"x":2502,"y":168,"color":1},{"x":2564,"y":3246,"color":0},{"x":1689,"y":2517,"color":3},{"x":566,"y":3069,"color":2},{"x":260,"y":3126,"color":0},{"x":2129,"y":1931,"color":0},{"x":1298,"y":2877,"color":0},{"x":2034,"y":707,"color":0},{"x":1744,"y":928,"color":5},{"x":2789,"y":3531,"color":4}],"carnet07":[{"x":801,"y":1797,"color":1},{"x":1355,"y":1167,"color":5},{"x":1933,"y":1238,"color":3},{"x":1715,"y":1970,"color":2},{"x":1217,"y":2030,"color":4}],"carnet08":[{"x":1741,"y":1033,"color":0},{"x":1016,"y":2619,"color":1},{"x":187,"y":1783,"color":0},{"x":2235,"y":879,"color":5}],"carnet09":[{"x":1301,"y":1065,"color":3},{"x":2086,"y":120,"color":0},{"x":182,"y":669,"color":4},{"x":652,"y":833,"color":2},{"x":2532,"y":734,"color":0}],"carnet10":[{"x":418,"y":2471,"color":0},{"x":457,"y":1892,"color":2},{"x":2525,"y":1091,"color":5}],"carnet11":[{"x":983,"y":1038,"color":4},{"x":1527,"y":1961,"color":3},{"x":1862,"y":145,"color":0},{"x":1964,"y":1025,"color":0},{"x":298,"y":1561,"color":1}],"carnet12":[{"x":1984,"y":2670,"color":0},{"x":1631,"y":2923,"color":0},{"x":2702,"y":2572,"color":0},{"x":2537,"y":1842,"color":0},{"x":2480,"y":1763,"color":0},{"x":2782,"y":1480,"color":2},{"x":560,"y":2133,"color":5}],"carnet13":[{"x":430,"y":2253,"color":1},{"x":2021,"y":2003,"color":3},{"x":1200,"y":966,"color":4}]};
    updateImage();
};

