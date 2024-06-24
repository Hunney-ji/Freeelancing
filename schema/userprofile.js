const mongoose=require('mongoose');
const schema= mongoose.Schema;
const message=require('./message.js')
const userprofile  =new schema({
    country:String,
    profession:String,
    expected : Number,
    previousjob: String,
    About : String,
    message:[{
        type:schema.Types.ObjectId,
        ref:"message"
    }]
})

module.exports=mongoose.model("Usersprofile",userprofile);