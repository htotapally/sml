
sudo docker build -t sml-apach2 .

sudo docker run --name sml-apach2 -d -p 8081:80 sml-apach2
