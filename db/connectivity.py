from sqlalchemy import create_engine
from sqlalchemy import Engine
from sqlalchemy import URL
from sqlalchemy.pool import StaticPool
from functools import cache

import config
import db.model


@cache
def memory_db() -> Engine:
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    db.model.Base.metadata.create_all(engine)
    return engine


def make_db_engine(force_env: config.Env | None = None) -> Engine:
    db_config = config.config(force_env).database
    if db_config == config.SpecialDatabase.memory:
        return memory_db()

    url = URL.create(
        "mysql",
        username=db_config.get_username(),
        password=db_config.get_password(),
        host=db_config.host,
        port=db_config.port,
        database=db_config.db_name,
    )

    return create_engine(url)
