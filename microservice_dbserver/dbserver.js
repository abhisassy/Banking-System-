const express	= require('express')
const path		= require('path')
var bodyParser  = require('body-parser')
var sqlite3 	= require('sqlite3').verbose()
const cors 		= require('cors')
const app		= express()

// setup configurations 
var fs          = require('fs')
var config      = JSON.parse(fs.readFileSync('../config.json', 'utf8'))
const portNo	= config.testing.dbserver.portNo
const dbPath 	= config.testing.dbserver.dbPath


app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.use(cors())
cors({credentials: true, origin: true})
app.all("/*",function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});

//Singelton
var Database = (function () {
    var instance;
 
    function createInstance() {
        var object = new sqlite3.Database(dbPath);
        return object;
    }
 
    return {
        getInstance: function () {
            if (!instance) {
                instance = createInstance();
            }
            return instance;
        }
    };
})();
 

// add a user 
app.get('/adduser',function(req,res){
 
	//console.log(req.query.customerId);
	//console.log(req.query.password);

	var db = Database.getInstance();
	db.get("select * from Customer where customerId='"+req.query.customerId+"'",function(err,row){
		// /console.log(row);
		if(!row){
			res.status(209).send("Invalid Customer Id!");
			return;
		}
	
		db.get("select * from Users where customerId='"+req.query.customerId+"'",function(err,row){
		
			if(!row){			
				db.run("insert into Users values('"+req.query.customerId+"', '"+req.query.password+"', '"+req.query.recoveryQ+"', '"+req.query.recoveryA+"')")
				res.status(201).send("User Details Added")
			}
			else{
				res.status(409).send("An existing account is linked with this Custome ID!");
			}

		})
	})
})

//list users 
app.get('/listusers',function(req,res){

	var db = Database.getInstance();
	
	db.all("select firstName, lastName from Users,Customer where Users.customerId=Customer.customerId",function(err,row){
		if(row.length){
			var list =[]
			for (var i = 0; i <row.length; i++) {
				list[i] = row[i]['firstName'] + " "+ row[i]['lastName']
			}
			console.log(list)
			res.status(200).send(list)
		}
		else{
			res.status(204).send("No users!")
		}
	})
})

// delette a user 
app.get("/removeuser",function(req,res){
	
	var db = Database.getInstance();
	db.get("select * from Customer where customerId='"+req.query.customerId+"'",function(err,row){
		//console.log(row);
		if(!row){
			res.status(400).send("Invalid Customer Id!");
			return;
		}
		db.get("select * from users where customerId='"+req.query.customerId+"'",function(err,row){
			if(row){	
				db.run("delete from users where customerId='"+req.query.customerId+"'")
				res.status(200).send("User Successfully Deleted.")	
			}
			else res.status(400).send("No account linked to CustomerId!")
		})
	})
})


//validate 
app.get("/validateuser",function(req,res){
	var db = Database.getInstance();

	db.get("select * from Customer where customerId='"+req.query.customerId+"'",function(err,row){
		//console.log(row);
		if(!row){
			res.status(400).send("Invalid Customer Id!");
			return;
		}
		db.get("select password from users where customerId='"+req.query.customerId+"'",function(err,row){
			if(row){

				if(row["password"] == req.query.password){
					res.status(200).send("CustomerId and password match.");
				}
				else{	
					res.status(400).send("CustomerId and password do not match.");
				}
			}
			else res.status(400).send("No account linked to CustomerId!")
		})
	})


})

//Withdraw Money
app.get("/withdrawMoney", function(req, res) {
	var db = Database.getInstance();
	console.log("withdrawMoney on DBServer")
	console.log(req.query)
	db.get("select * from Customer, Account where Customer.customerID = Account.customerID AND Account.customerID='"+req.query.customerId+"' AND accountId='"+req.query.accountId+"'",function(err,row){

		if(!row){
			res.status(209).send("{'result':'Error', 'Error':'Invalid Customer Id/Account Id/No Account for Customer!'}");
			return;
		}
		else{
			db.get("select * from Account where accountID='"+req.query.accountId+"'",function(err,row){
				console.log(row)
				if(row['balance']<req.query.amount){			
					res.status(209).send("{'result':'Error', 'Error':'Not Enough Balance'}");
					return;
				}
				else{
					db.run("update Account set balance = balance - "+req.query.amount+" where customerID='"+req.query.customerId+"' AND accountId='"+req.query.accountId+"'")
					res.status(200).send(row);
				}
				
			})
		}
	})

})
app.get("/depositMoney", function(req, res) {
	var db = Database.getInstance();
	console.log("depositMoney on DBServer")
	console.log(req.query)
	db.get("select * from Customer, Account where Customer.customerID = Account.customerID AND Account.customerID='"+req.query.customerId+"' AND accountId='"+req.query.accountId+"'",function(err,row){
		console.log("select * from Customer, Account where Customer.customerID = Account.customerID AND Account.customerID='"+req.query.customerId+"' AND accountId='"+req.query.accountId+"'")
		if(!row){
			res.status(209).send("{'result':'Error', 'Error':'Invalid Customer Id/Account Id/No Account for Customer!'}");
			return;
		}
		else{
			db.get("select * from Account where accountID='"+req.query.accountId+"'",function(err,row){
				console.log(row)
				db.run("update Account set balance = balance + "+req.query.amount+" where customerID='"+req.query.customerId+"' AND accountId='"+req.query.accountId+"'")
				res.status(200).send(row);
			})
		}
	})
})

