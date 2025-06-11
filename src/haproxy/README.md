Building docker image
sudo docker build -t haproxy .

Running haproxy docker image 
sudo docker run -d --name haproxy -p 80:80 -p 8404:8404 haproxy

Stopping haproxy docker image
sudo docker stop haproxy

removing haproxy docker container
sudo docker rm haproxy

Proxy file
haproxy.cfg, self explanatory

Reference Documentation
https://www.haproxy.com/blog/how-to-run-haproxy-with-docker


