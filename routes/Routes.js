import express from "express";
import shortid from "shortid";
import Url from "../models/Url.js";

const router=express.Router();

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

router.post('/create', async (req,res)=>{
    try{
    const { url }=req.body;
    if(!url || typeof(url)!=='string'){
        return res.status(400).json({error:"Invalid or missing longUrl"});
    }
    const stUrl=shortid.generate();
    const newUser=new Url({shortUrl:stUrl,longUrl:url});
    await newUser.save();
    res.status(201).send({shortUrl:stUrl,url});
    console.log("Created a newShortURL");
    }
    catch(error){
        console.log("Error while shortening url");
         return res.status(500).json({message:"Internal Server Error"});
    }
})

export default router;