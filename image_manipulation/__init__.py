"""
Default paths
"""

root_dir = ""

if (root_dir != None):
    SOURCE = root_dir + "images/"
    SELECT = root_dir + "face_recognition/selections/"
    TRAIN = root_dir + "sorted_files/train/"
    TEST = root_dir + "sorted_files/validation/"
else:
    print("Please define the root directory in image_manipulation/__init__.py")