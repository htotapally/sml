import os.path
import configparser
import json
import requests
import threading

from kafka import KafkaConsumer

class OrderStatusUpdater():
    def __init__(self):
      super().__init__()

def process_message(message, orderupdateurl):
    # Custom message processing logic
    print(f"Processing message: {message.value}")
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
    dispconf = os.path.join(os.path.dirname(__file__), 'dispconf.conf')
      
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

if __name__ == '__main__':
    main()    
