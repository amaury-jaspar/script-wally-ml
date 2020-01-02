import os
import math
from PIL import Image

from image_manipulation import SOURCE
from image_manipulation import CRP_SRC
from image_manipulation.cropper import crop_selection

import image_manipulation.check_dirs as chkd

"""
Number of pixels by which the scan progresses 
"""
FORWARD = 50
DOWNWARD = 100

def open_image(path):
    with Image.open(path) as img:
        return img

def scan():
    save_path = CRP_SRC
    source_dirs = os.listdir(SOURCE)
    print(save_path)
    print(source_dirs)
    chkd.check_dirs(save_path, source_dirs)
    for directory in source_dirs:
        images_dir = os.listdir(os.path.join(SOURCE, directory)) 
        for image in images_dir:
            path = os.path.join(SOURCE, directory)
            print(path)
            with Image.open(os.path.join(path, image)) as img:
                width, height = img.size

                image_index = 0
                
                width_iter = math.floor(width / FORWARD)
                height_iter = math.floor(height / DOWNWARD)

                max_width = width_iter * FORWARD
                max_height = height_iter * DOWNWARD
                
                width_remain = width - max_width
                height_remain = height - max_height

                for i in range(0, max_height, DOWNWARD):
                    crop_height = 128
                    if(i == max_height):
                        crop_height = height_remain
                    for j in range(0, max_width, FORWARD):
                        crop_width = 128
                        if(j == max_width):
                            crop_width = width_remain
                        file_name = os.path.join(save_path, directory)
                        file_name = os.path.join(file_name, image) + '-'
                        img.crop((
                            j,
                            i,
                            j + crop_width,
                            i + crop_height
                        )).save(file_name.replace('.jpg','') + str(image_index) + '.jpg')
                        image_index += 1

            