app.get("/instantTransfer", function(req, res) {
	var db = Database.getInstance();
	console.log("instantTransfer on DBServer")
	console.log(req.query)
	db.get("select * from Customer, Account where Customer.customerID = Account.customerID AND Account.customerID='"+req.query.customerId+"' AND accountId='"+req.query.srcAccount+"'",function(err,row){
		console.log("select * from Customer, Account where Customer.customerID = Account.customerID AND Account.customerID='"+req.query.customerId+"' AND accountId='"+req.query.srcAccount+"'")
		if(!row){
			res.status(209).send("{'result':'Error', 'Error':'Invalid Customer Id/Account Id/No Account for Customer!'}");
			return;
		}
		else{
			db.get("select * from Account where accountID='"+req.query.srcAccount+"'",function(err,row){
				console.log(row)
				if(row['balance']<req.query.amount){			
					res.status(209).send("{'result':'Error', 'Error':'Not Enough Balance'}");
					return;
				}
				else if(req.query.priority=="true") {
					db.get("select * from Account where accountID='"+req.query.srcAccount+"'",function(err,row) {
						if(!row) {
							res.status(209).send("{'result':'Error', 'Error':'Invalid Destination Account Id!'}");
							return;
						}
					})
					db.run("update Account set balance = balance - "+req.query.amount+" where customerID='"+req.query.customerId+"' AND accountId='"+req.query.srcAccount+"'")
					db.run("update Account set balance = balance + "+req.query.amount+" where accountId='"+req.query.destAccount+"'")
					db.run("insert into 'transaction' values ('"+req.query.destAccount+"', '"+req.query.srcAccount+"', '"+req.query.amount+"', '"+req.query.priority+"', "+"NULL"+")")
					res.status(200).send(row);
				}
				else {
					db.get("select * from Account where accountID='"+req.query.srcAccount+"'",function(err,row) {
						if(!row) {
							res.status(209).send("{'result':'Error', 'Error':'Invalid Destination Account Id!'}");
							return;
						}
					})
					db.run("update Account set balance = balance - "+req.query.amount+" where customerID='"+req.query.customerId+"' AND accountId='"+req.query.srcAccount+"'")
					db.run("insert into 'transaction' values ('"+req.query.destAccount+"', '"+req.query.srcAccount+"', '"+req.query.amount+"', '"+req.query.priority+"', "+"NULL"+")")
					res.status(200).send(row);
				}
				
			})
		}
	})

})

app.get("/upiTransfer", function(req, res) {
	var db = Database.getInstance();
	console.log("withdrawMoney on DBServer")
	console.log(req.query)
	db.get("select * from Customer, Account where Customer.customerID = Account.customerID AND Account.customerID='"+req.query.customerId+"' AND UPI='"+req.query.srcUPI+"'",function(err,row){

		if(!row){
			res.status(209).send("{'result':'Error', 'Error':'Invalid Customer Id/Account Id/No Account for Customer!'}");
			return;
		}
		else{
			db.get("select * from Account where UPI='"+req.query.srcUPI+"'",function(err,row){
				console.log(row)
				if(row['balance']<req.query.amount){			
					res.status(209).send("{'result':'Error', 'Error':'Not Enough Balance'}");
					return;
				}
				else {
					db.get("select * from Account where UPI='"+req.query.srcUPI+"'",function(err,row) {
						if(!row) {
							res.status(209).send("{'result':'Error', 'Error':'Invalid Destination Account Id!'}");
							return;
						} else{
							db.run("update Account set balance = balance - "+req.query.amount+" where customerID='"+req.query.customerId+"' AND UPI='"+req.query.srcUPI+"'")
							db.run("update Account set balance = balance + "+req.query.amount+" where UPI='"+req.query.destUPI+"'")
							db.run("insert into 'UPItransaction' values ('"+req.query.srcUPI+"', '"+req.query.destUPI+"', '"+req.query.amount+"', "+"NULL"+")")
							res.status(200).send(row);
						}
					})
				}
				
			})
		}
	})
})

