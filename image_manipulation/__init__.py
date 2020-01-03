"""
Default paths
"""
import os

root_dir = "/home/henfur/projects/iut/ressources-wally"

if (root_dir != None):
    SOURCE = os.path.join(root_dir, "images")
    SELECT = os.path.join(root_dir, "face_recognition/selections")
    TRAIN = os.path.join(root_dir, "sorted_files/train")
    TEST = os.path.join(root_dir, "sorted_files/validation")
    CRP_SRC = os.path.join(root_dir, "cropped_source_imgs")
else:
    print("Please define the root directory in image_manipulation/__init__.py")