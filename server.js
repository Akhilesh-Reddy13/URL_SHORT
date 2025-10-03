import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import router from './routes/Routes.js'
import { error } from 'console';

dotenv.config();
const app=express();
const PORT=5000;


app.use(express.json());
app.use('/',router);

app.get('/',(req,res)=>{
    const r="Server is running";
    res.json({message:`${r}`});
})

mongoose.connect(process.env.MONGO_URI)
.then(()=>{
    console.log("MongoDB successfully connected");
    app.listen(PORT,()=>{
        console.log("Server is running ");
    })
})
.catch((err)=>{
    console.log("MongoDB connection Error: ",err.message);
    process.exit(1);
});
