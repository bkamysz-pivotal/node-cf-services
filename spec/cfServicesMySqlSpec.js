'use strict';

const CfServicesMySql = require('../cf-services-mysql.js');

let serviceConfigs;
let cfServicesMySql;

beforeEach(() => {
    cfServicesMySql = new CfServicesMySql();

    serviceConfigs = [
        {"credentials": {"uri": "someuri"}},
        {"credentials": {}},
        {}
    ];
});

describe('CF Services mysql', () => {

    it('should check if service is mysql', () => {
        let invalidTags = {"tags": ["not the right db"]};
        let emptyTags = {"tags": []};
        let noTags = {};
        let noService = undefined;

        expect(cfServicesMySql._isMysqlService(noService)).toBeFalsy();
        expect(cfServicesMySql._isMysqlService(noTags)).toBeFalsy();
        expect(cfServicesMySql._isMysqlService(emptyTags)).toBeFalsy();
        expect(cfServicesMySql._isMysqlService(invalidTags)).toBeFalsy();

        let validServiceOneTag = {"tags": ["mysql"]};
        let validServiceMultipleTags = {"tags": ["anotherTag", "mysql"]};
        expect(cfServicesMySql._isMysqlService(validServiceOneTag)).toBeTruthy();
        expect(cfServicesMySql._isMysqlService(validServiceMultipleTags)).toBeTruthy();
    });

    it('should get a list of serviceConfigs if mysql', (done) => {
        let isPostgresServiceSpy = spyOn(cfServicesMySql, '_isMysqlService').and.returnValue(true);
        cfServicesMySql.getServices(serviceConfigs).then((connections) => {
            expect(connections.length).toBe(1);
            done();
        });
        expect(isPostgresServiceSpy).toHaveBeenCalledTimes(3);
    });

    it('should ignore serviceConfigs if not postgres', (done) => {
        let isPostgresServiceSpy = spyOn(cfServicesMySql, '_isMysqlService').and.returnValue(false);
        cfServicesMySql.getServices(serviceConfigs).then((pools) => {
            expect(pools.length).toBe(0);
            done();
        });
        expect(isPostgresServiceSpy).toHaveBeenCalledTimes(3);
    });
});