Update connection info in orderstatusupdater.py  

Bulding docker image  
sudo docker build -t htotapally/orderstatusupdater .

Running docker image
sudo docker run --name orderstatusupdater --network host orderstatusupdater

Viewing docker logs
sudo docker logs orderstatusupdater
