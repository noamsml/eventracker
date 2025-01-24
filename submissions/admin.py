
from typing import List, Annotated
import api.api_models as api_models
import db.connectivity as connectivity
import db.model as model
import db.access as access
from datetime import date, datetime, timedelta
from sqlalchemy import Engine
import config
from dateutil.tz import gettz
import submissions.converter
from starlette.applications import Starlette
from starlette.responses import JSONResponse, RedirectResponse, HTMLResponse
from starlette.routing import Route
from starlette.requests import Request
from starlette.middleware import Middleware
from starlette.middleware.sessions import SessionMiddleware
from starlette.middleware.authentication import AuthenticationMiddleware
from starlette.exceptions import HTTPException

from starlette.requests import HTTPConnection
from starlette.authentication import AuthenticationBackend, AuthCredentials, BaseUser, requires
import json

from google.auth.transport.requests import Request as GoogleRequest
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from google.oauth2 import service_account

from spreadsheet.googleauth import CLIENTSECRETFILE

SCOPES = ['openid', 'https://www.googleapis.com/auth/userinfo.email',  "https://www.googleapis.com/auth/drive.file"]

OAUTH_NONCE_KEY = "oauth_nonce"
SESSION_ID_KEY = 'session_id'



class GoogleUser(BaseUser): 
    def __init__(self, google_credentials: Credentials):
        self.google_credentials = google_credentials

    @property
    def is_authenticated(self) -> bool:
        return True

    @property
    def display_name(self) -> str:
        return self.credentials.account

    @property
    def identity(self) -> str:
        return self.credentials.account
    
    @property
    def credentials(self) -> str:
        return self.google_credentials


class GoogleAuthenticationBackend(AuthenticationBackend):
  async def authenticate(
        self, conn: HTTPConnection
    ) -> tuple[AuthCredentials, GoogleUser] | None:
        user_id = self.conn.session[SESSION_ID_KEY]

        if not user_id:
            return
        
        user = access.get_user(user_id)

        if not user:
            return
        
        credentials = Credentials.from_authorized_user_info(json.loads(user))

        if credentials.expired and credentials.refresh_token:
            # TODO(noam): Support asynchronous pattern here
            credentials.refresh(GoogleRequest())
            
            access.update_user(user_id, credentials.to_json())
        
        return [AuthCredentials(["authenticated"]), GoogleUser(credentials)]


# /submission/auth/start
async def oauth_login_start(request: Request):
    flow = Flow.from_client_secrets_file(
    CLIENTSECRETFILE,
    scopes=SCOPES)

    flow.redirect_uri = config.base_url + "/submission/auth/complete"
  
    authorization_url, state = flow.authorization_url(
        access_type='offline',
        # Enable incremental authorization. Recommended as a best practice.
        include_granted_scopes='true')
    
    request.session[OAUTH_NONCE_KEY] = state

    return RedirectResponse(authorization_url)
    

# /submission/auth/complete
async def oauth_complete(request: Request):
    oauth_nonce = request.session[OAUTH_NONCE_KEY]

    if oauth_nonce is None:
        raise HTTPException(status_code=400, detail="Login flow disrupted. Try again.")
    
    flow = Flow.from_client_secrets_file(
        CLIENTSECRETFILE,
        scopes=SCOPES,
        state = oauth_nonce)
  
    flow.fetch_token(authorization_response = request.url)
    
    credentials = flow.credentials
    user_id = access.create_user(credentials.to_json())

    request.session[SESSION_ID_KEY] = user_id
    
    return RedirectResponse("/submission/manage")


async def submissions_login_page(request: Request):
    return HTMLResponse("<html><body><a href='/submission/auth/start'>Login with Google</a></body></html>")

@requires("authenticated", redirect="/submissions/login")
async def submission_manage(request: Request):
    return HTMLResponse("<html>Success! Hello {} </html>".format(request.user.credentials.account))



middleware = [
    Middleware(SessionMiddleware, secret_key=config.config().get_submission_session_secret(), https_only=True),
    Middleware(AuthenticationMiddleware, backend=GoogleAuthenticationBackend())
]

routes = [
    Route("/auth/start", oauth_login_start, methods=["GET"]),
    Route("/auth/complete", oauth_complete, methods=["GET"]),
    Route("/login", submissions_login_page, methods=["GET"]),
    Route("/manage", submission_manage, methods=["GET"]),
]

app = Starlette(routes = routes, middleware= middleware)