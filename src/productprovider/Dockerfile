FROM frolvlad/alpine-python3
MAINTAINER Hara Totapally
LABEL version="0.1"

COPY requirements.txt requirements.txt 
RUN pip install -r requirements.txt

COPY webserver.py webserver.py
COPY productsvc.py productsvc.py
COPY webserver.conf /config/webserver.conf
COPY docs.json /products/docs.json
ENTRYPOINT ["python3", "webserver.py"]
