const transSample = require("./trans-samples/transaction.json"),
	{ removeDuplicateId, sumOfTaxes, convertXmlToJson,resultObj } = require("./utils/helpers"),
	 fs = require('fs');


class Validator {

	//################################
	validateItemsTaxes = async (trans) => {
		if (!trans) {
			throw new Error("transaction in required!");
		}

		const jsonTransaction = await convertXmlToJson(trans)

		if (jsonTransaction && jsonTransaction.type === 'JSON') {
			return this.validateItemsTaxesForJson(jsonTransaction.trans)
		} else if (jsonTransaction && jsonTransaction.type === 'XML') {
			return this.validateItemsTaxesForXml(jsonTransaction.trans)
		} else {
			return resultObj(['invalid transaction'],false) 
		}

	};

	//################################
	validateTransactionTaxes = async (trans) => {
		if (!trans) {
			throw new Error("transaction in required!");
		}

		const jsonTransaction = await convertXmlToJson(trans)

		if (jsonTransaction && jsonTransaction.type === 'JSON') {
			return this.validateTransactionTaxesForJson(jsonTransaction.trans)
		} else if (jsonTransaction && jsonTransaction.type === 'XML') {
			return this.validateTransactionTaxesForXml(jsonTransaction.trans)
		} else {
			return resultObj(['invalid transaction'],false)
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
					return resultObj([`taxes is not valid for item: ${item.name}!`],false);
				}
			}

			return resultObj([],true)
		}
		return resultObj(["itemization property of tranaction is undefined or is not an array"],false) 
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
					return resultObj([`taxes is not valid for item: ${item.name}!`],false);
				}
			}
			return resultObj([],true); 

		} else if (items) {
			const item = items;
			const itemNetaSlesMoney = item.net_sales_money.amount;
			const itemTaxes = sumOfTaxes(removeDuplicateId(item.taxes.element));
			const itemTotalMoney = item.total_money.amount;
			if (itemTaxes !== itemTotalMoney - itemNetaSlesMoney) {
				return resultObj([`taxes is not valid for item: ${item.name}!`],false);
			}

			return resultObj([],true); 
		}

		return resultObj(["itemization property of tranaction is undefined",],false);
	}




	//////////////////////////////////////////////////
	validateTransactionTaxesForJson = (trans) => {
		const { inclusive_tax_money, additive_tax_money, tax_money, taxes } = trans;
		const allExist =
			inclusive_tax_money && additive_tax_money && tax_money && taxes;
		const allNum =
			!isNaN(inclusive_tax_money.amount) &&
			!isNaN(inclusive_tax_money.amount) &&
			!isNaN(inclusive_tax_money.amount);

		if (!allExist || !allNum) {
			return resultObj(["invalid transaction"],false); 
		}

		if (
			additive_tax_money.amount + inclusive_tax_money.amount !==
			tax_money.amount
		) {
			return resultObj(["summation of additive_tax and inclusive_tax not equal tax_money",],false); 
		}

		const inclusiveTaxMoney = inclusive_tax_money.amount;
		if (inclusiveTaxMoney > 0 && taxes.length === 0) {
			return resultObj(["Taxes property is required"],false);   
		}
		const sumOfinclusiveTaxMoney = sumOfTaxes(removeDuplicateId(taxes).filter((i) => i.inclusion_type === "INCLUSIVE"));
		if (inclusiveTaxMoney !== sumOfinclusiveTaxMoney) {
			return resultObj(["inclusive_tax_money amount does not equal the summation of taxes of type INCLUSIVE"],false);
		}

		const additiveTaxMoney = additive_tax_money.amount;
		if (additiveTaxMoney > 0 && taxes.length === 0) {
			return resultObj(["Taxes property is required"],false);
		}
		//here i am assuming the type property value it will be ADDITIVE
		const sumOfAdditiveTaxMoney = sumOfTaxes(removeDuplicateId(taxes).filter((i) => i.inclusion_type === "ADDITIVE"));
		if (additiveTaxMoney !== sumOfAdditiveTaxMoney) {
			return resultObj(["additive_tax_money amount does not equal the summation of taxes of type ADDITIVE"],false);
		}
		return resultObj([],true);  
	}
}

const v = new Validator();
v.validateItemsTaxes(transSample).then((value=>{
	console.log(value)
}));
fs.readFile(__dirname + '/trans-samples/transaction.xml',async (err, data) => {
    v.validateItemsTaxes(data).then((value=>{
		console.log(value)
	}));
})
