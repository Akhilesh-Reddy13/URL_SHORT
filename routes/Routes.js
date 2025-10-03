import express from "express";
import shortid from "shortid";

const router=express.Router();


const urlMap={};

router.get('/:shortUrl',(req,res)=>{
    const shortUrl=req.params.shortUrl;
    const longUrl=urlMap[shortUrl];
    if(longUrl){
        return res.redirect(longUrl);
    }
    else{
        return res.status(404).json({error:"Short URL not found"});
    }
})

router.post('/create',(req,res)=>{
    const urlData=req.body;
    const shortUrl=shortid.generate();
    urlMap[shortUrl]=urlData.url;
    res.send({oldUrl:urlData,newUrl:`${req.headers.host}/${shortUrl}`});
    console.log("Created a newShortURL");
    console.log(urlMap);
})
export default router;