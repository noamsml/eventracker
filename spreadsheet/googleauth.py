import os.path

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

SCOPES = ["https://www.googleapis.com/auth/spreadsheets.readonly"]
TOKENFILE = "config/googletoken.json"
CLIENTSECRETFILE = "config/googleclientsecret.json"

def retrieveCredentialsForUse() -> Credentials:
  creds = _retrieveOrRefreshCredentials()

  _validateCredentials(creds)
  
  _persistCredentials(creds)
  return creds

def initializeCredentials() -> Credentials:
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
  with open(TOKENFILE, "w") as token:
      token.write(credentials.to_json())

def _retrieveOrRefreshCredentials() -> Credentials | None:
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
  return credentials and credentials.valid