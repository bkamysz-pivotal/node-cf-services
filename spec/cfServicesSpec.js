'use strict';

const fs = require("fs");
const CfServices = require('../cf-services.js');

describe('CF Services', () => {
    let cfServices;

    beforeEach(() => {
        cfServices = new CfServices();
    });

    describe('initialize', () => {
        let getAmqpServicesSpy;
        let getMongoServicesSpy;
        let getMyslqServicesSpy;
        let getPostgresServicesSpy;
        let amqpServices = [1, 2, 3];
        let mongoServices = [4, 5, 6];
        let mySqlServices = [7, 8, 9];
        let postgresServices = [10, 11, 12];

        beforeEach(() => {
            cfServices = new CfServices();
            getAmqpServicesSpy = spyOn(cfServices.cfServicesAmqp, 'getServices').and.returnValue(Promise.resolve(amqpServices));
            getMongoServicesSpy = spyOn(cfServices.cfServicesMongo, 'getServices').and.returnValue(Promise.resolve(mongoServices));
            getMyslqServicesSpy = spyOn(cfServices.cfServicesMysql, 'getServices').and.returnValue(Promise.resolve(mySqlServices));
            getPostgresServicesSpy = spyOn(cfServices.cfServicesPostgres, 'getServices').and.returnValue(Promise.resolve(postgresServices));
        });

        it('should get serviceConfigs if available', (done) => {
            let parseSpy = spyOn(cfServices, 'parseVCAP');
            cfServices.serviceConfigs = [{}];


            cfServices.init().then(() => {
                expect(parseSpy).toHaveBeenCalled();
                expect(getAmqpServicesSpy).toHaveBeenCalled();
                expect(getMongoServicesSpy).toHaveBeenCalled();
                expect(getMyslqServicesSpy).toHaveBeenCalled();
                expect(getPostgresServicesSpy).toHaveBeenCalled();
                expect(cfServices.amqpServices).toEqual(amqpServices);
                expect(cfServices.mongoServices).toEqual(mongoServices);
                expect(cfServices.mysqlServices).toEqual(mySqlServices);
                expect(cfServices.postgresServices).toEqual(postgresServices);
                done();
            });

        });

        it('should ignore serviceConfigs if not available', (done) => {
            let parseSpy = spyOn(cfServices, 'parseVCAP');
            cfServices.init().then(() => {
                expect(parseSpy).toHaveBeenCalled();
                expect(getAmqpServicesSpy).not.toHaveBeenCalled();
                expect(getMongoServicesSpy).not.toHaveBeenCalled();
                expect(getMyslqServicesSpy).not.toHaveBeenCalled();
                expect(getPostgresServicesSpy).not.toHaveBeenCalled();
                expect(cfServices.amqpServices.length).toBe(0);
                expect(cfServices.mongoServices.length).toBe(0);
                expect(cfServices.mysqlServices.length).toBe(0);
                expect(cfServices.postgresServices.length).toBe(0);
                done();
            });
        });
    });

    describe('parsing', () => {

        let fileSpy;
        beforeEach(() => {
            fileSpy = spyOn(fs, 'readFileSync');
        });

        afterEach(() => {
            delete process.env.VCAP_SERVICES;
        });

        it('should parse VCAP from env single instance', () => {
            process.env.VCAP_SERVICES = '{"KEY1": ["one"], "KEY2": ["two"]}';
            cfServices.parseVCAP();
            expect(fileSpy).not.toHaveBeenCalled();
            expect(cfServices.serviceConfigs.length).toBe(2);
        });

        it('should parse VCAP from env multiple instances', () => {
            process.env.VCAP_SERVICES = '{"KEY1": ["one", "two", "three", "four"]}';
            cfServices.parseVCAP();
            expect(fileSpy).not.toHaveBeenCalled();
            expect(cfServices.serviceConfigs.length).toBe(4);
        });

        it('should handle VCAP with no serviceConfigs', () => {
            process.env.VCAP_SERVICES = '{}';
            cfServices.parseVCAP();
            expect(fileSpy).not.toHaveBeenCalled();
            expect(cfServices.serviceConfigs.length).toBe(0);
        });

        it('should handle VCAP with invalid serviceConfigs', () => {
            process.env.VCAP_SERVICES = '{"KEY1": "one", "KEY2": "two"}';
            cfServices.parseVCAP();
            expect(fileSpy).not.toHaveBeenCalled();
            expect(cfServices.serviceConfigs.length).toBe(0);
        });

        it('should parse VCAP from file', () => {
            fileSpy.and.returnValue('{ "KEY1": ["one"], "KEY2": ["two"], "KEY3": ["three"]}');
            cfServices.parseVCAP();
            expect(fileSpy).toHaveBeenCalled();
            expect(cfServices.serviceConfigs.length).toBe(3);
        });
    });

});