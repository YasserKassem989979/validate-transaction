const { removeDuplicateId, sumOfTaxes, convertXmlToJson, resultObj } = require("./utils/helpers");

//while I am working on this I am assuming that transaction schema always will be as in .zip file

class Validator {

	// to validate the taxes for each item of transaction
	// converting the transaction always to json format
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

	// to validate taxes for each item of json format
	//sum of all item taxes of unique id
	//validae total_money_taxes with net_sales_money of the item
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

	// to validate taxes for each item of xml format
	//sum of all item taxes of unique id
	//validae total_money_taxes with net_sales_money of the item
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


	// to validate taxes for applied on transaction 
	validateTransactionTaxes = async (data) => {

		if (!data) {
			throw new Error("transaction in required!");
		}
		// convert to json 
		const jsonTransaction = await convertXmlToJson(data)
		if (!jsonTransaction) return resultObj(['invalid transaction'], false)
		const { type, trans } = jsonTransaction
		const isXml = type === 'XML' || false
		const isJson = type === 'JSON' || false

		const { inclusive_tax_money, additive_tax_money, tax_money, taxes } = trans;
		// all fields exist and numbers?
		const allExist = inclusive_tax_money && additive_tax_money && tax_money && taxes;
		const allNum =
			!isNaN(inclusive_tax_money.amount) &&
			!isNaN(inclusive_tax_money.amount) &&
			!isNaN(inclusive_tax_money.amount);
		if (!allExist || !allNum) {
			return resultObj(["invalid transaction"], false);
		}

		//if the summation of additive+inclusive not equal total tax
		if (
			Number(additive_tax_money.amount) + Number(inclusive_tax_money.amount) !==
			Number(tax_money.amount)
		) {
			return resultObj(["summation of additive_tax and inclusive_tax not equal tax_money",], false);
		}
		// if inclusive_tax_money amount exist and no taxes 
		if ((isXml && inclusive_tax_money.amount > 0 && taxes.element.length === 0) ||
			(isJson && inclusive_tax_money.amount > 0 && taxes.length === 0)) {
			return resultObj(["Taxes property is required"], false);
		}
		//if summation of inclusive_tax_money not equal summation of the same type in tax array
		const sumOfinclusiveTaxMoney = sumOfTaxes(removeDuplicateId(isXml ? taxes.element : taxes).filter((i) => i.inclusion_type === "INCLUSIVE"));
		if (inclusive_tax_money.amount != sumOfinclusiveTaxMoney) {
			return resultObj(["inclusive_tax_money amount does not equal the summation of taxes of type INCLUSIVE"], false);
		}
		// if additive_tax_money amount exist and no taxes 
		if ((isXml && additive_tax_money.amount > 0 && taxes.element.length === 0) ||
			(isJson && additive_tax_money.amount > 0 && taxes.length === 0)) {
			return resultObj(["Taxes property is required"], false);
		}
		//if summation of inclusive_tax_money not equal summation of the same type in tax array
		//here i am assuming the type property value it will be ADDITIVE
		const sumOfAdditiveTaxMoney = sumOfTaxes(removeDuplicateId(isXml ? taxes.element : taxes).filter((i) => i.inclusion_type === "ADDITIVE"));
		if (additive_tax_money.amount != sumOfAdditiveTaxMoney) {
			return resultObj(["additive_tax_money amount does not equal the summation of taxes of type ADDITIVE"], false);
		}
		return resultObj([], true);
	}
}

/**
 * Module exports.
 */
module.exports = new Validator()
