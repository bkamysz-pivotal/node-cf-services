const fs = require("fs");
const cfpg = require('./cf-services-postgres.js');

var cf = {
    postgresServices: []
};

var vcap_env;

try {
    vcap_env = JSON.parse(process.env.VCAP_SERVICES || fs.readFileSync("application.json"));
} catch (e) {
    console.error('Unable to parse cf services');
}

if (vcap_env) {
    cf.postgresServices = cfpg.getPostgresServices(vcap_env);
}

module.exports = cf;