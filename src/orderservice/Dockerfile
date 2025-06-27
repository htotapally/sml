FROM python:3.10-alpine
MAINTAINER Hara Totapally
LABEL version="0.1"

COPY requirements.txt requirements.txt 
RUN apk add --no-cache postgresql-dev gcc musl-dev
RUN pip install -r requirements.txt

COPY webserver.py webserver.py
COPY ordersvc.py ordersvc.py
COPY base.py base.py
COPY onlineorder.py onlineorder.py
COPY orderdetails.py orderdetails.py
COPY webserver.conf /config/webserver.conf
COPY ordsvc.conf /config/ordsvc.conf

ENTRYPOINT ["python3", "webserver.py"]
