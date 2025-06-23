import os.path
import configparser
import json
import requests
import threading

from kafka import KafkaConsumer

from opentelemetry import trace
from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter
from opentelemetry.sdk.resources import SERVICE_NAME, Resource
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.sdk.trace.export import ConsoleSpanExporter

class OrderStatusUpdater():
    def __init__(self):
      super().__init__()

def process_message(message, orderupdateurl):
    # Custom message processing logic
    print(f"Processing message: {message.value}")
    with tracer.start_as_current_span("UpdateSpan"):
        with tracer.start_as_current_span("childSpan") as parent_span:
            parent_span.add_event("Dispatching order.", {
                "message_type": "info",
                    "message": message.value
                }) 

    data = json.loads(message.value)
    orderid = data['orderid']
    print(orderid)
    params = {
      "orderid": orderid
    }
    resp = requests.get(orderupdateurl, params)
    response = json.loads(resp.text)
    print(response)
    return response    

def consumer_thread(topic, bootstrap_servers, orderupdateurl):
    consumer = KafkaConsumer(
        topic,
        bootstrap_servers=bootstrap_servers
    )

    try:
        for message in consumer:
            process_message(message, orderupdateurl)
    except Exception as e:
        print(f"Error during message consumption: {e}")
    finally:
        consumer.close()
                        
def main(args=None):
    print("Starting order OrderStatusUpdater!")
    dispconf = os.path.join(os.path.dirname(__file__), '/config/dispconf.conf')
      
    print (dispconf)
    config = configparser.ConfigParser()
    config.read(dispconf)
    topic_name = config.get('kafka', 'topic')
    print(topic_name)
    bootstrap_servers = config.get('kafka', 'bootstrap')
    print (bootstrap_servers)
    orderupdateurl = config.get('orders', 'orderupdateurl')
    print(orderupdateurl)          
    bootstrap_servers_list = eval(bootstrap_servers)
    group_id_string = 'my-group'
    num_threads = 1

    threads = []
    for _ in range(num_threads):
        thread = threading.Thread(target=consumer_thread,
                                  args=(topic_name, bootstrap_servers_list, orderupdateurl))
        threads.append(thread)
        thread.start()

    for thread in threads:
        thread.join()

provider = TracerProvider(
  resource = Resource.create({SERVICE_NAME: "OrderStatusUpdaterService"})
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

if __name__ == '__main__':
    main()    
