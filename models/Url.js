import mongoose from "mongoose";
import { type } from "os";

const urlSchema=new mongoose.Schema({
    shortUrl: {type:String,required:true,unique:true},
    longUrl: {type:String,required:true},
    clicks: {type:Number,default:0},
    createdAt: {type:Date, default: Date.now}
})

const urlShort=mongoose.model('Url',urlSchema);

export default urlShort;