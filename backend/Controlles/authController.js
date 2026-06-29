const User=require("../Models/ User");
const bcrypt=require("bcryptjs");
const generateToken=require("../utils/generateToken");

const register=async(req,res)=>{

try{

const {name,email,password}=req.body;

const exist=await User.findOne({email});

if(exist){

return res.status(400).json({
message:"User already exists"
});

}

const salt=await bcrypt.genSalt(10);

const hashedPassword=await bcrypt.hash(password,salt);

const user=await User.create({

name,
email,
password:hashedPassword

});

const token=generateToken(user._id);

res.status(201).json({

success:true,

token,

user

});

}

catch(err){

res.status(500).json({

message:err.message

});

}

}


const login=async(req,res)=>{

try{

const {email,password}=req.body;

const user=await User.findOne({email});

if(!user){

return res.status(404).json({

message:"User not found"

});

}

const match=await bcrypt.compare(password,user.password);

if(!match){

return res.status(401).json({

message:"Invalid Credentials"

});

}

const token=generateToken(user._id);

res.json({

success:true,

token,

user

});

}

catch(err){

res.status(500).json({

message:err.message

});

}

}

module.exports={
register,
login
};