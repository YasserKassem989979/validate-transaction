var xml2js = require('xml2js');
var fs = require('fs')
const utils = require('./utils/helpers')
const jso = require('./trans-samples/transaction.json')
const util = require('util')
fs.readFile(__dirname + '/trans-samples/transaction.xml',async (err, data) => {
    const x = await utils.convertXmlToJson(data)
    console.log(util.inspect(x.trans, false, null))
});