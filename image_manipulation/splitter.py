"""
Python libraries
"""
import os
import random
import shutil

"""
Module libraries and paths
"""
from image_manipulation import TRAIN
from image_manipulation import TEST

import image_manipulation.check_dirs as chkd


chkd.check_data_dir([TRAIN, TEST])
"""
Creates an array with the files in "path" attributing a unique integer to each file
"""
def label_files(path):
    data_dir = os.listdir(path)
    labeled_dict = []
    for obj in data_dir:
        labeled_dict.append(str(obj))
    return labeled_dict

def shuffle_data(data, n):
    for i in range(n):
        random.shuffle(data)
    return data

"""
Splits the data into 2 directories (TRAIN and TEST)
"""
def split(labels, proportion, shuffle=True, nb_shuffle=1):
    
    for lbl in labels:
        data = label_files(os.path.join(TRAIN, lbl))
        if (shuffle == True):
            data = shuffle_data(data, nb_shuffle)
        size = len(data)
        #Checking if the proportion is the right type
        if ( (type(proportion) == float) and (0. < proportion < 1.) ):
            nb_test = proportion * size
        elif ( (type(proportion) == int) and (proportion <= size) ):
            nb_test = size
        else:
            print("Only int, and float types are accepted")
            raise TypeError
        #Initializing loop counter and index history
        file_count = 0

        while(file_count < nb_test):
            size = len(data) #Data size decreases each turn
            rd_index = random.randint(0,size-1) #Generates a random array index
            path = os.path.join(TRAIN, lbl)
            path = os.path.join(path, data[rd_index])
            shutil.move(path, os.path.join(TEST, lbl)) #Move files from TRAIN to TEST directory
            del data[rd_index]
            file_count += 1
        



    
