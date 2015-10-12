# Node REST API

REST API for mobile applications using Node.js and Express.js framework with Mongoose.js for working with MongoDB. For access control this project use OAuth 2.0, with the help of OAuth2orize and Passport.js.

This is updated code that follows [RESTful API With Node.js + MongoDB](https://aleksandrov.ws/2013/09/12/restful-api-with-nodejs-plus-mongodb) article.

## Running project

You need to have installed Node.js and MongoDB 

### Install dependencies 

To install dependencies enter project folder and run following command:
```
npm install
```

### Run server

To run server execute:
```
node bin/www 
```

## Modules used

Some of non standard modules used:
* [express](https://www.npmjs.com/package/mongoose)
* [mongoose](https://www.npmjs.com/package/mongoose)
* [nconf](https://www.npmjs.com/package/nconf)
* [winston](https://www.npmjs.com/package/winston)
* [oauth2orize](https://www.npmjs.com/package/oauth2orize)
* [passport](https://www.npmjs.com/package/passport)

### JSHint

For running JSHint
```
sudo npm install jshint -g
jshint libs/**/*.js generateData.js
```

### Original library


