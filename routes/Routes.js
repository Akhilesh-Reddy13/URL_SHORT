import express from "express";
import shortid from "shortid";
import jwt from "jsonwebtoken";
import Url from "../models/Url.js";
import bcrypt from 'bcrypt';
import User from "../models/User.js";
import dotenv from "dotenv";
import { authenticateToken } from "../middleware/auth.js";

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
        return res.status(500).json({message:'Internal server error'});
    }
});

router.get('/:shortUrl',async (req,res)=>{
    try{
    const shortUrl=req.params.shortUrl;
    const lgUrl= await Url.findOne({shortUrl})
    if(lgUrl){
        await Url.updateOne({shortUrl},{$inc:{clicks:1}});
        return res.redirect(lgUrl.longUrl);
    }
    else{
        return res.status(404).json({error:"Short URL not found"});
    }
    }
    catch(error){
        console.log("Error while getting the original data");
        return res.status(500).json({message:"Internal Server Error"});
    }

})

router.post('/create',authenticateToken, async (req,res)=>{
    try{
    const user=await User.findOne({username:req.user.username});
    if(!user){
        return res.status(404).json({message:"User not found"});
    }
    const { url }=req.body;
    if(!url || typeof(url)!=='string'){
        return res.status(400).json({error:"Invalid or missing longUrl"});
    }
    const stUrl=shortid.generate();
    const newUrl=new Url({shortUrl:stUrl,longUrl:url,owner:user});
    await newUrl.save();
    res.status(201).send({shortUrl:stUrl,url});
    console.log("Created a newShortURL");
    }
    catch(error){
        console.log("Error while shortening url");
         return res.status(500).json({message:"Internal Server Error"});
    }
})

export default router;