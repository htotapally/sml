This package contains Robot code

Build the package
Open a terminal, and navigate to the folder <ROS Workspace>.  Execute the colcon build comand:
colcon build

This would create the required packages to run the robotmanager.

Running robot

open a terminal
execute the commands:
source <ROS Workspace>/install/setup.bash // This would source the executables to the current terminal
ros2 run ord_srvcli robot // This would run robot which sends call back messages to robotmanager

