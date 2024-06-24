const mongoose=require('mongoose');
const schema= mongoose.Schema;
const User =require("./user.js");
const listingSchema= new schema({
    title:{
        type:String,
        required :true
    },
    description: String,
    price: Number,
    location : String,
    country: String,
    expectedtime: String,
    expectedSkill:String,
   
    owners:[{
        type:schema.Types.ObjectId, 
        ref:"Users"
    }],
})
const Listing = mongoose.model("Listing", listingSchema);
module.exports =Listing;