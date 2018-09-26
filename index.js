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
var server = require('http').createServer(app);
var io = require('socket.io')(server);

var fs = require('fs');
var csvParser = require('csv-parse');
// var server = require('http').Server(app);
// var io = require('socket.io')(server);
// var socketEvents = require('./socket.js');
// var SocketIo = require('socket.io');
var questions = null;
var userlist = [{name:'name',select:0}];


//csv parse test
fs.readFile("./questions.csv",{
  encoding:'utf-8'
},function(err,csvData){
  if(err){
    console.log(err);
  }
  csvParser(csvData,{
    delimiter:','
  },function(err,data){
    if(err){
      console.log(err);
    }else{
      questions = data;
      // console.log('length is : ',data.length);
      var Rnum = getRandomInt(0,data.length);
      console.log('random q is : '+data[Rnum][1]+', a is : '+data[Rnum][2]);
      // for(var i=0;i<data.length;i++){
      //   console.log('n is : ',data[i][0],' , q is : ',data[i][1],' , a is : ',data[i][2]);
      // }
    }
  });
});

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
app.use("/rooms", require("./routes/rooms"));

io.on('connection',function(socket){
  socket.on('login',function(data){
    console.log('Client logged-in:\n name:'+data.name +'\n userid:'+data.userid);

    socket.name = data.name;
    socket.userid = data.userid;
    var Rnum = getRandomInt(0,1);
    var userData = {
      name:data.name,
      select:Rnum,
      qnum:-1
    };
    userlist.push(userData);
    for(var i=0;i<userlist.length;i++){
      console.log("user name list is : "+userlist[i].name);
    }
    io.emit('login',data.name);
  });

  socket.on('chat',function(data){
    console.log('Message from %s:%s',socket.name,data.msg);

    var msg = {
      from:{
        name: socket.name,
        userid: socket.userid
      },
      msg: data.msg
    };
    // socket.broadcast.emit('chat',msg);
    io.emit('chat',msg);
  });

  socket.on('selectyes',function(data){
    for(var i=0;i<userlist.length;i++){
      if(userlist[i].name==socket.name){
        userlist[i].select = 1;
        console.log(socket.name+", set yes");
      }
    }
  });

  socket.on('selectno',function(data){
    for(var i=0;i<userlist.length;i++){
      if(userlist[i].name==socket.name){
        userlist[i].select = 2;
        console.log(socket.name+", set no");
      }
    }
  });

  socket.on('gameStart',function(data){
    console.log("gameStart",socket.name,data.msg);
    var Rnum = getRandomInt(0,questions.length);
    for(var i=0;i<userlist.length;i++){
      if(userlist[i].name==socket.name){
        userlist[i].qnum=Rnum;
      }
    }
    var msg = {
      from:{
        name:socket.name,
        userid:socket.userid
      },
      msg:questions[Rnum][1]
    };
    io.to(socket.id).emit('chat',msg);
    setTimeout(function(){
      for(var i=0;i<userlist.length;i++){
        if(userlist[i].name==socket.name){
          console.log(userlist[i].name+', select is : '+userlist[i].select+', and answer is : '+questions[Rnum][2]);
          if(userlist[i].select==questions[Rnum][2]){
            msg = {
              from:{
                name:socket.name,
                userid:socket.userid
              },
              msg:"정답입니다."
            };
          }else{
            msg = {
              from:{
                name:socket.name,
                userid:socket.userid
              },
              msg:"틀렸습니다."
            };
          }
          io.to(socket.id).emit('chat',msg);
        }
      }
    },5000);
    // setTimeout(function(){
    //   var msg = {
    //     from:{
    //       name: socket.name,
    //       userid:socket.userid
    //     },
    //     msg:questions[0][1]
    //   };
    //   io.to(socket.id).emit('chat',msg);
    // },1500);
  });

  socket.on('forceDisconnect',function(data){
    console.log("force disconnect"+data);
    socket.disconnect();
  });

  socket.on('disconnect',function(){
    console.log('user disconnected: '+socket.name);
    for(var i=0;i<userlist.length;i++){
      if(userlist[i].name==socket.name){
        userlist.splice(i,1);
      }
    }
  });
});

server.listen(3000,function(){
  console.log('Socket IO server listening on port 3000');
});

// // server.listen(5000);
// // Port setting
// app.listen(3000, function(){
//  console.log("server on!");
// });

function getRandomInt(min,max){
  return Math.floor(Math.random()*(max-min))+min;
}

// var server = app.listen(3000,function(){
//   console.log('server on!');
// });
// var io = SocketIo(server);
// io.on();
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
