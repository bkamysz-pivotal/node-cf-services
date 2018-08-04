'use strict';

const cfServicesPostgres = require('../cf-services-postgres.js');

let serviceConfigs;

beforeEach(() => {
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

        expect(cfServicesPostgres.isPostgresService(noService)).toBeFalsy();
        expect(cfServicesPostgres.isPostgresService(noTags)).toBeFalsy();
        expect(cfServicesPostgres.isPostgresService(emptyTags)).toBeFalsy();
        expect(cfServicesPostgres.isPostgresService(invalidTags)).toBeFalsy();

        let validServiceOneTag = {"tags": ["postgresql"]};
        let validServiceMultipleTags = {"tags": ["anotherTag", "postgresql"]};
        expect(cfServicesPostgres.isPostgresService(validServiceOneTag)).toBeTruthy();
        expect(cfServicesPostgres.isPostgresService(validServiceMultipleTags)).toBeTruthy();
    });

    it('should get a list of serviceConfigs if postgres', () => {
        let isPostgresServiceSpy = spyOn(cfServicesPostgres, 'isPostgresService').and.returnValue(true);
        expect(cfServicesPostgres.getPostgresServices(serviceConfigs).length).toBe(1);
        expect(isPostgresServiceSpy).toHaveBeenCalledTimes(3);
    });

    it('should ignore serviceConfigs if not postgres', () => {
        let isPostgresServiceSpy = spyOn(cfServicesPostgres, 'isPostgresService').and.returnValue(false);
        expect(cfServicesPostgres.getPostgresServices(serviceConfigs).length).toBe(0);
        expect(isPostgresServiceSpy).toHaveBeenCalledTimes(3);
    });
});