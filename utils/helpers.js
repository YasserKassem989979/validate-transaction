const xml2js = require('xml2js');

exports.removeDuplicateId = (arr) => {
	return arr.filter(
		(obj, index, arr) => arr.findIndex((t) => t.id === obj.id) === index
	);
};

exports.sumOfTaxes = (arr) => {
	return arr.reduce((total, tax) => {
		if (!isNaN(tax.applied_money.amount)) {
			return total + tax.applied_money.amount;
		} else {
			throw new Error(`Tax amount for item with id:${tax.id} is not a number`);
		}
	}, 0);
};


exports.isJson = (trans) => {
	try {

		trans = typeof trans == 'string' ? trans : JSON.stringify(trans)
		return {type:'JSON',trans:JSON.parse(trans)};
	} catch (e) {
		return null
	}
};


exports.isXML = async (trans) => {
	try {


		const result = await new Promise((resolve, reject) => xml2js.parseString(trans,{explicitArray:false}, (err, res) => {
			if (err) reject(err);
			else resolve(res);
		}))

		return {type:'XML',trans:result.root}
	} catch (e) {
		return null;
	}

};


exports.convertXmlToJson = async (trans) => {
	try {
		return await this.isXML(trans) || this.isJson(trans)
	} catch (e) {
		return null
	}

}
