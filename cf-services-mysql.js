'use strict';

const mysql = require('mysql');
const MYSQL = 'mysql';

class CfServicesMysql {

    _isMysqlService(service) {
        return !!(service && service.tags && service.tags.indexOf(MYSQL) !== -1);
    }

    getServices(services) {
        return new Promise((resolve) => {
            let connections = [];
            let conn;

            services.forEach(service => {
                if (this._isMysqlService(service)
                    && service.credentials && service.credentials.uri) {

                    conn = mysql.createConnection(service.credentials.uri);

                    connections.push(conn);
                }
            });

            resolve(connections);
        });
    }
}

module.exports = CfServicesMysql;