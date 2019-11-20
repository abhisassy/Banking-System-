const express	=	require('express')
const path		= 	require('path')
const fs		= 	require('fs')
var bodyParser 	=	require('body-parser')
var sqlite3 	=	require('sqlite3').verbose()
const cors 		=	require('cors')
const crypto    =   require('crypto')
const sha1      =   require('sha1')
const request   =   require('request')
const app		=	express()

var fs          = require('fs')
var config      = JSON.parse(fs.readFileSync('../config.json', 'utf8'))
const portNo	= config.testing.api.portNo
const dbUrl     = config.testing.url + ":" + config.testing.dbserver.portNo

app.use(bodyParser.json()); // support json encoded bodies

app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
// app.use(express.static(path.join(__dirname, 'frontEnd')))
app.use(cors())
cors({credentials: true, origin: true})

app.all("/*",function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});

// Transaction APIs
app.post("/withdrawMoney", function(req, res, next) {
    console.log("withdrawMoney API called")
    
    axios.get(dbUrl+"/withdrawMoney",{
		params :{
            customerId  : req.body.customerId,
            accountId   : req.body.accountId,
            amount      : req.body.amount
        }
    })
    .then(response => {
        res.status(response.status).sendFile(path.join(__dirname, homePage));
    })
	  .catch(error => {
            console.log(error.response.data)
            console.log(error.response.status)
            res.status(error.response.status).send(error.response.data)
    })
})

app.post("/depositMoney", function(req, res, next) {
    console.log("depositMoney API called")
    axios.get(dbUrl+"/depositMoney",{
		params :{
            customerId  : req.body.customerId,
            accountId   : req.body.accountId,
            amount      : req.body.amount
        }
    })
    .then(response => {
        res.status(response.status).sendFile(path.join(__dirname, homePage));
    })
	  .catch(error => {
            console.log(error.response.data)
            console.log(error.response.status)
            res.status(error.response.status).send(error.response.data)
    })
})

app.post("/instantTransfer", function(req, res, next) {
    console.log("instantTransfer API called")

    axios.get(dbUrl+"/instantTransfer",{
		params :{
            customerId  : req.body.customerId,
            amount      : req.body.amount,
            srcAccount  : req.body.srcAccount,
            destAccount : req.body.destAccount,
            priority    : "true"
        }
    })
    .then(response => {
        res.status(response.status).sendFile(path.join(__dirname, homePage));
    })
	  .catch(error => {
            console.log(error.response.data)
            console.log(error.response.status)
            res.status(error.response.status).send(error.response.data)
    })

})

app.post("/upiTransfer", function(req, res, next) {
    console.log("upiTransfer API called")

    axios.get(dbUrl+"/upiTransfer",{
		params :{
            customerId  : req.body.customerId,
            amount      : req.body.amount,
            srcUPI      : req.body.srcUPI,
            destUPI     : req.body.destUPI

        }
    })
    .then(response => {
        res.status(response.status).sendFile(path.join(__dirname, homePage));
    })
	  .catch(error => {
            console.log(error.response.data)
            console.log(error.response.status)
            res.status(error.response.status).send(error.response.data)
    })
})

app.post("/normalTransfer", function(req, res, next) {
    console.log("normalTransfer API called")
    axios.get(dbUrl+"/upiTransfer",{
		params :{
            customerId  : req.body.customerId,
            amount      : req.body.amount,
            srcAccount  : req.body.srcAccount,
            destAccount : req.body.destAccount
        }
    })
    .then(response => {
        res.status(response.status).sendFile(path.join(__dirname, homePage));
    })
	  .catch(error => {
            console.log(error.response.data)
            console.log(error.response.status)
            res.status(error.response.status).send(error.response.data)
    })

})

app.get("/checkBalance", function(req, res, next) {
    console.log("checkBalanceBalance API called")
    
    axios.get(dbUrl+"/checkBalance",{
        params :{
            customerId  : req.body.customerId,
            accountId   : req.body.accountId,
        }
    })
    .then(response => {
        res.status(response.status).send(response.data)
    })
	.catch(error => {
            console.log(error.response.data)
            console.log(error.response.status)
            res.status(error.response.status).send(error.response.data)
    })
})


//Account Management

