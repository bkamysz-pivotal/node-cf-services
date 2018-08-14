'use strict';

const MongoClient = require('mongodb').MongoClient;
const MONGO = 'mongodb';

class CfServicesMongo {

    _isMongoService(service) {
        return !!(service && service.tags && service.tags.indexOf(MONGO) !== -1);
    }

    getServices(services) {
        return new Promise((resolve) => {
            let dbs = [];
            let promises = [];

            services.forEach(service => {
                if (this._isMongoService(service)
                    && service.credentials && service.credentials.uri) {

                    promises.push(
                        MongoClient.connect(service.credentials.uri, {useNewUrlParser: true})
                            .catch((err) => {
                                console.log('Error connecting to Mongo: ' + err);
                            })
                    );
                }
            });

            if (promises.length === 0) {
                resolve([]);
            }
            else {
                Promise.all(promises).then(
                    (values) => {

                        values.forEach((client) => {
                            if (client && client.db()) {
                                dbs.push(client.db());
                            }
                        });

                        resolve(dbs);
                    }
                );
            }
        });
    }

}

module.exports = CfServicesMongo;
