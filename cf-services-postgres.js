const {Pool} = require('pg');
const POSTGRES = 'postgresql';

var cfpg = {
    getPostgresServices: function (vcap_services) {
        var service;
        var pools = [];

        Object.keys(vcap_services).forEach(function (key) {
                service = vcap_services[key][0];
                if (service.tags.indexOf(POSTGRES) != -1) {
                    pools.push(new Pool({
                        connectionString: service.credentials.uri,
                    }));
                }
            }
        );

        return pools;
    }
};

module.exports = cfpg;