#!/usr/local/env python

from script_context import script_init
script_init()

import spreadsheet.googleauth as googleauth

def main():
  googleauth.initializeCredentials()
  print("Success!")

if __name__ == "__main__":
  main()