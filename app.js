const express = require('express');
const app = express();
var cf = require('./cf-services.js');

var mydb;
if (cf.postgresServices.length > 0) {
    var mydb = cf.postgresServices[0];
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