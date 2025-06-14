Update postgres configuration info in ordsvc.conf
Update webserver configuration in webserver.conf
Update stripe key in webserver.conf.

Building Docker image
sudo docker build -t orderservice .

Running Docker image
sudo docker run --name orderservice -d -p 8090:8090 orderservice

Accessing services directly
http://locahost:8090/

Viewing container logs
sudo docker logs orderservice


pg_isready -d template1 -h 192.168.1.170 -p 5432 -U postgres   
