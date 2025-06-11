Work in progress

Requirements
postgres
configured with a starter database, and configured for network access.  This will be moved into its own docker container later

kafka
configured with the required topics.  This will be moved into its own docker later

Directory structure

haproxy

kafka

orderclient

orderdispatcher

orderservice

postgres

productprovider

py_srvcli

py_srvcli_interface

web


Buliding for development purposes

Each directory has README.md file for building and running docker images
1. Build the action interface defined in py_srvcli_interface
2. Build py_srvcli
3. Create docker images for orderclient(robotmanager), orderservice(robot)
4. Create all other docker images





