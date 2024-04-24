import sys
import os
BASEPATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))

def script_init():
    sys.path.insert(0, BASEPATH)
    os.chdir(BASEPATH)