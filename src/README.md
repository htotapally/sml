# Work in progress
Decoupled Web, and Order Delivery Automation related projects, developed in python  

# Order Delivery Automation Related  
Requirements: ROS2 development environment is setup  

## Directory structure  
1. ord_srvcli  
1. ord_srvcli_interfaces  
1. ord_srv_mgr  

## Building ROS packages  
Checkout the folders  
ord_srvcli  
ord_srvcli_interfaces  
ord_srv_mgr  
into <ROS Workspace>/src  
from a terminal, change working directory to <ROS Workspace>  
Run the build command:  
```
colcon build
The build would create the necessary packages to run delivery automation code.
```

## kafka  
configured with the required topics.  This will be moved into its own docker later  

## Open Telemetry  


# Web Related  
## postgres  
configured with a starter database, and configured for network access.  This will be moved into its own docker container later

## haproxy  

## orderdispatcher

## orderservice  

## productprovider  

# Buliding for development purposes  

Each directory has README.md file. Follow instructions for building and running images/apps  

For running web components run the following docker images:  
haproxy  
kafka  
orderdispatcher  
orderservice  
postgres  
productprovider  
otel  

Once all docker images are run, and docker containers are created and up an running the web front is accessible using the url http://localhost/  

