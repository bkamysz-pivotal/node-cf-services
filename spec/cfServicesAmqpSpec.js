'use strict';

const amqp = require('amqp');
const events = require('events');
const CfServicesAmqp = require('../cf-services-amqp.js');

describe('CF Services AMQP', () => {

    let cfServicesAmqp;
    beforeEach(() => {
        cfServicesAmqp = new CfServicesAmqp();
    });

    describe('_isAmqpService', () => {

        it('should check if service is amqp', () => {
            let invalidTags = {"tags": ["not the right service"]};
            let emptyTags = {"tags": []};
            let noTags = {};
            let noService = undefined;

            expect(cfServicesAmqp._isAmqpService(noService)).toBeFalsy();
            expect(cfServicesAmqp._isAmqpService(noTags)).toBeFalsy();
            expect(cfServicesAmqp._isAmqpService(emptyTags)).toBeFalsy();
            expect(cfServicesAmqp._isAmqpService(invalidTags)).toBeFalsy();

            let validServiceOneTag = {"tags": ["amqp"]};
            let validServiceMultipleTags = {"tags": ["anotherTag", "amqp"]};
            expect(cfServicesAmqp._isAmqpService(validServiceOneTag)).toBeTruthy();
            expect(cfServicesAmqp._isAmqpService(validServiceMultipleTags)).toBeTruthy();

        });
    });

    describe('_getAmqpService', () => {
        let conn;
        let amqpSpy;

        beforeEach(() => {
            conn = new events.EventEmitter()
                .addListener('ready', () => {
                })
                .addListener('error', () => {
                });
            amqpSpy = spyOn(amqp, 'createConnection').and.returnValue(conn);
        });

        it('should connect to AMQP', (done) => {
            cfServicesAmqp._getAmqpService('uri').then((result) => {
                expect(result).toEqual(conn);
                done();
            });
            expect(amqpSpy).toHaveBeenCalledTimes(1);
            conn.emit('ready');
        });

        it('should handle an AMQP connection error', (done) => {
            cfServicesAmqp._getAmqpService('uri').then((result) => {
                expect(result).toEqual(undefined);
                done();
            });
            expect(amqpSpy).toHaveBeenCalledTimes(1);
            conn.emit('error', 'Connect Error');
        });
    });

    describe('getServices', () => {
        let serviceConfigs;

        beforeEach(() => {
            serviceConfigs = [
                {"credentials": {"uri": "someuri"}},
                {"credentials": {}},
                {}
            ];
        });

        it('should get a list of serviceConfigs if amqp', (done) => {
            let isAmqpServiceSpy = spyOn(cfServicesAmqp, '_isAmqpService').and.returnValue(true);
            let getAmqpServiceSpy = spyOn(cfServicesAmqp, '_getAmqpService').and.returnValue(Promise.resolve({}));
            cfServicesAmqp.getServices(serviceConfigs).then((connections) => {
                expect(connections.length).toBe(1);
                expect(connections[0]).toEqual({});
                done();
            });
            expect(getAmqpServiceSpy).toHaveBeenCalledTimes(1);
            expect(isAmqpServiceSpy).toHaveBeenCalledTimes(3);
        });

        it('should handle a amqp connection failure', (done) => {
            let isAmqpServiceSpy = spyOn(cfServicesAmqp, '_isAmqpService').and.returnValue(true);
            let getAmqpServiceSpy = spyOn(cfServicesAmqp, '_getAmqpService').and.returnValue(Promise.resolve(undefined));

            cfServicesAmqp.getServices(serviceConfigs).then((connections) => {
                expect(connections.length).toBe(0);
                done();
            });
            expect(getAmqpServiceSpy).toHaveBeenCalledTimes(1);
            expect(isAmqpServiceSpy).toHaveBeenCalledTimes(3);
        });

        it('should ignore serviceConfigs if not amqp', (done) => {
            let isAmqpServiceSpy = spyOn(cfServicesAmqp, '_isAmqpService').and.returnValue(false);
            let getAmqpServiceSpy = spyOn(cfServicesAmqp, '_getAmqpService').and.returnValue(Promise.resolve(undefined));

            cfServicesAmqp.getServices(serviceConfigs).then((connections) => {
                expect(connections.length).toBe(0);
                done();
            });
            expect(getAmqpServiceSpy).toHaveBeenCalledTimes(0);
            expect(isAmqpServiceSpy).toHaveBeenCalledTimes(3);
        });
    });
});
