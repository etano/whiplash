Dev
---

If you have nodejs installed, simply do:

    npm install
    DEBUG=www:* npm start

Deploy
---

To start a local database, do:

    docker run -d --name mongodb -p 27017:27017 mongo:latest

Then set the environmental variables:

    export MONGO_PORT_27017_TCP_ADDR=192.168.99.100
    export MONGO_PORT_27017_TCP_PORT=27017
    export MONGO_SCHEDULER_PASSWORD="scheduler"

Make sure you have pm2 installed:

    npm install -g pm2

Also, make sure you have mindi.io in your ~/.ssh/config with proper ssh keys.

Then do:

    pm2 deploy ecosystem.json production

For more info on pm2, see http://pm2.keymetrics.io/docs/usage/deployment/

Beta list mail
---------------

curl -s --user 'api:key-a65094f8d8715de1e84d86e02e077fca' https://api.mailgun.net/v3/mg.mindi.io/messages -F from='Ilia Zintchenko <ilia@mindi.io>' -F to='beta@mg.mindi.io' -F subject='Hello' -F text='Testing some Mailgun awesomeness'
