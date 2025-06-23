# Building docker image  
```
docker build -t htotapally/haproxy .  
```  
## Running haproxy docker image  
```
docker run -d --name haproxy -p 80:80 -p 8404:8404 htotapally/haproxy
```

## Stopping haproxy docker image  
```
docker stop haproxy
```

## Removing haproxy docker container  
```
docker rm haproxy
```

## Proxy configuration file  
haproxy.cfg, self explanatory  

Reference Documentation  
https://www.haproxy.com/blog/how-to-run-haproxy-with-docker


