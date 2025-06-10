import cherrypy
import os.path
import configparser

class Root:
    @cherrypy.expose
    def index(self):
        return "Hello world!"

tutconf = os.path.join(os.path.dirname(__file__), 'tutorial.conf')

if __name__ == '__main__':
    print (tutconf)
    config = configparser.ConfigParser()
    config.read(tutconf)
    port = config.getint('global', 'server.socket_port')
    print(port)
    host = config.get('global', 'server.socket_host')
    print (host)
    cherrypy.config.update({'server.socket_port': port})
    cherrypy.config.update({'server.socket_host': '0.0.0.0'})
    cherrypy.quickstart(Root())