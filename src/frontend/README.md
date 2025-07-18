Update the config file env with environment specific values.  
Create docker image  
```
docker build -t htotapally/sml-apach2 .
```
Running docker image
```
docker run --name sml-apache2 -d -p 8089:80 htotapally/sml-apach2
```
Following logs
```
docker logs sml-apache2  --follow
```
Checking docker container
```
curl http://localhost:8089
```


# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh
