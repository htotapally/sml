## Datastore for products
Products are currently provided based on the file docs.json.  For updating the inventory update docs.json

## Building Docker image  
```
docker build -t htotapally/prodprovider .
```

## Running Docker  
```
docker run --name prodprovider -d -p 8080:8080 htotapally/prodprovider
```

## Accessing the services directly  
```
http://locahost:8080/
```

## Viewing docker logs
```
docker logs prodprovider
```
