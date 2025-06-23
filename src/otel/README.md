# Running Open Telemetry Collector in Docker container  
Execute the following command  
```
docker run -d --name jaeger  -e COLLECTOR_ZIPKIN_HOST_PORT=:9411 -p 4317:4317 -p 4318:4318 -p 5775:5775/udp  -p 6831:6831/udp -p 6832:6832/udp  -p 5778:5778  -p 16686:16686  -p 14250:14250 -p 14268:14268 -p 14269:14269 -p 9411:9411 jaegertracing/all-in-one:latest  
```

## Reference  
https://medium.com/@team_Aspecto/get-started-with-opentelemetry-python-a-practical-guide-4435c91161b9
