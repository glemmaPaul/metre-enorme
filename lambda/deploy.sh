yarn build   

cd dist

zip -r9 ../function.zip handler.js

cd ..

aws lambda update-function-code --function-name runPDFRender --zip-file fileb://function.zip --profile=kanjer