# Where's Wally project

The *Where's Wally project* is a school assignement given at IUT Montpellier-Sète. The projects aims at training a neural network using the tensorflow python library. The model must be able to make the distinction between faces and other objects in the series of books *Where's Wally*. Given a certain page of the book, it must also be able to find Wally with a sufficient amount of confidence.  

# The Google Collab Notebook

Link : https://colab.research.google.com/drive/1zRvD510GGfaGGkhRKRHnyd5aTaxeALy_

This is the core of the project. In this notebook you will find parts of the scripts available here aswell as the actual neural ne network part of the project. 

# The scripts

## cropper.py

This script parses json files located in the `SELECT` directory and extracts position data. Then it uses this data in order to crop the images from `SOURCE` in smaller images (128 * 128 px) savec in `TRAIN`

## splitter.py

This scripts splits the images from `TRAIN`, into *train* (`TRAIN`) and *test* (`TEST`) folders according to the given proportion.  
