import os

def check_data_dir(paths):
    if type(paths) != list:
        paths = [paths]
    for dir in paths:
        if not os.path.exists(dir):
            os.makedirs(dir)
        if not os.path.exists(os.path.join(dir, 'true')):
            try:
                os.makedirs(os.path.join(dir, 'true'))
            except Exception:
                print("Could not create the" + dir + "true folder")
                raise Exception
            
        if not os.path.exists(os.path.join(dir, 'false')):
            try:
                os.makedirs(os.path.join(dir, 'false'))
            except Exception:
                print("Could not create the" + dir + "false folder")
                raise Exception

def check_dirs(path, dirs):
    if type(dirs) != list:
        dirs = [dirs]
    for d in dirs:
        new_path = os.path.join(path, d)
        if not os.path.exists(new_path):
            os.makedirs(new_path)