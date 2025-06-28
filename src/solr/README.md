# Insructions for creating solr image

## Create shared directory for docker volumes  
```  
mkdir -p /var/solr
```  

## Running Solr Docker Image
Execute the following command
```  
docker run -d -v "/var/solr:/var/solr" -p 8983:8983 --name smlsolr solr
```  

## Create collection for sml

Connect to docker container
```  
docker exec -it smlsolr sh
```  

Create collection
```  
bin/solr create -c smlsolr  
```  

Copy managed schema 
```  
cp managed-schema.xml /var/solr/data/smlsolr/conf
```  

## Restart Docker container
```  
docker restart smlsolr
```  

## Connecting to solr admin
solr admin web front is accessible using the url
```
http://localhost:8983/solr/#/
```
From the UI click on Core Admin  
From Core Selector drop down select the collection smlsolr  

## Uploading documents  
After selecting solr core, click on Documents  
In the Request-Handler (qt) text field enter  
```
/update/json/docs
```
In the Document(s) text field enter the products to be on boarded in json format  

## Viewing products
From the UI click on Query  
Click on Execute Query to view onboarded produce


## To delete onboarded products  
Click on Documents  
Change Document Type drop down to select Solr Command (raw XML or JSON)
in the Documents text area enter the following text  

```  
{'delete': {'query': '*:*'}}  
```  
Click on Submit Document.  All existing products are removed.

# Creating  custom docker image is Work in Progress
```
docker build -t htotapally/smlsolr .
```

```  
docker run -d -v "/var/solr:/var/solr" -p 8983:8983 --name smlsolr solr solr-precreate smlsolr
```  



/update/json/docs

curl 'http://k8smaster.example.net:8983/solr/sml1/select?indent=true&q.op=OR&q=*%3A*&useParams='

