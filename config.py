from pydantic import BaseModel, Field
from enum import Enum, auto
from functools import cache
import os
from typing import Dict

EVENTRACKER_ID="1eX21lRIMOl3LLUhanRptk0jWbKoyZJVnbsJ-UWP7JZY"

class Env(Enum):
    development = auto()
    test = auto()
    production=auto()
    containerized=auto()

class SpecialDatabase(str, Enum):
    memory = 'memory'

# Absent a DI framework, using a global is the easiest way to force the env to "test" for tests
force_override_env: Env | None = None

def env() -> Env:
   return force_override_env or Env[os.environ.get('ENV', "development")]

class EnvVariable(BaseModel):
    env: str

def coerce_maybe_variable(maybe_env: str | EnvVariable):
    if isinstance(maybe_env, EnvVariable):
            return os.environ[maybe_env.env]

    return maybe_env


class DatabaseConfig(BaseModel):
    db_name: str | None = None
    host: str = "localhost"
    port: int = 3306
    username: str | EnvVariable
    # Obvi down the line this should live in something like confidant
    password: str | EnvVariable

    def get_username(self):
        return coerce_maybe_variable(self.username)

    def get_password(self):
        return coerce_maybe_variable(self.password)

class Config(BaseModel):
    database: DatabaseConfig | SpecialDatabase
    sheet_id: str = EVENTRACKER_ID
    # Configure on new install to avoid importing random junk from 
    # early 2024
    base_row: int = 700
    google_token: str | None = None
    submission_session_secret: str | EnvVariable
    submission_alternate_sheet_id: str = EVENTRACKER_ID
    base_url: str = "https://events.decentered.org"

    def get_submission_session_secret(self):
        return coerce_maybe_variable(self.submission_session_secret)
    
@cache
def config(force_env: Env | None = None):
    e = force_env or env()

    filename_injected = os.path.join(os.path.dirname(__file__), "config", "injected", "{}.json".format(e.name))
    filename_native = os.path.join(os.path.dirname(__file__), "config", "{}.json".format(e.name))

    filename = filename_injected if os.path.exists(filename_injected) else filename_native

    print("Using config file {}".format(filename))

    with open(filename) as config_file:
        data = config_file.read()
    config = Config.model_validate_json(data)

    if isinstance(config.database, DatabaseConfig):
        if not config.database.db_name:
            config.database.db_name = "sheets_{}".format(e.name) 

    return config