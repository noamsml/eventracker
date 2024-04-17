from pydantic import BaseModel, Field
from enum import StrEnum, auto
from functools import cache
import os

class Env(StrEnum):
    development = auto()
    test = auto()

@cache
def env() -> Env:
   return Env[os.environ.get('ENV', "development")]

class DatabaseConfig(BaseModel):
    db_name: str | None = None
    host: str = "localhost"
    port: int = 3306
    username: str
    # Obvi down the line this should live in something like confidant
    password: str

class Config(BaseModel):
    database: DatabaseConfig

@cache
def config(force_env: Env | None = None):
    e = force_env or env()
    filename = os.path.join(os.path.dirname(__file__), "config", "{}.json".format(e))
    with open(filename) as config_file:
        data = config_file.read()
    config = Config.model_validate_json(data)

    if not config.database.db_name:
        config.database.db_name = "sheets_{}".format(e)

    return config