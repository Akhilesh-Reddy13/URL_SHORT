import express from "express";
import jwt from "jsonwebtoken";
import Url from "../models/Url.js";
import bcrypt from 'bcrypt';
import User from "../models/User.js";
import short from "../Algo/shorting.js";
import dotenv from "dotenv";
import {UAParser} from "ua-parser-js";
import { authenticateToken } from "../middleware/auth.js";
import validator from "validator";
import { json } from "stream/consumers";
import { url } from "inspector";

const router=express.Router();

dotenv.config();

const secretKey = (process.env.JWT_SECRET || '').trim();

router.post('/users/signup',async(req,res)=>{
    try{
        const {username,password}=req.body;
        const user=await User.findOne({username});
        if(user){
            res.status(403).json({message:'User already existing'});
        }
        else{
            const hpass=await bcrypt.hash(password,10);
            const newUser=new User({username,password:hpass});
            await newUser.save();
            const token=jwt.sign({username,role:"user"},secretKey,{expiresIn:'1h'});
            res.json({message:'User created successfully',token});
        }}
        catch(error){
            console.log(error);
            console.log(error.stack);
            res.status(500).json({message:"Internal Server Error"});
        }
});

router.post('/users/login',async(req,res)=>{
    try {
        const {username,password}=req.body;
        const user=await User.findOne({username});
        if(user && await bcrypt.compare(password,user.password)){
            const token=jwt.sign({username,role:'user'},secretKey,{expiresIn:'1h'});
            return res.json({message:'Logged in succesfully',token});
        }
        else{
            return res.status(403).json({message:'Invalid username or password'});
        }
    } catch (error) {
        console.error('Login error:', error);
        console.log(error.stack);
        return res.status(500).json({message:'Internal server error'});
    }
});

router.get('/:shortUrl',async (req,res)=>{
    try{
    const shortUrl=req.params.shortUrl;
    const lgUrl= await Url.findOne({shortUrl});
    if(lgUrl){
        let parser = new UAParser(req.headers['user-agent']);
        let ua=parser.getResult();
        await Url.updateMany({shortUrl},{$inc:{clicks:1},$push:{browsers:ua.browser.name,lastAccessed:new Date}});
        return res.redirect(lgUrl.longUrl);
    }
    else{
        return res.status(404).json({error:"Short URL not found"});
    }
    }
    catch(error){
        console.log("Error while getting the original data");
        console.log(error.stack);
        return res.status(500).json({message:"Internal Server Error"});
    }

})

router.get('/analytics/:shortUrl',authenticateToken,async(req,res)=>{
    try{
    const user=await User.findOne({username:req.user.username});
    if(!user){
        return res.status(404).json({message:"User not found"});
    }
    const shortUrl=req.params.shortUrl;
    const urlUser= await Url.findOne({shortUrl});
    if(!urlUser){
        return res.status(404).json({message:"Url not found"});
    }
    if(!urlUser.owner){
        return res.status(404).json({message:"Owner not found"});
    }
    if(urlUser.owner.toString() !== user._id.toString()){
        return res.status(403).json({message:"Not able to access it"});
    }
    const analytic={
        shortURL:shortUrl,
        longURL:urlUser.longUrl,
        clicks:urlUser.clicks,
        owner:urlUser.owner,
        lastAccessed:urlUser.lastAccessed,
        expiresAt:urlUser.expiresIn,
        createdAt:urlUser.createdAt,
        browsers:urlUser.browsers
    };
    return res.status(200).json({analyt:analytic});
    }
    catch(error){
        console.log("Error while accessing analytics");
        console.log(error.stack);
        return res.status(500).json({message:"Internal Server Error"});
    }
})

router.get('/users/urls',authenticateToken, async(req,res)=>{
    try{
    const user=await User.findOne({username:req.user.username});
    if(!user){
        return res.status(404).json({message:"User not found"});
    }
    const userUrlArray=user.addedUrl;
    const urlList=await Promise.all(
        userUrlArray.map(element=>Url.findOne({_id:element}))
    );
    const validUrls= urlList.filter(url=>url!==null);
    if(validUrls.length===0) return res.status(200).json({message:"Nothing yet to see"});
    return res.status(200).json({Urls:validUrls});
    }
    catch(error){
        console.log("Error while accessing user's urls");
        console.log(error.stack);
        return res.status(500).json({message:"Internal server error"});
    }
})

router.post('/create',authenticateToken, async (req,res)=>{
    try{
    const user=await User.findOne({username:req.user.username});
    if(!user){
        return res.status(404).json({message:"User not found"});
    }
    const { url,expiresAt }=req.body;
    if(!url || !validator.isURL(url,{require_protocol:true})){
        return res.status(400).json({error:"Invalid or missing longUrl"});
    }
    let stUrl;
    let exUrl;
    do{
        stUrl=short();
        exUrl= await Url.findOne({shortUrl:stUrl});
    }while(exUrl);
    const expiresInMinutes=(expiresAt)?expiresAt:60;
    const expiresIn=new Date(Date.now()+expiresInMinutes*60*1000);
    const newUrl=new Url({shortUrl:stUrl,longUrl:url,owner:user._id,expiresIn});
    await newUrl.save();
    await User.updateOne({_id:user._id},{$push:{addedUrl:newUrl._id}});
    res.status(201).send({shortUrl:stUrl,url});
    console.log("Created a newShortURL");
    }
    catch(error){
        console.log("Error while shortening url");
        console.log(error.stack);
         return res.status(500).json({message:"Internal Server Error"});
    }
});

export default router;