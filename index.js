const transSample = require("./trans-samples/transaction.json"),
	{ removeDuplicateId, sumOfTaxes, convertXmlToJson } = require("./utils/helpers");



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
			return {
				errors: ['invalid transaction'],
				isVaild: false
			}
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
			return {
				errors: ['invalid transaction'],
				isVaild: false
			}
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
					return {
						errors: [`taxes is not valid for item: ${item.name}!`],
						isVaild: false,
					};
				}
			}

			return {
				errors: [],
				isVaild: true,
			};
		}

		return {
			errors: [
				"itemization property of tranaction is undefined or is not an array",
			],
			isVaild: false,
		};
	}


	//#################################################
	//########################################
	validateItemsTaxesForXml = (trans) => {
		const items = trans.itemization && trans.itemization.element;
		if (items && Array.isArray(items)) {
			for (let i = 0; i < items.length; i++) {
				const item = items[i];
				const itemNetaSlesMoney = item.net_sales_money.amount;
				const itemTaxes = sumOfTaxes(removeDuplicateId(item.taxes.element));
				const itemTotalMoney = item.total_money.amount;
				if (itemTaxes !== itemTotalMoney - itemNetaSlesMoney) {
					return {
						errors: [`taxes is not valid for item: ${item.name}!`],
						isVaild: false,
					};
				}
			}
			return {
				errors: [],
				isVaild: true,
			};
		} else if (items) {
			const item = items;
			const itemNetaSlesMoney = item.net_sales_money.amount;
			const itemTaxes = sumOfTaxes(removeDuplicateId(item.taxes.element));
			const itemTotalMoney = item.total_money.amount;
			if (itemTaxes !== itemTotalMoney - itemNetaSlesMoney) {
				return {
					errors: [`taxes is not valid for item: ${item.name}!`],
					isVaild: false,
				};
			}
		}

		return {
			errors: [
				"itemization property of tranaction is undefined",
			],
			isVaild: false,
		};
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
			return {
				errors: ["invalid transaction"],
				isVaild: false
			};
		}

		if (
			additive_tax_money.amount + inclusive_tax_money.amount !==
			tax_money.amount
		) {
			return {
				errors: [
					"summation of additive_tax and inclusive_tax not equal tax_money",
				],
				isVaild: false,
			};
		}

		const inclusiveTaxMoney = inclusive_tax_money.amount;
		if (inclusiveTaxMoney > 0 && taxes.length === 0) {
			return {
				errors: ["Taxes property is required"],
				isVaild: false,
			};
		}
		const sumOfinclusiveTaxMoney = sumOfTaxes(removeDuplicateId(taxes).filter((i) => i.inclusion_type === "INCLUSIVE"));
		if (inclusiveTaxMoney !== sumOfinclusiveTaxMoney) {
			return {
				errors: [
					"inclusive_tax_money amount does not equal the summation of taxes of type INCLUSIVE",
				],
				isVaild: false,
			};
		}

		const additiveTaxMoney = additive_tax_money.amount;
		if (additiveTaxMoney > 0 && taxes.length === 0) {
			return {
				errors: ["Taxes property is required"],
				isVaild: false,
			};
		}
		//here i am assuming the type property value it will be ADDITIVE
		const sumOfAdditiveTaxMoney = sumOfTaxes(removeDuplicateId(taxes).filter((i) => i.inclusion_type === "ADDITIVE"));
		if (additiveTaxMoney !== sumOfAdditiveTaxMoney) {
			return {
				errors: [
					"additive_tax_money amount does not equal the summation of taxes of type ADDITIVE",
				],
				isVaild: false,
			};
		}

		return {
			errors: [],
			isVaild: true,
		};
	}
}

const v = new Validator();
console.log(v.validateItemsTaxes(transSample));
