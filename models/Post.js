// models/Post.js

var mongoose = require("mongoose");
var util  = require("../util"); // 1

// schema
var postSchema = mongoose.Schema({
 title:{type:String, required:[true,"Title is required!"]},
 body:{type:String, required:[true,"Body is required!"]},
 author:{type:mongoose.Schema.Types.ObjectId, ref:"user", required:true}, //1
 createdAt:{type:Date, default:Date.now},
 updatedAt:{type:Date},
},{
 toObject:{virtuals:true}
});

// virtuals
postSchema.virtual("createdDate")
.get(function(){
 return util.getDate(this.createdAt); // 1
});

postSchema.virtual("createdTime")
.get(function(){
 return util.getTime(this.createdAt); // 1
});

postSchema.virtual("updatedDate")
.get(function(){
 return util.getDate(this.updatedAt); // 1
});

postSchema.virtual("updatedTime")
.get(function(){
 return util.getTime(this.updatedAt); // 1
});

// model & export
var Post = mongoose.model("post", postSchema);
module.exports = Post;

// functions
function getDate(dateObj){
 if(dateObj instanceof Date)
  return dateObj.getFullYear() + "-" + get2digits(dateObj.getMonth()+1)+ "-" + get2digits(dateObj.getDate());
}

function getTime(dateObj){
 if(dateObj instanceof Date)
  return get2digits(dateObj.getHours()) + ":" + get2digits(dateObj.getMinutes())+ ":" + get2digits(dateObj.getSeconds());
}

function get2digits(num){
 return ("0" + num).slice(-2);
}
