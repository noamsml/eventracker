from sqlalchemy import create_engine
from sqlalchemy import Engine
from sqlalchemy import URL

import config


def make_db_engine(force_env: config.Env | None = None):
    db_config = config.config(force_env).database
    url = URL.create(
        "mysql",
        username=db_config.username,
        password=db_config.password,
        host=db_config.host,
        port=db_config.port,
        database=db_config.db_name,
    )

    return create_engine(url)
