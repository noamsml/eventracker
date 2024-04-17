#!/usr/local/env python

import googleauth

def main():
  googleauth.initializeCredentials()
  print("Success!")

if __name__ == "__main__":
  main()