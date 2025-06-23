Update connection info in orderstatusupdater.py  

## Bulding docker image  
```
docker build -t htotapally/orderstatusupdater .
```

## Running docker image
```
docker run --name orderstatusupdater --network host orderstatusupdater
```

## Viewing docker logs
```
docker logs orderstatusupdater
```
