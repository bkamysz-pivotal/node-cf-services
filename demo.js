'use strict';

const express = require('express');
const app = express();
const CfServices = require('./cf-services.js');

let debugOutput = {};

let doCoolStuff = (cfServices) => {
    return new Promise((resolve) => {
        if (cfServices.amqpServices.length > 0) {
            debugOutput.AMQP = cfServices.amqpServices[0].options;
            debugOutput.AMQP.password = '******';

            let uri = debugOutput.AMQP.url.split(':');
            uri[2] = '************' + uri[2].substring(uri[2].indexOf('@'));
            debugOutput.AMQP.url = uri.join(':');
        }

        if (cfServices.mysqlServices.length > 0) {
            debugOutput.MySql = cfServices.mysqlServices[0].config;
            debugOutput.MySql.password = '******';
        }

        if (cfServices.postgresServices.length > 0) {
            let count = 1;
            cfServices.postgresServices.forEach((service) => {
                let serviceName = 'Postgres'+count;
                count = count+1;
                debugOutput[serviceName] = service;
                let uri = debugOutput[serviceName].options.connectionString.split(':');
                uri[2] = '************' + uri[2].substring(uri[2].indexOf('@'));                debugOutput[serviceName].options.connectionString = uri.join(':');
            });
        }

        if (cfServices.mongoServices.length > 0) {
            cfServices.mongoServices[0].command({'dbStats': 1}, function (err, results) {
                debugOutput.Mongo = results;

                resolve(debugOutput);
            });
        } else {
            resolve(debugOutput);
        }

    });
};

CfServices.initialize().then((cfServices) => {
    doCoolStuff(cfServices).then((debugOutput) => {
        console.log(debugOutput);
    });
});


app.get('/', (req, res) => {
    res.send(debugOutput);
});

app.listen(8080, () => console.log('App Started'));