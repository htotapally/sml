Please update config in server.js till code is adjusted to read from .env file

```
docker build -t htotapally/storovapi .  
```

```
docker run --name storovapi -d -p 3000:3000 htotapally/storovapi  
```

```
docker logs storovapi  
```

```
curl http://localhost:3000/  
```
