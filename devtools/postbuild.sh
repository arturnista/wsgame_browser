mv ./src/constants.js ./src/constants.prod.js
mv ./src/constants.dev.js ./src/constants.js

rm -rf ../wsgame/site
mv ./build ../wsgame/site