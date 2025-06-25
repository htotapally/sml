import cherrypy
import json
import os.path
import configparser
import requests

from opentelemetry import trace
from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter
from opentelemetry.sdk.resources import SERVICE_NAME, Resource
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.sdk.trace.export import ConsoleSpanExporter

class ProductSvc:
    
    def __init__(self, solrendpoint, solrcollection):
        self.solrendpoint = solrendpoint
        self.solrcollection = solrcollection
        pass
        
    def get_allitems(self):
        resp = requests.get(solrUrl.format(self.solrendpoint, self.solrcollection))
        data = json.loads(resp.text)
        docs = data.get('response').get('docs')
        print ("Logging to OTLP Collector")
        with tracer.start_as_current_span("SearchSpan"):
            with tracer.start_as_current_span("SearchAllSpan") as parent_span:
                parent_span.add_event("Searching for all items.", {
                    "message_type": "info"
                })
                         
        return docs    
    
    @cherrypy.expose
    @cherrypy.tools.json_out()    
    def getitem(self, searchText):
        with tracer.start_as_current_span("SearchSpan"):
            with tracer.start_as_current_span("SearchByFilterSpan") as parent_span:
                parent_span.add_event("Searching by filter.", {
                    "message_type": "info",
                    "SearchText": searchText
                })


        filterQuery = '&' + allFieldsFilter('detailedDescription', searchText)
        print(filterQuery)

        filter = filterUrl.format(self.solrendpoint, self.solrcollection, filterQuery)               
        print(filter)
        resp = requests.get(filter)
        data = json.loads(resp.text)
        docs = data.get('response').get('docs')
        return docs
        
def createFilter(queryField, searchText):
    query = '&q.op=OR&q={}%3A{}*'
    return query.format(queryField, searchText)

def detailedDescriptionFilter(searchText):
    query = 'q=detailedDescription:{}*'
    return query.format(searchText)

def allFieldsFilter(brand, searchText):
    query = 'q={}:{}*'
    return query.format(brand, searchText)

def operationFilter():
    query = 'q.op=OR'  
    return query
# used for getting allitems
solrUrl = '{}/{}/select?indent=true&q.op=OR&q=*%3A*&useParams='

# used for filtering based on search text across multiple fields
filterUrl = '{}/{}/select?debugQuery=false&indent=true&q.op=OR{}&useParams='

provider = TracerProvider(
  resource = Resource.create({SERVICE_NAME: "ProductProviderService"})
)

processor = BatchSpanProcessor(ConsoleSpanExporter())
provider.add_span_processor(processor)
trace.set_tracer_provider(provider)
tracer = trace.get_tracer(__name__)

otlp_exporter = OTLPSpanExporter(                                                 
  endpoint = "http://192.168.1.170:4318/v1/traces"                                  
)                                                                                   

confpath = os.path.join(os.path.dirname(__file__), '/config/webserver.conf')
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
