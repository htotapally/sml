Build docker container for static content

docker build -t sml-apache2 .

docker run -d --name sml-running-httpd -p 8080:80 sml-apache2

sudo docker stop sml-running-httpd


sudo docker rm sml-running-httpd
