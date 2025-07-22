Update config file env with environment specific values.  
Rename the file env to .env (make is hidden).  
Create docker image  
```
docker build -t htotapally/reportsvc .  
```
Create docker container  
```
docker run --name reportsvc -d -p 3001:3001 htotapally/reportsvc  
```
Tail log file  
```
docker logs reportsvc  --follow  
```
Test if the container is running by executing the curl command
```
curl http://localhost:3001/  
```
The output, Welcome to the Storov API! confirms the functioning of the api server
