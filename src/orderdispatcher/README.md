Build docker container for static content

sudo docker build -t orderdispatcher .

sudo docker image ls

sudo docker run --name orderdispatcher --network host orderdispatcher

sudo docker logs orderdispatcher

pg_isready -d template1 -h 192.168.1.170 -p 5432 -U postgres   
