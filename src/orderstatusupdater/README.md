Update connection info in orderdispatcher.py

Bulding docker image
sudo docker build -t orderdispatcher .

Running docker image
sudo docker run --name orderdispatcher --network host orderdispatcher

Viewing docker logs
sudo docker logs orderdispatcher
