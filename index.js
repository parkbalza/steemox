// index.js

var express    = require("express");
var mongoose   = require("mongoose");
var bodyParser  = require("body-parser");
var methodOverride = require("method-override");
var flash     = require("connect-flash"); // 1
var session    = require("express-session"); // 1
var passport   = require("./config/passport"); // 1
var steem = require('steem');
var app = express();

// DB setting
mongoose.connect(process.env.MONGO_DB); // 1
var db = mongoose.connection;
db.once("open", function(){
 console.log("DB connected");
});
db.on("error", function(err){
 console.log("DB ERROR : ", err);
});

// Other settings
app.set("view engine", "ejs");
app.use(express.static(__dirname+"/public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.use(flash()); // 2
app.use(session({secret:"MySecret"})); // 3
app.use(passport.initialize());
app.use(passport.session());



// Custom Middlewares // 3
app.use(function(req,res,next){
 res.locals.isAuthenticated = req.isAuthenticated();
 res.locals.currentUser = req.user;
 next();
});

// Routes
app.use("/", require("./routes/home"));
app.use("/posts", require("./routes/posts")); // 1
app.use("/users", require("./routes/users")); // 1


// Port setting
app.listen(3000, function(){
 console.log("server on!");
});
//
// steem.api.getAccounts(['devpark'],function(err,result){
//         // console.log('data is : ',result);
//         var pubWif = result[0].posting.key_auths[0][0];
//         var privWif = '5KRCyXEDVCBbfWxUgLpqujZpr4Zmg2Xdh9ujcpirPqxCka7vpEH';
//         var isvalid;
//         try{isvalid = steem.auth.wifIsValid(privWif,pubWif);}
//         catch(e){isvalid = false;}
//         if(isvalid==true){
//           console.log('good');
//         }else{
//           console.log('no');
//         }
//       });
