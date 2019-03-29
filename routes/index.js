var express = require('express');
var router = express.Router();
var verification = express.Router();
var sanitizer = require('express-sanitizer');
var bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");
var Config = require("../config");
var User = require("../models/user");
var session = require('express-session');
var request = require("request-json");
var shortId = require("shortid");

var ejs = {
    msg : null,
    classB : null
};
router.use(sanitizer());
//router.use(compression());

function ejsChange(){
    ejs = {
        msg : null,
        classB : null
    }
}

verification.use((req, res, next)=> {
        const userCookie = req.session.sessionId;
        if (userCookie){
            jwt.verify(userCookie, Config.secretJWT, (err, result)=>{
                if (err) throw err;
                if (result) {
                    const sanitizeId = req.sanitize(result.sessionId);
                    User.findOne({'sessionId': sanitizeId}, "username",(err,userData)=>{
                        if (err) throw err;
                        if (userData)
                        {    
                            req.decode = userData;
                            //console.log(req.decode);
                            next();
                        }else{
                            res.render("index", {msg: "Please login again"});
                        }
                    });
                }
            });
        }else {
            res.render('index',{msg: null});// loggingStatus: undefined});
        }
    }
);

/* GET home page. */
router.get('/', verification, function(req, res, next) {
  res.render('home', {username: req.decode.username});
});

router.get("/auth/login", verification, (req, res, next)=>{
    res.render('home', {username: req.decode.username});
});

router.post('/auth/login', (req, res, next)=>{
    let reqBody = {
        password : req.sanitize(req.body.password),
        email : (req.sanitize(req.body.username)).toUpperCase()
    };
    
    const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/g;
    
    let query = null;
    
    if (emailRegex.test(reqBody.email)){
        query = {
            email : reqBody.email
        }
    }else{
        query = {
            username : reqBody.email
        }
    }
    let now = new Date;
    User.findOne(query, "username password", (err, data)=>{
        if (err) throw err;
        if (!data){
            res.render('index', ejs);        
        }else {
            bcrypt.compare(reqBody.password, data.password, (err, result) => {
                if (err) throw err;
                if (result){
                    //req.session.sessionId = "something";
                    const sessionId = shortId.generate();
                    
                    now.setMonth(now.getMonth()+1);
                    req.session.sessionId = `${jwt.sign({"sessionId": sessionId},Config.secretJWT,{expiresIn: '30day'})}`;
                    User.findOneAndUpdate(data._id,{$set:{'sessionId': sessionId,'lastLogin': Date.now()}},
                        (err,dataUpdate)=>{
                            if (err) throw err;
                            res.render('home', {username: dataUpdate.username});
                        });
                }else{
                    ejs.msg = "User not exist";
                    res.render("index", {msg: "User not exist"});
                }
            });
        }
    });
    ejsChange();
});

router.post('/auth/signup', (req,res, next)=>{
    let cn_pa = req.sanitize(req.body.cn_pswd);
    let data = {
        email : req.sanitize(((req.body.email)).toUpperCase()),
        password : req.sanitize((req.body.pswd)),
        username : req.sanitize(((req.body.username)).toUpperCase())
    };
    
    ejs.msg = "Registered Successfully";
    
    if (cn_pa == data.password){
        bcrypt.hash(data.password, Config.saltRounds, (errx, hashPass)=>{
            if (errx) throw errx;
            data.password = hashPass;
            User.create(data,(err, newData)=>{
                if (err){
                    if (err.name === 'MongoError' && err.code === 11000) {
                        ejs = {
                            msg : "Email already exist",
                            //classB : "warning"
                        }
                        return res.status(500).render('index',ejs);
                      }else{
                          throw err;
                      }
                }else if (newData){
                    console.log(newData);
                    return res.status(200).render('index',ejs);
                }
            })
        });
    }else{
        ejs.msg = "Password not matched";
        res.render('index',ejs);
    }
    ejsChange();
});

router.get("/logout", verification, (req, res)=>{
    req.session.destroy();
    ejs.msg = "Logout Successfully";
    User.findOneAndUpdate(req.decode._id, {$set:{'sessionId': null}},
        (err,updated)=>{
            if (err) throw err;
            res.render("index", ejs);
        });
    ejsChange();
});

module.exports = router;