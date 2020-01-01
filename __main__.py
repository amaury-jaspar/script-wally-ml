#!/usr/bin/python3

import image_manipulation.cropper as crp
import image_manipulation.splitter as split

if __name__ == "__main__":
    crp.crop_all()

    # proportion = 0.33 # Default value
    # proportion = float(input("Proportion of test images (float or int) : "))

    # split.split(('true','false'), proportion, nb_shuffle=5)

    
