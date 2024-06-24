const mongoose=require('mongoose');
const schema= mongoose.Schema;
const User =require("./user.js");

const message= new schema({
    title:{
        type:String,
        required :true
    },
    for:[{
        type:schema.Types.ObjectId,
        ref:"Users"
    }]
})
const Listing = mongoose.model("message", message);
module.exports =Listing;