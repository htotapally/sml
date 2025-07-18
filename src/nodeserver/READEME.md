Update config file env with environment specific values.  
Rename the file env to .env (make is hidden).  
Create docker image  
```
docker build -t htotapally/storovapi .  
```
Create docker container  
```
docker run --name storovapi -d -p 3000:3000 htotapally/storovapi  
```
Tail log file  
```
docker logs storovapi  --follow  
```
Test if the container is running by executing the curl command
```
curl http://localhost:3000/  
```
