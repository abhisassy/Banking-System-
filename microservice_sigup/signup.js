const express	=	require('express')
const path		= 	require('path')
var bodyParser 	=	require('body-parser')
const cors 		=	require('cors')
const axios     =   require('axios')
const app		=	express()


// setup configurations 
var fs          = require('fs')
var config      = JSON.parse(fs.readFileSync('../config.json', 'utf8'))
const portNo	= config.testing.signup.portNo
const dbUrl     = config.testing.url + ":" + config.testing.dbserver.portNo


app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.use(cors())
cors({credentials: true, origin: true})
app.all("/*",function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});

//add user { sent data via xxx-url-encoded }
app.post('/add/user',function(req,res){

    // atleast 1 upper , 1 lower, 1 special , 1 number and minimal length of 16
    var format = /^(?=[a-zA-Z0-9_-~!%+\-/^(){}[\]#@$?]{16,}$)(?=.*?[a-z])(?=.*?[A-Z])(?=.*?[0-9]).*/
    if(!req.body.password.match(format)){
        res.status(409).send("password does not follow rules!")
    }

    axios.get(dbUrl+"/adduser",{
		params :{
            customerId :  req.body.customerId,
            password   :  req.body.password,
            recoveryQ  :  req.body.revoceryQ,
            recoveryA  :  req.body.revoceryA,
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

//list all users
app.get('/list/users',function(req,res){

    axios.get(dbUrl+"/listusers",{
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

//remove user { sent data via params }
app.delete('/remove/user',function(req,res){
   
    axios.get(dbUrl+"/removeuser",{
        params:{
            customerId : req.query.customerId
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



app.get('*',function(req,res){
	res.status(404).send("This is not a valid path")
})



app.listen(portNo)