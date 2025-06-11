FROM python:3.10-alpine
MAINTAINER Hara Totapally
LABEL version="0.1"

COPY requirements.txt requirements.txt 
RUN apk add --no-cache postgresql-dev gcc musl-dev
RUN pip install -r requirements.txt

COPY webserver.py webserver.py
COPY ordersvc.py ordersvc.py
COPY tutorial.conf tutorial.conf

ENTRYPOINT ["python3", "webserver.py"]
