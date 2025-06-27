# coding=utf-8
import configparser
import os.path

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
# coding=utf-8

from sqlalchemy import Column, String, Integer, Date, Numeric
from sqlalchemy.types import Uuid # Import the Uuid type
from sqlalchemy.orm import Mapped, mapped_column, DeclarativeBase
from datetime import datetime

ordsvcconf = os.path.join(os.path.dirname(__file__), '/config/ordsvc.conf')

config = configparser.ConfigParser()
config.read(ordsvcconf)

database = config.get('postgres', 'database')
user = config.get('postgres', 'user')
password = config.get('postgres', 'password')
host = config.get('postgres', 'host')
port = config.getint('postgres', 'port')

engine = create_engine(f'postgresql://{user}:{password}@{host}:{port}/{database}')
Session = sessionmaker(bind=engine)

Base = declarative_base()
