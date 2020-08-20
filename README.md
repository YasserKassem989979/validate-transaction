# validate-transaction

### Quick start

Prerequisites:
- [Git](http://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
- [Node.js](https://nodejs.org)

Now just clone and start the app:

```sh
git clone https://github.com/YasserKassem989979/validate-transaction.git
cd validate-transaction
npm i
npm test
```

### Structure of the project

Validator in `index.js` with the following methods:
- `validateItemsTaxes` : to validate the taxes for each item of transaction
- `validateItemsTaxesForJson` : to validate taxes for each item of json format
- `validateItemsTaxesForXml` : to validate taxes for each item of xml format
- `validateTransactionTaxes` : to validate taxes applied on transaction 

all methods require transaction as argument.