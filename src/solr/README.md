# Insructions for creating solr image

## Create shared directory for docker volumes  
'''
mkdir -p /var/solr
'''

## Running Solr Docker Image
Execute the following command
'''
docker run -d -v "/var/solr:/var/solr" -p 8983:8983 --name smlsolr solr
'''

## Create collection for sml

Connect to docker container
'''
docker exec -it smlsolr sh
'''

Create collection
'''
bin/solr create -c smlsolr  
'''

Copy managed schema 
'''
cp managed-schema.xml /var/solr/data/smlsolr/conf
'''


docker run -d -v "/var/solr:/var/solr" -p 8983:8983 --name smlsolr solr solr-precreate smlsolr
'''


'''
{'delete': {'query': '*:*'}}  
'''

/update/json/docs

curl 'http://k8smaster.example.net:8983/solr/sml1/select?indent=true&q.op=OR&q=*%3A*&useParams='

