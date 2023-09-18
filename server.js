require('express-async-errors');
const express = require('express');
const app = express();
require('dotenv').config();
require('./start/db.js')();
require('./start/routes.js')(app);
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

process.on('uncaughtException', (ex) => {
    console.log('got an uncaught exception error');
    process.exit(1);
});

process.on('unhandledRejection', (ex) => {
    console.log(ex);
    process.exit(1);
});

let port = process.env.PORT || 3000;
let server = app.listen(port, () => console.log(`App listen at ${port}`));

module.exports = server;