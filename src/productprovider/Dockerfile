FROM frolvlad/alpine-python3
MAINTAINER Hara Totapally
LABEL version="0.1"

COPY requirements.txt requirements.txt 
RUN pip install -r requirements.txt

COPY app.py app.py
COPY webserver.py webserver.py
COPY productsvc.py productsvc.py
COPY tutorial.conf tutorial.conf
COPY docs.json docs.json
ENTRYPOINT ["python3", "webserver.py"]
