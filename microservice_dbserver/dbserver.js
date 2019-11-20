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
	
	db.get("select * from Customer, Account where Customer.customerID = Account.customerID AND customerId='"+req.query.customerId+"' AND accountID='"+req.query.accountId+"'",function(err,row){

		if(!row){
			res.status(209).send("Invalid Customer Id/Account Id/No Account for Customer!");
			return;
		}
	
		db.get("select * from Users where customerId='"+req.query.customerId+"'",function(err,row){
		
			if(!row){			
				db.run("insert into Users values('"+req.query.customerId+"', '"+req.query.password+"', '"+req.query.recoveryQ+"', '"+req.query.recoveryA+"')")
				res.status(201).send("User Details Added")
			}
			else{
				res.status(409).send("An existing account is linked with this Customer ID!");
			}

		})
	})
})
app.get("/depositMoney", function(req, res) {

})
app.get("/instantTransfer", function(req, res) {

})
app.get("/upiTransfer", function(req, res) {

})
app.get("/normalTransfer", function(req, res) {

})
app.get("/checkBalance", function(req, res) {

})
app.get("/getProfile", function(req, res) {

})
app.get("/updateProfile", function(req, res) {

})
app.get("/newAccount", function(req, res) {

})
app.get("/deleteAccount", function(req, res) {

})
app.get("/getAccountInfo", function(req, res) {

})
app.get("/addCard", function(req, res) {

})
app.get("/getCardInfo", function(req, res) {

})
app.get("/deteleCard", function(req, res) {

})
app.listen(portNo)