Robots are managed by this package.

Build the package
Open a terminal, and navigate to the folder <ROS Workspace>.  Execute the colcon build comand:
colcon build

This would create the required packages to run the robotmanager.

Running robomanager

open a terminal
execute the commands:
source <ROS Workspace>/install/setup.bash // This would source the executables to the current terminal
ros2 run ord_srv_mgr robotmanager // This would run robotmanager which can communicate with robot

