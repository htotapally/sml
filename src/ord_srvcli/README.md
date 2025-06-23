# This package contains Robot code  

## Build the package  
Open a terminal, and navigate to the folder <ROS Workspace>.  Execute the colcon build comand:  
```
colcon build
```

This would create the required packages to run the robot(s).

## Running robot  

Open a terminal, and execute the commands:  
```
source <ROS Workspace>/install/setup.bash
ros2 run ord_srvcli robot
```
