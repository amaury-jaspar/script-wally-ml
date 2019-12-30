"""
Default paths
"""

root_dir = None

if (root_dir != None):
    SOURCE = root_dir + "ressources/images/"
    SELECT = root_dir + "ressources/face_recognition/selections/"
    TRAIN = root_dir + "ressources/sorted_files/train/"
    TEST = root_dir + "ressources/sorted_files/validation/"
else:
    print("Please define the root directory")