import os.path
import configparser
import json
import requests

from kafka import KafkaProducer

class OrderDispatcher():
    # Kafka Configuration
    bootstrap_servers = ['localhost:9092']  # Replace with your Kafka broker address
    topic_name = 'TutorialTopic'
    ordersurl = 'http://localhost/os/getorders'
    ready = True    
    
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
      
      # Url to fetch unfilled orders
      self.ordersurl = config.get('orders', 'ordersurl')

    def dispatchorders(self):
      orders = self.getorders()
      
      for order in orders:
          # if self.ready:
          print ('Dispatching order')
          self.dispatchorder(order)
          print ('Dispatched order')
      
        
    def dispatchorder(self, cart):

        print(cart)
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
      print ('Executing getorders')
      ordersurl = self.ordersurl
      resp = requests.get(ordersurl)
      ordereditems = json.loads(resp.text)
      print ('returning ordereditems')
      return ordereditems
            
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
