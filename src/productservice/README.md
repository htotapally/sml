Update config file env with environment specific values.  
Rename the file env to .env (make is hidden).  
Create docker image  
```
docker build -t htotapally/productapi  .  
```
Create docker container  
```
docker run --name productapi -d -p 3000:3000 htotapally/productapi   
```
Tail log file  
```
docker logs storovapi  --follow  
```
Test if the container is running by executing the curl command
```
curl http://localhost:3000/  
```
The output, Welcome to the Storov API! confirms the functioning of the api server
