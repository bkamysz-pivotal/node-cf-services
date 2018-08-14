'use strict';

const {Pool} = require('pg');
const POSTGRES = 'postgresql';

class CfServicesPostgres {

    _isPostgresService(service) {
        return !!(service && service.tags && service.tags.indexOf(POSTGRES) !== -1);
    }

    getServices(services) {
        return new Promise((resolve) => {
            let pools = [];

            services.forEach(service => {
                if (this._isPostgresService(service)
                    && service.credentials && service.credentials.uri) {

                    pools.push(new Pool({
                        connectionString: service.credentials.uri
                    }));

                }
            });

            resolve(pools);
        });
    }
}

module.exports = CfServicesPostgres;