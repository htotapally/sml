import os.path
import configparser
import psycopg2
import json

from kafka import KafkaProducer

class OrderDispatcher():
    # Kafka Configuration
    bootstrap_servers = ['localhost:9092']  # Replace with your Kafka broker address
    topic_name = 'TutorialTopic'
    ready = True    
    
    # Postgres Configuration
    database = "template1"
    user = "postgres"
    password = "REPLACEME"
    host = "192.168.1.170"
    port = 5432
    
    def __init__(self, dispconf):
      super().__init__()
      print (dispconf)
      config = configparser.ConfigParser()
      config.read(dispconf)
      topic = config.get('kafka', 'topic')
      print(topic)
      bootstrap = config.get('kafka', 'bootstrap')
      print (bootstrap)
      
      # Set Kafka configuration
      self.topic_name = topic
      self.bootstrap_servers = eval(bootstrap)

      # Set postgres configuration
      self.database = config.get('postgres', 'database')
      self.user = config.get('postgres', 'user')
      self.password = config.get('postgres', 'password')
      self.host = config.get('postgres', 'host')
      self.port = config.get('postgres', 'port')
          
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
      conn = self.getconn() # psycopg2.connect(database="template1", user="postgres", password="REPLACEME", host="192.168.1.170", port="5432")
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

    def getconn(self):
      conn = psycopg2.connect(database=self.database, user=self.user, password=self.password, host=self.host, port=self.port)
      return conn
            
def main(args=None):
    print("Starting order dispatcher!")
    dispconf = os.path.join(os.path.dirname(__file__), 'dispconf.conf')
    try:
      print('Within the try block')  
      orderDispatcher = OrderDispatcher(dispconf)
      orderDispatcher.dispatchorders()
      print('After dispatchorders')
    except (KeyboardInterrupt):
        pass


if __name__ == '__main__':
    main()    
