import psycopg2
import uuid
import json
import os.path
import configparser
from datetime import datetime

from opentelemetry import trace
from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter
from opentelemetry.sdk.resources import SERVICE_NAME, Resource
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.sdk.trace.export import ConsoleSpanExporter

from base import Session, engine, Base
from onlineorder import OnlineOrder
from orderdetails import OrderDetails

class OrderSvc:
    def __init__(self, config):
      # Set postgres configuration
      self.database = config.get('postgres', 'database')
      self.user = config.get('postgres', 'user')
      self.password = config.get('postgres', 'password')
      self.host = config.get('postgres', 'host')
      self.port = config.get('postgres', 'port')        
      pass
        
    def getorders(self):
      ordereditems = []
      session = Session()

      onlineorders = session.query(OnlineOrder).filter_by(status='Created').all()
      print('Printing onlineorders')
      for onlineorder in onlineorders:
        print(onlineorder.to_dict())
        ordereditems.append(onlineorder.to_dict())

      return ordereditems
      
    def getorder(self, orderid):
      session = Session()
      print(orderid)
      x = str(orderid)
      orderdetails = session.query(OrderDetails).filter_by(orderid=orderid).all()

      ordereditems = []
      for details in orderdetails:
          print(details)
          ordereditems.append(details.to_dict())

      return ordereditems
  
    def placeorder(self, cart):
        dict = json.loads(cart)
        itemids = dict.keys()
        itemsordered = []
        orderid = uuid.uuid4()
        conn = self.getconn()
        current_dt = datetime.now()

        with tracer.start_as_current_span("OrderServiceSpan"):
            with tracer.start_as_current_span("CreateOrderSpan") as parent_span:
                parent_span.add_event("Creating new order.", {
                    "message_type": "info",
                    "OrderId": orderid
                })

        session = Session()
  
        onlineorder = OnlineOrder(current_dt, str(orderid), 'Created')
        session.add(onlineorder)

        for itemid in itemids:
            lineitems = dict[itemid]
            lineitem = json.loads(json.dumps(lineitems))
            qty = lineitem["qty"]
            product = json.loads(json.dumps(lineitem["item"]))
            productId = product["Item Id"]
            regprice = product["Regular Price"]
            promoprice = product["Promotional Price"]
            sale = saleprice(regprice, promoprice)
            itemOrdered = [productId, qty, sale];

            orderdetails = OrderDetails(current_dt, str(orderid), productId, qty, float(sale), 'Created')
            session.add(orderdetails)

 
        session.commit()
        session.close()
                      
        return f'Your order has been successfully received. Please provide orderid: <b>{orderid}</b> for any questions'  

    def acknowledge(self, orderid):
        order = self.getorder(orderid)
        
        sql = """ UPDATE onlineorders
                SET status = %s
                WHERE orderid = %s"""
        updated_row_count = 0

        status = "Acknowledged"                
        try:
          conn = self.getconn()
          with conn:
            with  conn.cursor() as cur:
                # execute the UPDATE statement
                cur.execute(sql, (status, orderid))
                updated_row_count = cur.rowcount

                # commit the changes to the database
                conn.commit()
        except (Exception, psycopg2.DatabaseError) as error:
          print(error)
        finally:
          return f'Order {orderid} with {updated_row_count} items is acknowledged'
      
    def complete(self, orderid):
        order = self.getorder(orderid)
        
        sql = """ UPDATE onlineorders
                SET status = %s
                WHERE orderid = %s"""
        updated_row_count = 0

        status = "Completed"                
        try:
            conn = self.getconn()
            with  conn.cursor() as cur:
                # execute the UPDATE statement
                cur.execute(sql, (status, orderid))
                updated_row_count = cur.rowcount

                # commit the changes to the database
                conn.commit()
        except (Exception, psycopg2.DatabaseError) as error:
          print(error)
        finally:
          return f'Order {orderid} with {updated_row_count} items is {status}'      

    def getconn(self):
      conn = psycopg2.connect(database=self.database, user=self.user, password=self.password, host=self.host, port=self.port)
      return conn
      
def saleprice(item):
    print(item.get('itemId'))
    regular = item.get('price').get('regular')
    promo = item.get('price').get('promo')
    ag = f"regular: {regular}, promo: {promo}"  
    print (ag)
    if promo > 0:
      m = min(float(regular), float(promo))
    else:
      m = regular
      
    return m

def saleprice(regular, promo):
    if promo > 0:
      m = min(float(regular), float(promo))
    else:
      m = regular
      
    return m

provider = TracerProvider(
  resource = Resource.create({SERVICE_NAME: "OrderService"})
)

processor = BatchSpanProcessor(ConsoleSpanExporter())
provider.add_span_processor(processor)
trace.set_tracer_provider(provider)
tracer = trace.get_tracer(__name__)

otlp_exporter = OTLPSpanExporter(                                                 
  endpoint = "http://192.168.1.170:4318/v1/traces"                                  
)                                                                                   

confpath = os.path.join(os.path.dirname(__file__), '/config/ordsvc.conf')
print(confpath)
                                                                                    
if os.path.exists(confpath):                
    print("Recreating the exporter")                                                
    config = configparser.ConfigParser()                                            
    config.read(confpath)
    oltpExporterEndpoint = config.get('OTLPSpanExporter', 'oltpExporterEndpoint')   
    print(oltpExporterEndpoint)                                                     
    otlp_exporter = OTLPSpanExporter(                                             
        endpoint = oltpExporterEndpoint                                             
    )

trace.get_tracer_provider().add_span_processor(
   BatchSpanProcessor(otlp_exporter)
)
