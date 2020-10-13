var express = require('express');
var router = express.Router();
var verification = express.Router();
var sanitizer = require('express-sanitizer');
//var bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");
var Config = require("../config");
var User = require("../models/user");
var session = require('express-session');
var request = require("request-json");
var shortId = require("shortid");
var Histroy = require("../models/history");
var url = require("url");

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

router.get("/search?", verification, (req, res)=>{
    var url_parts = url.parse(req.url, true);
    var query = url_parts.query;

    console.log(query); //{Object}
    console.log(req.ip);
    console.log(req.params);
    console.log(req.query);
    res.status(200).send("OK");
});

router.get("/history", verification, (req, res)=>{
    Histroy({userObjId: req.decode._id}, "searches", (err, dataGet)=>{
        if (err) throw err;
        return res.status(200).render("history", {data: dataGet}); // Don't move to next steps after rendering
    });
});

module.exports = router;
