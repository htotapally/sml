import cherrypy
import json
import os.path
import requests

class ProductSvc:
    
    def __init__(self, solrendpoint, solrcollection):
        self.solrendpoint = solrendpoint
        self.solrcollection = solrcollection
        pass
        
    def get_allitems(self):
        resp = requests.get(solrUrl.format(self.solrendpoint, self.solrcollection))
        data = json.loads(resp.text)
        docs = data.get('response').get('docs')
        print (docs)
        return docs    
    
    @cherrypy.expose
    @cherrypy.tools.json_out()    
    def getitem(self, itemId):
        itemFiltered = None
        resp = requests.get(solrUrl.format(self.solrendpoint, self.solrcollection))
        data = json.loads(resp.text)
        docs = data.get('response').get('docs')
        
        for doc in docs:
          match = False
          print(doc.get('items.itemId'), end=" ")
          print(itemId)
          print(doc.get('items.itemId') == itemId)
          if (itemId in doc.get('items.itemId')):
                itemFiltered = doc
                match = True
                break
            
          if match:  
            break
          else:
            continue
        
        return itemFiltered

solrUrl = '{}/{}/select?indent=true&q.op=OR&q=*%3A*&useParams='
