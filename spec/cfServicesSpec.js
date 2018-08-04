'use strict';

const fs = require("fs");
const cfServices = require('../cf-services.js');

describe('CF Services', () => {

    describe('initialize', () => {
        it('should get serviceConfigs if available', () => {
            let parseSpy = spyOn(cfServices, 'parseVCAP');
            cfServices.serviceConfigs = [{}];

            let services = [1, 2, 3];
            let getPostgresServicesSpy = spyOn(cfServices.cfServicesPostgres, 'getPostgresServices').and.callFake(() => {
                return services;
            });

            cfServices.init();

            expect(parseSpy).toHaveBeenCalled();
            expect(getPostgresServicesSpy).toHaveBeenCalled();
            expect(cfServices.postgresServices).toEqual(services);
        });

        it('should ignore serviceConfigs if not available', () => {
            let parseSpy = spyOn(cfServices, 'parseVCAP');
            cfServices.init();
            expect(parseSpy).toHaveBeenCalled();
            expect(cfServices.postgresServices.length).toBe(0);
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

        it('should parse VCAP from env', () => {
            process.env.VCAP_SERVICES = '{"KEY1": ["one"], "KEY2": ["two"]}';
            cfServices.parseVCAP();
            expect(fileSpy).not.toHaveBeenCalled();
            expect(cfServices.serviceConfigs.length).toBe(2);
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