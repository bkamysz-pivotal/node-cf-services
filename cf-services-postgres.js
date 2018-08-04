'use strict';

const {Pool} = require('pg');
const POSTGRES = 'postgresql';

const cfServicesPostgres = {
    isPostgresService: (service) => {
        return !!(service && service.tags && service.tags.indexOf(POSTGRES) !== -1);
    },
    getPostgresServices: (services) => {
        let pools = [];

        services.forEach(service => {
            if (cfServicesPostgres.isPostgresService(service)) {
                if (service.credentials && service.credentials.uri) {
                    pools.push(new Pool({
                        connectionString: service.credentials.uri
                    }));
                }
            }
        });

        return pools;
    }
};

module.exports = cfServicesPostgres;