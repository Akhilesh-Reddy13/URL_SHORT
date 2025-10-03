import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import router from './routes/Routes.js'

const app=express();
const PORT=5000;


app.use(express.json());
app.use('/',router);

app.get('/',(req,res)=>{
    const r="Server is running";
    res.json({message:`${r}`});
})

app.listen(PORT,()=>{
    console.log("Server is running");
})