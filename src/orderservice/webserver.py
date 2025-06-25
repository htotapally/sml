"""
"""
from tomlkit import items
__requires__ = [
    'cherrypy_cors',
]

import sys
import time
import logging
import ast
import os.path

import cherrypy
import cherrypy_cors

import requests

import urllib3
from urllib3 import request
import json

import psycopg2
import uuid

import stripe

import configparser

from itertools import product

from opentelemetry import trace
from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter
from opentelemetry.sdk.resources import SERVICE_NAME, Resource
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.sdk.trace.export import ConsoleSpanExporter

from ordersvc import OrderSvc

class WebServer:
    """Rest services for order processing."""
    
    def __init__(self):
      super().__init__()      

    @cherrypy.expose
    def index(self):
        return "OrderService is Alive"
    
    @cherrypy.expose
    @cherrypy.tools.json_out()
    def getorders(self):
      orderSvc = self.createordsvc()
      ordereditems = orderSvc.getorders()      
      return ordereditems
    
    @cherrypy.expose
    @cherrypy.tools.json_out()
    def getorder(self, orderid):
      orderSvc = self.createordsvc()
      ordereditems = orderSvc.getorder(orderid)
      return ordereditems
      
    @cherrypy.expose
    @cherrypy.tools.json_out()
    def placeorder(self, cart):
        orderSvc = self.createordsvc()
        message = orderSvc.placeorder(cart);
        return f'{message}'    

    @cherrypy.expose
    @cherrypy.tools.json_out()
    def submit(self, productId, quantity):
        return f'You have ordered {productId} {quantity}'
    
    @cherrypy.expose
    @cherrypy.tools.json_out()
    def acknowledge(self, orderid):
        orderSvc = self.createordsvc()
        message = orderSvc.acknowledge(orderid)
        return message
    
    @cherrypy.expose
    @cherrypy.tools.json_out()
    def complete(self, orderid):
        orderSvc = self.createordsvc()
        message = orderSvc.acknowledge(orderid)
        return message

    @cherrypy.expose
    @cherrypy.tools.json_out()
    def create_payment_intent(self):
        body = cherrypy.request.body.read()
        print(body)
        cart = json.loads(body.decode("utf-8"))
        items = cart.values()
        print (items)
            
        try:
            print("Creating stripe payment intent")
            # Create a PaymentIntent with the order amount and currency
            amount = calculate_order_amount(items)
            intent = stripe.PaymentIntent.create(
                amount = amount, 
                currency = 'usd',
                # In the latest version of the API, specifying the `automatic_payment_methods` parameter is optional because Stripe enables its functionality by default.
                automatic_payment_methods = {
                    'enabled': True,
                },
            )
            print(intent['client_secret'])
            
            with tracer.start_as_current_span("OrderServiceSpan"):
                with tracer.start_as_current_span("CreatePaymentIntentSpan") as parent_span:
                    parent_span.add_event("Stripe clientsecret", {
                        "message_type": "info",
                        "ClientSecret": intent['client_secret']
                    })
                                
            self.placeorder(body)    
            return {'clientSecret': intent['client_secret']}
        except Exception as e:
            print(e) 
            return f'You have ordered' # json.dumps(error=str(e)), 403
    

    def createordsvc(self):
        config = configparser.ConfigParser()
        config.read(ordsvcconf)
        orderSvc = OrderSvc(config)
        return orderSvc
             
def calculate_order_amount(items):
    # Replace this constant with a calculation of the order's amount
    # Calculate the order total on the server to prevent
    # people from directly manipulating the amount on the client
    return int(1400)

def cors_tool():
    '''
    Handle both simple and complex CORS requests
   
    Add CORS headers to each response. If the request is a CORS preflight
    request swap out the default handler with a simple, single-purpose handler
    that verifies the request and provides a valid CORS response.
    '''
    req_head = cherrypy.request.headers
    resp_head = cherrypy.response.headers

    # Always set response headers necessary for 'simple' CORS.
    resp_head['Access-Control-Allow-Origin'] = req_head.get('Origin', '*')
    resp_head['Access-Control-Expose-Headers'] = 'GET, POST'
    resp_head['Access-Control-Allow-Credentials'] = 'true'
   
    # Non-simple CORS preflight request; short-circuit the normal handler.
    if cherrypy.request.method == 'OPTIONS':
        ac_method = req_head.get('Access-Control-Request-Method', None)
  
        allowed_methods = ['GET', 'POST']
        allowed_headers = [
               'Content-Type',
               'X-Auth-Token',
               'X-Requested-With',
        ]
   
        if ac_method and ac_method in allowed_methods:
            resp_head['Access-Control-Allow-Methods'] = ', '.join(allowed_methods)
            resp_head['Access-Control-Allow-Headers'] = ', '.join(allowed_headers)
  
            resp_head['Connection'] = 'keep-alive'
            resp_head['Access-Control-Max-Age'] = '3600'
   
        # CORS requests should short-circuit the other tools.
        cherrypy.response.body = ''.encode('utf8')
        cherrypy.response.status = 200
        cherrypy.serving.request.handler = None
   
        # Needed to avoid the auth_tool check.
        if cherrypy.request.config.get('tools.sessions.on', False):
            cherrypy.session['token'] = True
        return True

webserverconf = os.path.join(os.path.dirname(__file__), '/config/webserver.conf')
ordsvcconf = os.path.join(os.path.dirname(__file__), '/config/ordsvc.conf')

provider = TracerProvider(
  resource = Resource.create({SERVICE_NAME: "OrderServiceWeb"})
)

processor = BatchSpanProcessor(ConsoleSpanExporter())
provider.add_span_processor(processor)
trace.set_tracer_provider(provider)
tracer = trace.get_tracer(__name__)

otlp_exporter = OTLPSpanExporter(                                                 
  endpoint = "http://192.168.1.170:4318/v1/traces"                                  
)                                                                                   
                                                                                    
if os.path.exists(ordsvcconf):
    print("Recreating the exporter")                                                
    config = configparser.ConfigParser()                                            
    config.read(ordsvcconf)
    oltpExporterEndpoint = config.get('OTLPSpanExporter', 'oltpExporterEndpoint')   
    print(oltpExporterEndpoint)                                                     
    otlp_exporter = OTLPSpanExporter(                                             
        endpoint = oltpExporterEndpoint                                             
    )

trace.get_tracer_provider().add_span_processor(
   BatchSpanProcessor(otlp_exporter)
)

def main():
    cherrypy_cors.install()
    config = configparser.ConfigParser()
    config.read(webserverconf)
    
    stripe.api_key = config.get('stripe', 'stripe.api_key')

    port = config.getint('global', 'server.socket_port')
    print(port)
    host = config.get('global', 'server.socket_host')
    print (host)
    cherrypy.config.update({'server.socket_port': port, 'server.socket_host': host, 'tools.CORS.on': True })
          
    cherrypy.tools.CORS = cherrypy.Tool('before_handler', cors_tool)    
    cherrypy.quickstart(WebServer())
    
if __name__ == '__main__':
    # CherryPy always starts with app.root when trying to map request URIs
    # to objects, so we need to mount a request handler root. A request
    # to '/' will be mapped to HelloWorld().index().
    main()
