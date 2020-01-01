"""
Python libraries
"""
import os
import re
import shutil
import json
from PIL import Image

"""
Module libraries
"""
from image_manipulation import SOURCE
from image_manipulation import TRAIN
from image_manipulation import SELECT

import image_manipulation.check_dirs as chkd

if not os.path.exists(SOURCE):
        print("Please add the images folders containing all the categorized images")
        raise FileNotFoundError
else:
    chkd.check_dara_dir(TRAIN)

def open_selections(file):
    with open(SELECT + file) as selection:
            return json.load(selection)
    selection.close()

"""
Extraction des coordonnées des fichiers json
Retourne les coordonnées x,y sous la forme de tableaux
"""
def create_coordinates_tables(image_file, data):

            true_x_values, true_y_values =[], []
            false_x_values, false_y_values = [], []
            
            key = image_file.replace(".jpg", '')
            for sub_key in data[key]:
                if (sub_key['color'] == 1):
                    true_x_values.append(sub_key['x'])
                    true_y_values.append(sub_key['y'])
                if (sub_key['color'] == 2):
                    false_x_values.append(sub_key['x'])
                    false_y_values.append(sub_key['y'])
            coordinates = {
                'true' : [true_x_values, true_y_values],
                'false' : [false_x_values, false_y_values]
            }
            return coordinates

"""
Découpage des images
"""
def crop_selection(image, coordinates, index):
    return image.crop((
                    coordinates[0][index],
                    coordinates[1][index],
                    coordinates[0][index] + 128,
                    coordinates[1][index] + 128
                ))

"""
Parcours de chaque sélection et image
"""
def crop_all():

    filelist = os.listdir(SELECT)
    filelist.sort()

    t_img_count = f_img_count = -1

    for file in filelist:
        data = open_selections(file)
        image_list = os.listdir(SOURCE + file)
        image_list.sort()

        for image in image_list:
            coordinates = create_coordinates_tables(image, data)
            true_values = coordinates['true']
            false_values = coordinates['false']
            
            with Image.open(SOURCE + file + '/' + image) as current_image:
                true_index, false_index = 0,0
                while( (true_index < len(true_values[0])) or (false_index < len(false_values[0])) ):
                    file_name = 'value-count.jpg'
                    if (true_index < len(true_values[0])):
                        path = TRAIN + 'true/'
                        file_name = file_name.replace('value',('true')).replace('count', str(t_img_count))
                        try:
                            Image.open(TRAIN + 'true/' + file_name)
                        except:
                            crop_selection(current_image, true_values, true_index).save(path + file_name)
                        true_index += 1
                        t_img_count += 1
                    elif (false_index < len(false_values[0])):
                        path = TRAIN + 'false/'
                        file_name = file_name.replace('value',('false')).replace('count', str(f_img_count))
                        try:
                            Image.open(TRAIN + 'false/' + file_name)
                        except:
                            crop_selection(current_image, false_values, false_index).save(path + file_name)
                        false_index += 1
                        f_img_count += 1
                current_image.close()
    
    print("All images have successfully been cropped")



