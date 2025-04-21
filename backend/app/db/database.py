import os
import databases
import sqlalchemy
from sqlalchemy.ext.declarative import declarative_base
from ..core.config import settings

# Database connection
database = databases.Database(settings.DATABASE_URL)

# SQLAlchemy setup
metadata = sqlalchemy.MetaData()

# Define tables
passwords = sqlalchemy.Table(
    "passwords",
    metadata,
    sqlalchemy.Column("id", sqlalchemy.Integer, primary_key=True),
    sqlalchemy.Column("user_id", sqlalchemy.String, index=True),
    sqlalchemy.Column("label", sqlalchemy.String),
    sqlalchemy.Column("encrypted_data", sqlalchemy.Text),
    sqlalchemy.Column("iv", sqlalchemy.Text),
    sqlalchemy.Column("hash", sqlalchemy.Text),
    sqlalchemy.Column("created_at", sqlalchemy.DateTime, server_default=sqlalchemy.func.now()),
    sqlalchemy.Column("updated_at", sqlalchemy.DateTime, server_default=sqlalchemy.func.now(), onupdate=sqlalchemy.func.now())
)

# Create a composite unique constraint on user_id + label
sqlalchemy.UniqueConstraint('user_id', 'label', name='uq_user_label')

# Create tables
engine = sqlalchemy.create_engine(
    settings.DATABASE_URL, connect_args={"check_same_thread": False}
    if settings.DATABASE_URL.startswith("sqlite") else {}
)

# Base model
Base = declarative_base()

# Create tables function
def create_tables():
    metadata.create_all(engine)