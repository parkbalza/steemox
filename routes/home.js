// routes/home.js

var express = require("express");
var router = express.Router();
var passport= require("../config/passport"); // 1
var steem = require("steem");
// Home
// router.get("/login", function(req, res){
//  res.render("home/login");
// });
router.get("/", function(req, res){
 res.render("home/welcome");
});
router.get("/gamestart", function(req, res){
 res.render("home/gamestart");
});
router.get("/gamelist", function(req, res){
 res.render("home/gamelist");
});
router.get("/gamedetail", function(req, res){
 res.render("home/gamedetail");
});

// Login // 2
router.get("/login", function (req,res) {
 var username = req.flash("username")[0];
 var errors = req.flash("errors")[0] || {};
 res.render("home/login", {
  username:username,
  errors:errors
 });
});

// Post Login // 3
router.post("/login",
 function(req,res,next){
  var errors = {};
  var isValid = true;
  // console.log("input console log",req.body,testch(req.body));
  var ret = false;
  steem.api.getAccounts([req.body.username],function(err,result){

    if(!result[0]){
      console.log("no id");
      req.flash("errors",errors);
      res.redirect("/login");
    }else{
      var pubWif = result[0].posting.key_auths[0][0];
      var privWif = req.body.password;
      var isvalid;
      try{isvalid = steem.auth.wifIsValid(privWif,pubWif);}
      catch(e){isvalid = false;}
      if(isvalid==true){
        ret = isvalid;
        console.log('good');
      }else{
        ret = isvalid;
        console.log('no');
      }

      if(isvalid){
       // next();
       errors.username = "is correct steemid after going...";
       req.flash("errors",errors);
       res.redirect("/login");
      } else {
       req.flash("errors",errors);
       res.redirect("/login");
      }
    }
  });
  if(!req.body.username){
   isvalid = false;
   errors.username = "Username is required!";
  }
  if(!req.body.password){
   isvalid = false;
   errors.password = "Password is required!";
  }
 },
 passport.authenticate("local-login", {
  successRedirect : "/",
  failureRedirect : "/login"
 }
));

// Logout // 4
router.get("/logout", function(req, res) {
 req.logout();
 res.redirect("/");
});

module.exports = router;
