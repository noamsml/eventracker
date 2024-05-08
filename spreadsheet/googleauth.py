import os.path

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from google.oauth2 import service_account

import config

SCOPES = ["https://www.googleapis.com/auth/spreadsheets.readonly"]
TOKENFILE = "config/credentials/googletoken.json"
CLIENTSECRETFILE = "config/credentials/googleclientsecret.json"

def retrieveCredentialsForUse() -> Credentials:
  creds = _retrieveOrRefreshCredentials()

  _validateCredentials(creds)
  
  _persistCredentials(creds)
  return creds

def initializeCredentials() -> Credentials:
  cnf = config.config()

  if cnf.google_token:
    print("Cannot initial credentials when using set google token fil.")
    return
  
  creds = _retrieveOrRefreshCredentials()

  if not _areCredentialsValid(creds):
    flow = InstalledAppFlow.from_client_secrets_file(
            CLIENTSECRETFILE, SCOPES
        )
    
    creds = flow.run_local_server(port=0)

  _validateCredentials(creds)
  _persistCredentials(creds)
  return creds

def _persistCredentials(credentials: Credentials) -> None:
  cnf = config.config()

  if cnf.google_token:
    print("Google tokenfile set in config. Not writing.")
    return
  
  with open(TOKENFILE, "w") as token:
      token.write(credentials.to_json())

def _retrieveOrRefreshCredentials() -> Credentials | None:
  cnf = config.config()

  if cnf.google_token:
    return service_account.Credentials.from_service_account_file(cnf.google_token)

  creds = None
  # The file token.json stores the user's access and refresh tokens, and is
  # created automatically when the authorization flow completes for the first
  # time.
  if os.path.exists(TOKENFILE):
    creds = Credentials.from_authorized_user_file(TOKENFILE, SCOPES)

  if creds and creds.expired and creds.refresh_token:
    creds.refresh(Request())

  return creds

def _validateCredentials(credentials: Credentials | None) -> None:
  if not _areCredentialsValid(credentials):
    raise Exception("Invalid or unavailable credentials!")

def _areCredentialsValid(credentials: Credentials | None) -> bool:
  return credentials and (isinstance(credentials, service_account.Credentials) or credentials.valid)