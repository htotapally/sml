Build docker image for orderclient

sudo docker build -t orderclient .

contains code for both robotmanager, and robot

Launching robotmanager:

docker run -it --name robotmanager --network=host -v ~/ros2_ws:/ros2_ws orderclient
from the default directory, /ros2_ws# run 
source install/setup.bash
ros2 run py_srvcli robotmanager

sudo docker logs robot

docker run -it --name robot --network=host -v ~/ros2_ws:/ros2_ws orderclient
from the default directory, /ros2_ws# run 
source install/setup.bash
ros2 run py_srvcli robotmanager

sudo docker logs robotmanager

docker startup entry would be simplified
