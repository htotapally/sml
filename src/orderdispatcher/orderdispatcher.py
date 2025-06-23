import os.path
import configparser
import json
import requests

from kafka import KafkaProducer

from opentelemetry import trace
from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter
from opentelemetry.sdk.resources import SERVICE_NAME, Resource
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.sdk.trace.export import ConsoleSpanExporter


class OrderDispatcher():

    # Kafka Configuration
    bootstrap_servers = ['localhost:9092']  # Replace with your Kafka broker address
    topic_name = 'TutorialTopic'
    ordersurl = 'http://localhost/os/getorders'
    ready = True    
    
    def __init__(self, dispconf):
      super().__init__()

      with tracer.start_as_current_span("Initializaing"):
          print (dispconf)

      config = configparser.ConfigParser()
      config.read(dispconf)
      topic = config.get('kafka', 'topic')
      bootstrap = config.get('kafka', 'bootstrap')
      with tracer.start_as_current_span("Kafka Configuration") as parent_span:
          print(topic)
          print (bootstrap)
          parent_span.set_attribute("topic", topic)
          parent_span.set_attribute("bootstrap", bootstrap)
      
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

        # Extract orderid from cart
        orderid = ['orderid']
        print("Executing dispatch")
        with tracer.start_as_current_span("dispatchSpan"):
            with tracer.start_as_current_span("childSpan") as parent_span:
                parent_span.add_event("Dispatching order.", {
                    "message_type": "info",
                    "orderid": orderid
                }) 
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

provider = TracerProvider(
  resource = Resource.create({SERVICE_NAME: "OrderDispatcherService"})
)

processor = BatchSpanProcessor(ConsoleSpanExporter())
provider.add_span_processor(processor)
trace.set_tracer_provider(provider)
tracer = trace.get_tracer(__name__)

jaeger_exporter = OTLPSpanExporter(                                                 
  endpoint = "http://192.168.1.170:4318/v1/traces"                                  
)                                                                                   
                                                                                    
if os.path.join(os.path.dirname(__file__), '/config/dispconf.conf'):                
    dispconf = os.path.join(os.path.dirname(__file__), '/config/dispconf.conf')     
    print("Recreating the exporter")                                                
    config = configparser.ConfigParser()                                            
    config.read(dispconf)                                                           
    oltpExporterEndpoint = config.get('OTLPSpanExporter', 'oltpExporterEndpoint')   
    print(oltpExporterEndpoint)                                                     
    jaeger_exporter = OTLPSpanExporter(                                             
        endpoint = oltpExporterEndpoint                                             
    ) 

trace.get_tracer_provider().add_span_processor(
   BatchSpanProcessor(jaeger_exporter)
)
            
def main(args=None):
    with tracer.start_as_current_span("Initializaing Main") as parent_span:
      print("Starting order dispatcher!")
      parent_span.set_attribute("Message", "Initializing Main")

    if os.path.join(os.path.dirname(__file__), '/config/dispconf.conf'):
      dispconf = os.path.join(os.path.dirname(__file__), '/config/dispconf.conf')
    try:
      print('Within the try block')  
      orderDispatcher = OrderDispatcher(dispconf)
      orderDispatcher.dispatchorders()
      print('After dispatchorders')
    except (KeyboardInterrupt):
        pass

if __name__ == '__main__':
    main()    
