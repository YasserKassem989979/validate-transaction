const transSample = require("./trans-samples/transaction.json"),
	{ removeDuplicateId, sumOfTaxes, convertXmlToJson, resultObj } = require("./utils/helpers"),
	fs = require('fs');


class Validator {

	//################################
	validateItemsTaxes = async (data) => {
		if (!data) {
			throw new Error("transaction in required!");
		}
		const jsonTransaction = await convertXmlToJson(data)
		if (jsonTransaction && jsonTransaction.type === 'JSON') {
			return this.validateItemsTaxesForJson(jsonTransaction.trans)
		} else if (jsonTransaction && jsonTransaction.type === 'XML') {
			return this.validateItemsTaxesForXml(jsonTransaction.trans)
		} else {
			return resultObj(['invalid transaction'], false)
		}

	};

	//########################################
	validateItemsTaxesForJson = (trans) => {
		if (trans.itemization && Array.isArray(trans.itemization)) {
			const items = trans.itemization;

			for (let i = 0; i < items.length; i++) {
				const item = items[i];
				const itemNetaSlesMoney = item.net_sales_money.amount;
				const itemTaxes = sumOfTaxes(removeDuplicateId(item.taxes));
				const itemTotalMoney = item.total_money.amount;
				if (itemTaxes !== itemTotalMoney - itemNetaSlesMoney) {
					return resultObj([`taxes is not valid for item: ${item.name}!`], false);
				}
			}
			return resultObj([], true)
		}
		return resultObj(["itemization property of tranaction is undefined or is not an array"], false)
	}

	//#################################################
	validateItemsTaxesForXml = (trans) => {
		const items = trans.itemization && trans.itemization.element;
		if (items && Array.isArray(items)) {
			for (let i = 0; i < items.length; i++) {
				const item = items[i];
				const itemNetaSlesMoney = item.net_sales_money.amount;
				const itemTaxes = sumOfTaxes(removeDuplicateId(item.taxes.element));
				const itemTotalMoney = item.total_money.amount;
				if (itemTaxes !== itemTotalMoney - itemNetaSlesMoney) {
					return resultObj([`taxes is not valid for item: ${item.name}!`], false);
				}
			}
			return resultObj([], true);
		} else if (items) {
			const item = items;
			const itemNetaSlesMoney = item.net_sales_money.amount;
			const itemTaxes = sumOfTaxes(removeDuplicateId(item.taxes.element));
			const itemTotalMoney = item.total_money.amount;
			if (itemTaxes !== itemTotalMoney - itemNetaSlesMoney) {
				return resultObj([`taxes is not valid for item: ${item.name}!`], false);
			}
			return resultObj([], true);
		}
		return resultObj(["itemization property of tranaction is undefined",], false);
	}

	//################################################
	validateTransactionTaxes = async (data) => {

		if (!data) {
			throw new Error("transaction in required!");
		}

		const jsonTransaction = await convertXmlToJson(data)
		if (!jsonTransaction) return resultObj(['invalid transaction'], false)
		const { type, trans } = jsonTransaction
		const isXml = type === 'XML' || false
		const isJson = type === 'JSON' || false
		const { inclusive_tax_money, additive_tax_money, tax_money, taxes } = trans;
		const allExist =
			inclusive_tax_money && additive_tax_money && tax_money && taxes;
		const allNum =
			!isNaN(inclusive_tax_money.amount) &&
			!isNaN(inclusive_tax_money.amount) &&
			!isNaN(inclusive_tax_money.amount);
		if (!allExist || !allNum) {
			return resultObj(["invalid transaction"], false);
		}
		if (
			additive_tax_money.amount + inclusive_tax_money.amount !==
			tax_money.amount
		) {
			return resultObj(["summation of additive_tax and inclusive_tax not equal tax_money",], false);
		}
		if ((isXml && inclusive_tax_money.amount > 0 && taxes.element.length === 0) ||
			(isJson && inclusive_tax_money.amount > 0 && taxes.length === 0)) {
			return resultObj(["Taxes property is required"], false);
		}
		const sumOfinclusiveTaxMoney = sumOfTaxes(removeDuplicateId(isXml?taxes.element:taxes).filter((i) => i.inclusion_type === "INCLUSIVE"));
		if (inclusive_tax_money.amount !== sumOfinclusiveTaxMoney) {
			return resultObj(["inclusive_tax_money amount does not equal the summation of taxes of type INCLUSIVE"], false);
		}
		if ((isXml && additive_tax_money.amount > 0 && taxes.element.length === 0) ||
			(isJson && additive_tax_money.amount > 0 && taxes.length === 0)) {
			return resultObj(["Taxes property is required"], false);
		}
		//here i am assuming the type property value it will be ADDITIVE
		const sumOfAdditiveTaxMoney = sumOfTaxes(removeDuplicateId(isXml?taxes.element:taxes).filter((i) => i.inclusion_type === "ADDITIVE"));
		if (additive_tax_money.amount !== sumOfAdditiveTaxMoney) {
			return resultObj(["additive_tax_money amount does not equal the summation of taxes of type ADDITIVE"], false);
		}
		return resultObj([], true);
	}
}

const v = new Validator();
v.validateTransactionTaxes(transSample).then((value => {
	console.log(value)
}));
// fs.readFile(__dirname + '/trans-samples/transaction.xml', async (err, data) => {
// 	v.validateTransactionTaxes(data).then((value => {
// 		console.log(value)
// 	}));
// })
