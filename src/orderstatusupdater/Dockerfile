FROM python:3.10-alpine
MAINTAINER Hara Totapally
LABEL version="0.1"

COPY requirements.txt requirements.txt 
RUN pip install -r requirements.txt

COPY orderstatusupdater.py orderstatusupdater.py
COPY dispconf.conf dispconf.conf

ENTRYPOINT ["python3", "orderstatusupdater.py"]
