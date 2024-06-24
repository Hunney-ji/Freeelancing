const mongoose=require('mongoose');
const schema= mongoose.Schema;
const passportlocalmongoose=require("passport-local-mongoose");
const userprofile=require('./userprofile');

const userschema=new schema({
    Email:{
        type:String,
        required:true
    },
    profileimage: {
        filename:String,
        url:String,  
    
    },
    profession:{
        type:String,
        required:true,
    },
    userprofile:[{
        type:schema.Types.ObjectId,
        ref:"Usersprofile",

    }]
});
userschema.plugin(passportlocalmongoose);

module.exports=mongoose.model("Users",userschema);