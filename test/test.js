
const fs = require('fs'),
    validator = require('../index'),
    validJSON = require('../trans-samples/transaction.json'),
    invalidJSON = require('../trans-samples/invalid-trnsaction.json'),
    validXML = fs.readFileSync('./trans-samples/transaction.xml', 'utf-8'),
    invalidXML = fs.readFileSync('./trans-samples/invalid-transaction.xml', 'utf-8'),
    assert = require('assert');

    

describe('transactionValidation', function () {

    describe('validateItemsTaxes-xml', function () {
        it('should return isValid equal to true when transaction is valid', async () => {
            const result = await validator.validateItemsTaxes(validXML)
            assert.equal(true, result.isValid);
        });
    });

    describe('validateItemsTaxes-xml', function () {
        it('should return isValid equal to false when transaction is invalid', async () => {
            const result = await validator.validateItemsTaxes(invalidXML)
            assert.equal(false, result.isValid);
        });
    });

    describe('validateTransactionTaxes-xml', function () {
        it('should return isValid equal to false when transaction is invalid', async () => {
            const result = await validator.validateTransactionTaxes(invalidXML)
            assert.equal(false, result.isValid);
        });
    });

    describe('validateTransactionTaxes-xml', function () {
        it('should return isValid equal to true when transaction is valid', async () => {
            const result = await validator.validateTransactionTaxes(validXML)
            assert.equal(true, result.isValid);
        });
    });

    describe('validateTransactionTaxes-json', function () {
        it('should return isValid equal to true when transaction is valid', async () => {
            const result = await validator.validateTransactionTaxes(validJSON)
            assert.equal(true, result.isValid);
        });
    });

    describe('validateTransactionTaxes-json', function () {
        it('should return isValid equal to false when transaction is invalid', async () => {
            const result = await validator.validateTransactionTaxes(invalidJSON)
            assert.equal(false, result.isValid);
        });
    });

    describe('validateItemsTaxes-json', function () {
        it('should return isValid equal to false when transaction is invalid', async () => {
            const result = await validator.validateItemsTaxes(invalidJSON)
            assert.equal(false, result.isValid);
        });
    });


    describe('validateItemsTaxes-json', function () {
        it('should return isValid equal to false when transaction is invalid', async () => {
            const result = await validator.validateItemsTaxes(invalidJSON)
            assert.equal(false, result.isValid);
        });
    });
});