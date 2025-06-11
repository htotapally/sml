Work in progress

Currently run on local system.

TutorialTopic, and OrderStatus are the names of the topic used for the proof of concept

Instructions for creating kafka topics
/home/kafka/kafka/bin/kafka-topics.sh --create --bootstrap-server localhost:9092 --replication-factor 1 --partitions 1 --topic TutorialTopic

/home/kafka/kafka/bin/kafka-topics.sh --create --bootstrap-server localhost:9092 --replication-factor 1 --partitions 1 --topic OrderStatus

Reading messages from a Kafka Topic 
/home/kafka/kafka/bin/kafka-console-consumer.sh --bootstrap-server localhost:9092 --topic OrderStatus --from-beginning
