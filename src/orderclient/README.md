Build docker image for orderclient

sudo docker build -t orderclient .

sudo docker image ls

docker run -it --name orderclient --network=host -v ~/ros2_ws:/ros2_ws orderclient

sudo docker logs orderclient
