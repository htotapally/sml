Build docker container for static content

sudo docker build -t prodprovider .

sudo docker image ls

$ sudo docker run --name prodprovider -d -p 8080:8080 prodprovider

http://locahost:8080/

sudo docker logs prodprovider
