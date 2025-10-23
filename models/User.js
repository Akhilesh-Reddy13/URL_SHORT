import mongoose from "mongoose";
import { type } from "os";
import { ref } from "process";

const userSchema=new mongoose.Schema({
    username:{type:String,required:true},
    password:{type:String,required:true},
    role:{type:String,default:'user'},
    addedUrl: [{type:mongoose.Schema.Types.ObjectId,ref:'Url'}]
})

const user=mongoose.model('User',userSchema);

export default user;