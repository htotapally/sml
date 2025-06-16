FROM python:3.10-alpine
MAINTAINER Hara Totapally
LABEL version="0.1"

COPY requirements.txt requirements.txt 
RUN pip install -r requirements.txt

COPY orderdispatcher.py orderdispatcher.py
COPY dispconf.conf /config/dispconf.conf
COPY crontab crontab

RUN crontab crontab

CMD ["crond", "-f"]
