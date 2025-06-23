# Robots are managed by this package.  

## Build the package  
Open a terminal, and navigate to the folder <ROS Workspace>.  Execute the colcon build comand:
```
colcon build
```

This would create the required packages to run the robotmanager.

## Running robomanager

Open a terminal, and execute the commands:  
```
source <ROS Workspace>/install/setup.bash
ros2 run ord_srv_mgr robotmanager```
