Work in progress

Kafka broker can be run by installing Kafka on development workstation or as a docker container.  The instructions are the same for both Kafka running on dev system or docker container.  

Running on development system  
Install Kafka  
Run kafka  

Running using Docker images  
docker run -d -p 9092:9092 --name broker -v ./kafka-data:/var/lib/kafka/data apache/kafka:latest  

Kafka Topics  
TutorialTopic, and OrderStatus are the names of the topic used for the proof of concept  

Instructions for creating kafka topics  
/home/kafka/kafka/bin/kafka-topics.sh --create --bootstrap-server localhost:9092 --replication-factor 1 --partitions 1 --topic TutorialTopic  

/home/kafka/kafka/bin/kafka-topics.sh --create --bootstrap-server localhost:9092 --replication-factor 1 --partitions 1 --topic OrderStatus  

Reading messages from a Kafka Topic  
/home/kafka/kafka/bin/kafka-console-consumer.sh --bootstrap-server localhost:9092 --topic OrderStatus --from-beginning   
