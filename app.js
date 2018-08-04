'use strict';

const express = require('express');
const app = express();
const cfServices = require('./cf-services.js');

cfServices.init();

let mydb = undefined;
if (cfServices.postgresServices.length > 0) {
    mydb = cfServices.postgresServices[0];
}

if (mydb) {
    mydb.query('SELECT * from COMPANY', (err, result) => {
        console.log(result.rows);
    });
}

app.get('/', (req, res) => {
    if (mydb) {
        mydb.query('SELECT * from COMPANY', (err, result) => {
            res.send(result.rows);
        });
    } else {
        res.send('No Postgres DB Found');
    }
});

app.listen(8080, () => console.log('App Started'));