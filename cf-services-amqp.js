'use strict';

const amqp = require('amqp');
const AMQP = 'amqp';

class CfServicesAmqp {

    _isAmqpService(service) {
        return !!(service && service.tags && service.tags.indexOf(AMQP) !== -1);
    }

    _getAmqpService(url) {
        return new Promise((resolve) => {
            let conn = amqp.createConnection({url: url});
            conn.on('ready', () => {
                resolve(conn);
            });
            conn.on('error', (err) => {
                console.log("Error connecting AMQP: ", err);
                resolve(undefined);
            });
        });
    }

    getServices(services) {
        return new Promise((resolve) => {
            let promises = [];

            services.forEach(service => {
                if (this._isAmqpService(service)
                    && service.credentials && service.credentials.uri) {

                    promises.push(this._getAmqpService(service.credentials.uri));

                }
            });

            if (promises.length === 0) {
                resolve([]);
            }
            else {
                Promise.all(promises).then(
                    (values) => {
                        let connections = [];

                        values.forEach((conn) => {
                            if (conn) {
                                connections.push(conn)
                            }
                        });

                        resolve(connections);
                    }
                );
            }

        });
    }

}

module.exports = CfServicesAmqp;