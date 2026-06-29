const jwt=require("jsonwebtoken");

const User=require("../models/User");

const protect=async(req,res,next)=>{

let token;

if(

req.headers.authorization &&
req.headers.authorization.startsWith("Bearer")

){

token=req.headers.authorization.split(" ")[1];

try{

const decoded=jwt.verify(
token,
process.env.JWT_SECRET
);

req.user=await User.findById(decoded.id).select("-password");

next();

}

catch(error){

return res.status(401).json({

message:"Invalid Token"

});

}

}

else{

return res.status(401).json({

message:"No Token"

});

}

};




router.get("/profile",protect,(req,res)=>{

res.json({

success:true,

user:req.user

});

});


module.exports=protect;