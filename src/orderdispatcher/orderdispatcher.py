import psycopg2
import json

from kafka import KafkaProducer

class OrderDispatcher():
    # Configuration
    bootstrap_servers = ['localhost:9092']  # Replace with your Kafka broker address
    topic_name = 'TutorialTopic'
    ready = True    
    
    def __init__(self, topic, bootstrap):
      super().__init__()
      self.topic_name = topic
      self.bootstrap_servers = bootstrap

    def dispatchorders(self):
      orders = self.getorders()
      for order in orders:
          if self.ready:
            self.dispatchorder(order)

    def dispatchorder(self, cart):

        # Create a Kafka producer instance
        producer = KafkaProducer(
            bootstrap_servers = self.bootstrap_servers,
            value_serializer=lambda x: json.dumps(x).encode('utf-8')
        )

        print("Executing dispatch")
        # Send message to Kafka
        try:
            print("Sending message!")
            producer.send(self.topic_name, value=cart)
            producer.flush() # Ensure message is sent
            print("Message sent successfully!")
            self.ready = False
        except Exception as e:
            print(f"Error sending message: {e}")
        finally:
            producer.close()        

    def getorders(self):
      conn = psycopg2.connect(database="template1", user="postgres", password="REPLACEME", host="192.168.1.170", port="5432")
      with conn:
        cur = conn.cursor()
        qry = """
            select to_json (json_build_object('id', id, 'createtime', createtime,'orderid', orderid,'itemid', itemid,'qty', qty,'saleprice', saleprice)) FROM onlineorders WHERE status = 'Created';
        """
        print (f"{qry}")
        
        cur.execute(qry)
        rows = cur.fetchall()
        ordereditems = []
        for row in rows:
          ordereditems.append(row[0])

      return ordereditems
            
def main(args=None):
    print("Starting order dispatcher!")
    try:
      print('Within the try block')  
      orderDispatcher = OrderDispatcher('TutorialTopic', '192.168.1.170:9092')
      orderDispatcher.dispatchorders()
      print('After dispatchorders')
    except (KeyboardInterrupt):
        pass


if __name__ == '__main__':
    main()    
