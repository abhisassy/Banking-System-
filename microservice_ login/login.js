const express	=	require('express')
const path		= require('path')
var bodyParser=	require('body-parser')
const cors 		=	require('cors')
const axios   = require('axios')
const app		  =	express()


// setup configurations 
var fs          = require('fs');
var config      = JSON.parse(fs.readFileSync('../config.json', 'utf8'));
const portNo	  = config.testing.login.portNo
const dbUrl     = config.testing.url + ":" + config.testing.dbserver.portNo
const homePage  = config.testing.homePage


app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.use(cors())
cors({credentials: true, origin: true})
app.all("/*",function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});



app.post('/validate/user', function(req,res){
  
  axios.get(dbUrl+"/validateuser",{
		params :{
            customerId :  req.body.customerId,
            password   :  req.body.password,
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


app.get("/test",function(req,res){
  console.log("yup");
  res.sendFile(path.join(__dirname, "home.html"))
})





app.listen(portNo)