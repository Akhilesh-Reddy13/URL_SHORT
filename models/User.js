import mongoose from "mongoose";
import { type } from "os";
import { ref } from "process";

const newuserSchema=new mongoose.Schema({
    username:{type:String,required:true},
    password:{type:String,required:true},
    role:{type:String,default:'user'},
    addedUrl: [{type:mongoose.Schema.Types.ObjectId,ref:'Url'}],
    refreshToken:{type:String,default:null}
})

const user=mongoose.model('newUser',newuserSchema);

export default user;