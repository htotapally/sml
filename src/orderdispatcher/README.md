## Bulding docker image  
Update dispconf.conf with environment specific values  
```
docker build -t htotapally/orderdispatcher .  
```

## Running docker image  
```
docker run --name htotapally/orderdispatcher --network host orderdispatcher
```

## Viewing docker logs  
```
docker logs orderdispatcher
```
