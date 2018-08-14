'use strict';

const fs = require("fs");
const CfServicesAmqp = require('./cf-services-amqp.js');
const CfServicesMongo = require('./cf-services-mongo.js');
const CfServicesMysql = require('./cf-services-mysql.js');
const CfServicesPostgres = require('./cf-services-postgres.js');

const config = 'application.json';

class CfServices {

    constructor() {
        this.serviceConfigs = [];

        this.mongoServices = [];
        this.amqpServices = [];
        this.mysqlServices = [];
        this.postgresServices = [];

        this.cfServicesAmqp = new CfServicesAmqp();
        this.cfServicesMongo = new CfServicesMongo();
        this.cfServicesMysql = new CfServicesMysql();
        this.cfServicesPostgres = new CfServicesPostgres();
    }

    static initialize() {
        return new CfServices().init();
    }

    init() {
        return new Promise((resolve) => {
            this.parseVCAP();

            if (this.serviceConfigs && this.serviceConfigs.length > 0) {
                let promises = [];

                promises.push(this.cfServicesAmqp.getServices(
                    this.serviceConfigs).then((connections) => {
                        this.amqpServices = connections;
                    })
                );
                promises.push(this.cfServicesMongo.getServices(
                    this.serviceConfigs).then((dbs) => {
                        this.mongoServices = dbs;
                    })
                );
                promises.push(this.cfServicesMysql.getServices(
                    this.serviceConfigs).then((connections) => {
                        this.mysqlServices = connections;
                    })
                );
                promises.push(this.cfServicesPostgres.getServices(
                    this.serviceConfigs).then((pools) => {
                        this.postgresServices = pools;
                    })
                );

                Promise.all(promises).then(
                    () => {
                        resolve(this);
                    }
                );
            } else {
                resolve(this);
            }
        });
    }

    parseVCAP() {
        this.serviceConfigs = [];

        let vcap;

        try {
            vcap = JSON.parse(process.env.VCAP_SERVICES || fs.readFileSync(config));
        } catch (e) {
            console.log('Error parsing VCAP variables: ' + e);
        }

        if (vcap) {
            Object.keys(vcap).forEach((key) => {
                if (vcap[key] instanceof Array) {
                    vcap[key].forEach((service) => {
                        this.serviceConfigs.push(service);
                    });
                }
            });
        }
    }
}

module.exports = CfServices;