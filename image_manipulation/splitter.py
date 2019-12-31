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

chkd.check_dara_dir([TRAIN, TEST])

"""
Creates a dictionnary with the files in "path" attributing a unique integer to each file
"""
def label_files(path):
    data_dir = os.listdir(path)
    print("data_dir = " + str(data_dir))
    labeled_dict = dict()
    index = 0
    for obj in data_dir:
        labeled_dict[index] = str(obj)
        index += 1
    return labeled_dict

# def shuffle():

"""
Splits the data into 2 directories (TRAIN and TEST)
"""
def split(labels, proportion):
    
    for lbl in labels:
        labeled_files = label_files(os.path.join(os.path.dirname(TRAIN), lbl))
        size = len(labeled_files)
        if ( (type(proportion) == float) and (0. < proportion < 1.) ):
            nb_test = proportion * size
        elif ( (type(proportion) == int) and (proportion <= size) ):
            nb_test = size
        else:
            print("Only int, and float types are accepted")
            raise TypeError
        file_count = 0
        index_hist = []
        print("nb test" + str(nb_test))
        while(file_count < nb_test):
            rd_index = random.randint(0,size-1)
            if (rd_index not in index_hist):
                index_hist.append(rd_index)
                path = os.path.join(os.path.dirname(TRAIN), lbl)
                path = os.path.join(path, labeled_files[rd_index])
                shutil.move(path, os.path.join(os.path.dirname(TEST), lbl))
                del labeled_files[rd_index]
                file_count += 1
        



    