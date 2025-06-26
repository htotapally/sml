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

import uuid

import configparser

from itertools import product

from productsvc import ProductSvc

class WebServer:
    """Rest services for order processing."""
    
    def __init__(self, solrendpoint, solrcollection):
      super().__init__()
      self.solrendpoint = solrendpoint
      self.solrcollection = solrcollection      

    @cherrypy.expose
    def index(self):
        return "ProductService is Alive"
      
    @cherrypy.expose
    @cherrypy.tools.json_out()
    def get_allitems(self):
        cherrypy.response.headers['Access-Control-Allow-Origin'] = '*'
        productsvc = ProductSvc(self.solrendpoint, self.solrcollection)
        return productsvc.get_allitems()
    
    @cherrypy.expose
    @cherrypy.tools.json_out()
    def get_item(self, itemId = '', brand = '',  productName = '', productId = ''):
        productsvc = ProductSvc(self.solrendpoint, self.solrcollection)
        return productsvc.getitem(itemId, brand,  productName, productId)
    
    '''
    @cherrypy.expose
    def get_price(self, itemId = 'PB000005-100G'):
        item = getitem(self.couchurl, itemId)
        print (item)
        print(item.get('itemId'))
        price = saleprice(item)
        print (price)
        return str(price)
    '''
    
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
    
def main():
    cherrypy_cors.install()
    confpath = os.path.join(os.path.dirname(__file__), '/config/webserver.conf')
    print (confpath)

    port = 9080
    host = 'localhost'

    solrendpoint = 'http://192.168.1.170:8983/solr'
    solrcollection = 'sml1'
    
    if os.path.exists(confpath):
        config = configparser.ConfigParser()
        config.read(confpath)
        port = config.getint('global', 'server.socket_port')
        host = config.get('global', 'server.socket_host')
        solrendpoint = config.get('solr', 'solr.endpoint')
        solrcollection = config.get('solr', 'solr.collection')
            
    cherrypy.config.update({'server.socket_port': port, 'server.socket_host': host, 'tools.CORS.on': True })    
    cherrypy.tools.CORS = cherrypy.Tool('before_handler', cors_tool)
    
    cherrypy.quickstart(WebServer(solrendpoint, solrcollection))
    
if __name__ == '__main__':
    # CherryPy always starts with app.root when trying to map request URIs
    # to objects, so we need to mount a request handler root. A request
    # to '/' will be mapped to HelloWorld().index().
    main()
