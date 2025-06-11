Update connection info in ordersvc.py

conn = psycopg2.connect(database="template1", user="postgres", password="<REPLACEME>", host="192.168.1.170", port="5432")
      

Building Docker image
sudo docker build -t orderservice .

Running Docker image
sudo docker run --name orderservice -d -p 8090:8090 orderservice

Accessing services directly
http://locahost:8090/

Viewing container logs
sudo docker logs orderservice

pg_isready -d template1 -h 192.168.1.170 -p 5432 -U postgres   
