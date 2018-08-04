'use strict';

const fs = require("fs");
const cfServicesPostgres = require('./cf-services-postgres.js');

const cfServices = {
    init: () => {
        cfServices.parseVCAP();

        if (cfServices.serviceConfigs && cfServices.serviceConfigs.length > 0) {
            cfServices.postgresServices = cfServicesPostgres.getPostgresServices(cfServices.serviceConfigs);
        }
    },
    parseVCAP: () => {
        cfServices.serviceConfigs = [];

        let vcap;

        try {
            vcap = JSON.parse(process.env.VCAP_SERVICES || fs.readFileSync("application.json"));
        } catch (e) {}

        if(vcap) {
            Object.keys(vcap).forEach((key) => {
                if(vcap[key] instanceof Array) {
                    cfServices.serviceConfigs.push(vcap[key][0]);
                }
            });
        }
    },
    serviceConfigs: [],
    postgresServices: [],
    cfServicesPostgres: cfServicesPostgres
};

module.exports = cfServices;