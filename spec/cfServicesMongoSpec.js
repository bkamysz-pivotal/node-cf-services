'use strict';

const MongoClient = require('mongodb').MongoClient;
const CfServicesMongo = require('../cf-services-mongo.js');

let serviceConfigs;
let cfServicesMongo;

beforeEach(() => {
    cfServicesMongo = new CfServicesMongo();
    serviceConfigs = [
        {"credentials": {"uri": "mongodb://localhost:27017/startup_log"}},
        {"credentials": {}},
        {}
    ];
});

describe('CF Services Mongo', () => {

    it('should check if service is mongo', () => {
        let invalidTags = {"tags": ["not the right db"]};
        let emptyTags = {"tags": []};
        let noTags = {};
        let noService = undefined;

        expect(cfServicesMongo._isMongoService(noService)).toBeFalsy();
        expect(cfServicesMongo._isMongoService(noTags)).toBeFalsy();
        expect(cfServicesMongo._isMongoService(emptyTags)).toBeFalsy();
        expect(cfServicesMongo._isMongoService(invalidTags)).toBeFalsy();

        let validServiceOneTag = {"tags": ["mongodb"]};
        let validServiceMultipleTags = {"tags": ["anotherTag", "mongodb"]};
        expect(cfServicesMongo._isMongoService(validServiceOneTag)).toBeTruthy();
        expect(cfServicesMongo._isMongoService(validServiceMultipleTags)).toBeTruthy();
    });

    it('should get a list of serviceConfigs if mongo', (done) => {
        let isMongoServiceSpy = spyOn(cfServicesMongo, '_isMongoService').and.returnValue(true);

        let mongoMock = {
            db: () => {
                return 'db'
            }
        };
        let connectSpy = spyOn(MongoClient, 'connect').and.returnValue(Promise.resolve(mongoMock));
        cfServicesMongo.getServices(serviceConfigs).then((dbs) => {
            expect(dbs.length).toBe(1);
            expect(dbs[0]).toEqual('db');
            done();
        });
        expect(connectSpy).toHaveBeenCalledTimes(1);
        expect(isMongoServiceSpy).toHaveBeenCalledTimes(3);
    });

    it('should handle a mongo connection failure', (done) => {
        let isMongoServiceSpy = spyOn(cfServicesMongo, '_isMongoService').and.returnValue(true);
        let connectSpy = spyOn(MongoClient, 'connect').and.returnValue(Promise.reject('Connect Error'));

        cfServicesMongo.getServices(serviceConfigs).then((dbs) => {
            expect(dbs.length).toBe(0);
            done();
        });

        expect(connectSpy).toHaveBeenCalledTimes(1);
        expect(isMongoServiceSpy).toHaveBeenCalledTimes(3);
    });

    it('should ignore serviceConfigs if not mongo', (done) => {
        let isMongoServiceSpy = spyOn(cfServicesMongo, '_isMongoService').and.returnValue(false);
        let connectSpy = spyOn(MongoClient, 'connect').and.returnValue(Promise.resolve({}));

        cfServicesMongo.getServices(serviceConfigs).then((dbs) => {
            expect(dbs.length).toBe(0);
            done()
        });

        expect(connectSpy).toHaveBeenCalledTimes(0);
        expect(isMongoServiceSpy).toHaveBeenCalledTimes(3);
    });
});