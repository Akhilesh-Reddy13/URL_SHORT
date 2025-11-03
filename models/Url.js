import mongoose from "mongoose";
import { type } from "os";

const urlSchema=new mongoose.Schema({
    shortUrl: {type:String,required:true,unique:true},
    longUrl: {type:String,required:true},
    clicks: {type:Number,default:0},
    createdAt: {type:Date, default: Date.now},
    owner: {type:String,required:true},
    lastAccessed: [{type:Date}],
    expiresIn: {type:Date,required:true,index:{expires:0}},
    browsers:[{type:String}]
})

const urlShort=mongoose.model('Url',urlSchema);

export default urlShort;