app.get("/normalTransfer", function(req, res) {
	var db = Database.getInstance();
	console.log("normalTransfer on DBServer")
	console.log(req.query)
	db.get("select * from Customer, Account where Customer.customerID = Account.customerID AND Account.customerID='"+req.query.customerId+"' AND accountId='"+req.query.srcAccount+"'",function(err,row){

		if(!row){
			res.status(209).send("{'result':'Error', 'Error':'Invalid Customer Id/Account Id/No Account for Customer!'}");
			return;
		}
		else{
			db.get("select * from Account where accountID='"+req.query.srcAccount+"'",function(err,row){
				console.log(row)
				if(row['balance']<req.query.amount){			
					res.status(209).send("{'result':'Error', 'Error':'Not Enough Balance'}");
					return;
				}
				else if(req.query.priority=="true") {
					db.get("select * from Account where accountID='"+req.query.srcAccount+"'",function(err,row) {
						if(!row) {
							res.status(209).send("{'result':'Error', 'Error':'Invalid Destination Account Id!'}");
							return;
						}
					})
					db.run("update Account set balance = balance - "+req.query.amount+" where customerID='"+req.query.customerId+"' AND accountId='"+req.query.srcAccount+"'")
					db.run("update Account set balance = balance + "+req.query.amount+" where accountId='"+req.query.destAccount+"'")
					db.run("insert into 'transaction' values ('"+req.query.destAccount+"', '"+req.query.srcAccount+"', '"+req.query.amount+"', '"+req.query.priority+"', "+"NULL"+")")
					res.status(200).send(row);
				}
				else {
					db.get("select * from Account where accountID='"+req.query.srcAccount+"'",function(err,row) {
						if(!row) {
							res.status(209).send("{'result':'Error', 'Error':'Invalid Destination Account Id!'}");
							return;
						}
					})
					db.run("update Account set balance = balance - "+req.query.amount+" where customerID='"+req.query.customerId+"' AND accountId='"+req.query.srcAccount+"'")
					db.run("insert into 'transaction' values ('"+req.query.destAccount+"', '"+req.query.srcAccount+"', '"+req.query.amount+"', '"+req.query.priority+"', "+"NULL"+")")
					res.status(200).send(row);
				}
				
			})
		}
	})
})

app.get("/getProfile", function(req, res) {
	var db = Database.getInstance();
	console.log("getProfile on DBServer")
	console.log(req.query)
	db.get("select * from Customer where customerID ='"+req.query.customerId+"'",function(err,row){

		if(!row){
			res.status(209).send("{'result':'Error', 'Error':'Invalid Customer Id!'}");
			return;
		}
		else{
			console.log(row)
			res.status(200).send(row);
		}
	})
})
app.get("/updateProfile", function(req, res) {
	var db = Database.getInstance();
	console.log("withdrawMoney on DBServer")
	console.log(req.query)
	db.get("select * from Customer where customerID ='"+req.query.customerId+"'",function(err,row){

		if(!row){
			res.status(209).send("{'result':'Error', 'Error':'Invalid Customer Id!'}");
			return;
		}
		else{
			db.run("update Customer set firstName = '"+req.query.firstName+"',lastName = '"+req.query.lastName+"', email = '"+req.query.email+"' where customerID = '"+req.query.customerId+"'")
			db.get("select * from Customer where customerID ='"+req.query.customerId+"'",function(err,row){

				if(!row){
					res.status(209).send("{'result':'Error', 'Error':'No Update!'}");
					return;
				}
				else{
					console.log(row)
					res.status(200).send(row);
					return;
				}
			})
			
		}
	})
})

function randomIntInc(low, high) {
	return Math.floor(Math.random() * (high - low + 1) + low)
}

app.get("/newAccount", function(req, res) {
	var db = Database.getInstance();
	console.log("newAccount on DBServer")
	console.log(req.query)
	db.get("select * from Customer where customerID ='"+req.query.customerId+"'",function(err,row){

		if(!row){
			res.status(209).send("{'result':'Error', 'Error':'Invalid Customer Id!'}");
			return;
		}
		else{
			const id = randomIntInc(100,10000)
			let accountID = "AC"+id.toString()
			db.run("insert into Account values ('"+accountID+"', '"+req.query.customerId+"',0 , '"+accountID+"@okbank',0 , 'active')")
			db.get("select * from Account where accountID ='"+accountID+"'",function(err,row){

				if(!row){
					res.status(209).send("{'result':'Error', 'Error':'No New Account!'}");
					return;
				}
				else{
					console.log(row)
					res.status(200).send(row);
					return;
				}
			})
			
		}
	})
})

