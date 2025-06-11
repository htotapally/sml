Build docker container for static content

Datastore for products
Products are currently provided based on the file docs.json.  For updating the inventory update docs.json


Building Docker image


sudo docker build -t prodprovider .

Running Docker
sudo docker run --name prodprovider -d -p 8080:8080 prodprovider

Accessing the services directly
http://locahost:8080/

Viewing docker logs
sudo docker logs prodprovider
