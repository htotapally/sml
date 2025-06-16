import cherrypy
import json
import os.path
import requests

class ProductSvc:
    
    def __init__(self):
        demof = os.path.join(os.path.dirname(__file__), '/products/docs.json')        
        f = open(demof)
        self.docs = f.read()        
        pass
        
    def get_allitems(self):
        data = json.loads(self.docs)
        rows = data["rows"]
        return rows    
    
    @cherrypy.expose
    @cherrypy.tools.json_out()    
    def getitem(self, itemId):
        data = json.loads(self.docs)
        rows = data["rows"]
        itemFiltered = None
        for row in rows:
          items = row.get('doc', {}).get('items')
          match = False
          for item in items:
              print(item.get('itemId'), end=" ")
              print(itemId)
              print(item.get('itemId') == itemId)
              if (item.get('itemId') == itemId):
                itemFiltered = row
                match = True
                break
              else:
                continue
          if match:  
            break
          else:
            continue
        
        return itemFiltered
