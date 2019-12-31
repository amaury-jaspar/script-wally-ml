import os

def check_dara_dir(paths):
    if type(paths) != list:
        paths = [paths]
    for dir in paths:
        if not os.path.exists(dir):
            os.makedirs(dir)
        if not os.path.exists(dir + 'true'):
            try:
                os.makedirs(dir + 'true')
            except Exception:
                print("Could not create the" + dir + "true folder")
                raise Exception
            
        if not os.path.exists(dir + 'false'):
            try:
                os.makedirs(dir + 'false')
            except Exception:
                print("Could not create the" + dir + "false folder")
                raise Exception