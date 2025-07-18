npm run build --force
rm -rf ../../assets/
cp dist/index.html ../../.
cp -r dist/assets/ ../../assets/
cp -r src/images/ ../../images/
