'use strict';

const CfServicesPostgres = require('../cf-services-postgres.js');

let serviceConfigs;
let cfServicesPostgres;

beforeEach(() => {
    cfServicesPostgres = new CfServicesPostgres();
    serviceConfigs = [
        {"credentials": {"uri": "someuri"}},
        {"credentials": {}},
        {}
    ];
});

describe('CF Services Postgres', () => {

    it('should check if service is postgres', () => {
        let invalidTags = {"tags": ["not the right db"]};
        let emptyTags = {"tags": []};
        let noTags = {};
        let noService = undefined;

        expect(cfServicesPostgres._isPostgresService(noService)).toBeFalsy();
        expect(cfServicesPostgres._isPostgresService(noTags)).toBeFalsy();
        expect(cfServicesPostgres._isPostgresService(emptyTags)).toBeFalsy();
        expect(cfServicesPostgres._isPostgresService(invalidTags)).toBeFalsy();

        let validServiceOneTag = {"tags": ["postgresql"]};
        let validServiceMultipleTags = {"tags": ["anotherTag", "postgresql"]};
        expect(cfServicesPostgres._isPostgresService(validServiceOneTag)).toBeTruthy();
        expect(cfServicesPostgres._isPostgresService(validServiceMultipleTags)).toBeTruthy();
    });

    it('should get a list of serviceConfigs if postgres', (done) => {
        let isPostgresServiceSpy = spyOn(cfServicesPostgres, '_isPostgresService').and.returnValue(true);
        cfServicesPostgres.getServices(serviceConfigs).then((pools) => {
            expect(pools.length).toBe(1);
            done();
        });
        expect(isPostgresServiceSpy).toHaveBeenCalledTimes(3);
    });

    it('should ignore serviceConfigs if not postgres', (done) => {
        let isPostgresServiceSpy = spyOn(cfServicesPostgres, '_isPostgresService').and.returnValue(false);
        cfServicesPostgres.getServices(serviceConfigs).then((pools) => {
            expect(pools.length).toBe(0);
            done();
        });
        expect(isPostgresServiceSpy).toHaveBeenCalledTimes(3);
    });
});