app.get("/getProfile", function(req, res, next) {
    console.log("getProfile API called")
    
    axios.get(dbUrl+"/getProfile",{
        params :{
            customerId  : req.body.customerId,
        }
    })
    .then(response => {
        res.status(response.status).send(response.data)
    })
	.catch(error => {
            console.log(error.response.data)
            console.log(error.response.status)
            res.status(error.response.status).send(error.response.data)
    })
})

app.post("/updateProfile", function(req, res, next) {
    console.log("updateProfile API called")
})

app.post("/newAccount", function(req, res, next) {
    console.log("newAccount API called")
    
    axios.get(dbUrl+"/newAccount",{
        params :{
            customerId  : req.body.customerId,
            balance     : req.body.balance,
            status      : req.body.status,
            cards       : 0
        }
    })
    .then(response => {
        res.status(response.status).send(response.data)
    })
	.catch(error => {
            console.log(error.response.data)
            console.log(error.response.status)
            res.status(error.response.status).send(error.response.data)
    })
})

app.post("/deleteAccount", function(req, res, next) {
    console.log("deleteAccount API called")

    axios.get(dbUrl+"/deleteAccount",{
        params :{
            customerId  : req.body.customerId,
            accountID   : req.body.accountId,
            status      : req.body.status
        }
    })
    .then(response => {
        res.status(response.status).send(response.data)
    })
	.catch(error => {
            console.log(error.response.data)
            console.log(error.response.status)
            res.status(error.response.status).send(error.response.data)
    })
})

app.get("/getAccountInfo", function(req, res, next) {
    console.log("getAccountInfo API called")
    
    axios.get(dbUrl+"/getAccountInfo",{
        params :{
            customerId  : req.body.customerId,
            accountID   : req.body.accountId
        }
    })
    .then(response => {
        res.status(response.status).send(response.data)
    })
	.catch(error => {
            console.log(error.response.data)
            console.log(error.response.status)
            res.status(error.response.status).send(error.response.data)
    })

})

app.post("/addCard", function(req, res, next) {
    console.log("addCard API called")
    
    axios.get(dbUrl+"/addCard",{
        params :{
            customerId  : req.body.customerId,
            accountID   : req.body.accountId,
            type        : req.body.type
        }
    })
    .then(response => {
        res.status(response.status).send(response.data)
    })
	.catch(error => {
            console.log(error.response.data)
            console.log(error.response.status)
            res.status(error.response.status).send(error.response.data)
    })
})

app.get("/getCardInfo", function(req, res, next) {
    console.log("getCardInfo API called")

    axios.get(dbUrl+"/getCardInfo",{
        params : {
            customerId  : req.body.customerId,
            cardNo   : req.body.cardNo
        }
    })
    .then(response => {
        res.status(response.status).send(response.data)
    })
	.catch(error => {
            console.log(error.response.data)
            console.log(error.response.status)
            res.status(error.response.status).send(error.response.data)
    })

})

app.post("/deteleCard", function(req, res, next) {
    console.log("deteleCard API called")
    axios.get(dbUrl+"/deleteCard",{
        params : {
            customerId  : req.body.customerId,
            cardNo      : req.body.cardNo,
            expiry      : req.body.expiry,
            cvv         : req.body.cvv
        }
    })
    .then(response => {
        res.status(response.status).send(response.data)
    })
	.catch(error => {
            console.log(error.response.data)
            console.log(error.response.status)
            res.status(error.response.status).send(error.response.data)
    })
})


//Loan Services

app.post("/applyLoan", function(req, res, next) {
    console.log("applyLoan API called")
})

app.post("/updateLoan", function(req, res, next) {
    console.log("updateLoan API called")
})

app.get("/viewLoan", function(req, res, next) {
    console.log("viewLoan API called")
})


// Priviliged Accounts

app.get("/viewTransactions", function(req, res, next) {
    console.log("viewTransactions API called")
})

app.post("/approveTransactions", function(req, res, next) {
    console.log("approveTransactions API called")
})

app.get("/viewLoans", function(req, res, next) {
    console.log("viewLoans API called")
})

app.post("/approveLoans", function(req, res, next) {
    console.log("approveLoans API called")
})


//General
app.get('*',function(req,res){
	res.status(404).send("This is not a valid path")
})

app.listen(portNo)