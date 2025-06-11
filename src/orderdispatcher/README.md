Update connection info in orderdispatcher.py

conn = psycopg2.connect(database="template1", user="postgres", password="<REPLACEME>", host="192.168.1.170", port="5432")

Bulding docker image
sudo docker build -t orderdispatcher .

Running docker image
sudo docker run --name orderdispatcher --network host orderdispatcher

Viewing docker logs
sudo docker logs orderdispatcher