app.get("/deleteAccount", function(req, res) {
	var db = Database.getInstance();
	console.log("newAccount on DBServer")
	console.log(req.query)
	db.get("select * from Customer, Account where Customer.customerID = Account.customerID AND Account.customerID='"+req.query.customerId+"' AND accountId='"+req.query.accountID+"'",function(err,row){

		if(!row){
			res.status(209).send("{'result':'Error', 'Error':'Invalid Customer Id/Account Id'}");
			return;
		}
		else{
			db.get("select * from Users where customerID ='"+req.query.customerId+"'",function(err,row){
				var pwd = row['password']
				console.log(row)

				db.get("select * from Account where accountID ='"+req.query.accountID+"'",function(err,row){
					console.log(row)
					if(!row){
						res.status(209).send("{'result':'Error', 'Error':'No Account Present!'}");
						return;
					} else if((req.query.password == pwd) && (row['status']=="active") && (row['balance']<1)){
						db.run("delete from Account where accountId='"+req.query.accountID+"'")
						console.log(row)
						res.status(200).send({'result':'Deleted', 'Message':'Deleted Account No. '+req.query.accountID+' successfully'});
						return;
					} else {
						res.status(209).send("{'result':'Error', 'Error':'Credential Matching Issue'}");
						return;
					}
				})
			})
			
		}
	})
})
app.get("/getAccountInfo", function(req, res) {
	var db = Database.getInstance();
	console.log("getAccountInfo on DBServer")
	console.log(req.query)
	db.get("select * from Customer, Account where Customer.customerID = Account.customerID AND Account.customerID='"+req.query.customerId+"' AND accountId='"+req.query.accountId+"'",function(err,row){

		if(!row){
			res.status(209).send("{'result':'Error', 'Error':'Invalid Customer Id/Account Id/No Account for Customer!'}");
			return;
		}
		else{	
			db.get("select * from Account where accountID='"+req.query.accountId+"'",function(err,row){
				console.log(row)
				res.status(200).send(row);
			})
		}
	})
})
app.get("/addCard", function(req, res) {
	var db = Database.getInstance();
	console.log("newAccount on DBServer")
	console.log(req.query)
	
	db.get("select * from Customer, Account where Customer.customerID = Account.customerID AND Account.customerID='"+req.query.customerId+"' AND accountId='"+req.query.accountID+"'",function(err,row){

		if(!row){
			res.status(209).send("{'result':'Error', 'Error':'Invalid Customer Id!'}");
			return;
		}
		else{
			let num = randomIntInc(1000,10000)
			let cardnum = ""+num.toString()
			num = randomIntInc(1000,10000)
			cardnum += num.toString()
			num = randomIntInc(1000,10000)
			cardnum += num.toString()
			
			let expMonth = randomIntInc(10,13)
			let expYear = randomIntInc(22,27)
			let cvv = randomIntInc(100,999)
			let pin = randomIntInc(1000,9999)
			
			db.run("insert into cards values ('"+req.query.accountID+"', '"+cardnum+"', '"+expMonth+"-"+expYear+"', '"+cvv+"', '"+pin+"', '"+req.query.type+"')")
			db.get("select * from cards where cardNo ='"+cardnum+"'",function(err,row){

				if(!row){
					res.status(209).send("{'result':'Error', 'Error':'No New Card'}");
					return;
				}
				else{
					console.log(row)
					res.status(200).send(row);
					return;
				}
			})
			
		}
	})
})
app.get("/getCardInfo", function(req, res) {
	var db = Database.getInstance();
	console.log("newAccount on DBServer")
	console.log(req.query)
	
	db.get("select * from Customer, Account, cards where cards.accountID = Account.accountID AND Customer.customerID = Account.customerID AND Account.customerID='"+req.query.customerId+"' AND cardNo='"+req.query.cardNo+"'",function(err,row){

		if(!row){
			res.status(209).send("{'result':'Error', 'Error':'Invalid Customer Id/ Card No.!'}");
			return;
		}
		else{
			db.get("select * from cards where cardNo ='"+req.query.cardNo+"'",function(err,row){

				if(!row){
					res.status(209).send("{'result':'Error', 'Error':'No Card'}");
					return;
				}
				else{
					console.log(row)
					res.status(200).send(row);
					return;
				}
			})
			
		}
	})
})
app.get("/deteleCard", function(req, res) {

})
app.listen(portNo)