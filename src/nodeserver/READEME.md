docker build -t htotapally/storovapi .
docker run --name storovapi -d -p 3000:3000 htotapally/storovapi
docker logs storovapi
curl http://localhost:3000/
