"""
Default paths
"""

root_dir = "/home/henfur/projects/iut/ressources-wally/"

if (root_dir[len(root_dir)-1] != '/'):
    root_dir += '/'

if (root_dir != None):
    SOURCE = root_dir + "images/"
    SELECT = root_dir + "face_recognition/selections/"
    TRAIN = root_dir + "sorted_files/train/"
    TEST = root_dir + "sorted_files/validation/"
    CRP_SRC = root_dir + "cropped_source_imgs/"
else:
    print("Please define the root directory in image_manipulation/__init__.py")