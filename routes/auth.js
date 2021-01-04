const express=require('express')
const router=express.Router()
const mongoose=require('mongoose')
const User=mongoose.model("User")
const bcrypt=require('bcryptjs')
const jwt=require('jsonwebtoken')
const {JWT_SECRET}=require('../keys')
const requireLogin=require('../middleware/requireLogin')
router.get('/protected',requireLogin,(req,res)=>{
    res.send("hello user")
})
router.get('/protected',(req,res)=>{
    res.send("heelllo user")
})
router.post('/signup',(req,res)=>{
const{name,email,password}=req.body;
if(!name || !email  || !password){
    return res.status(422).json({error:'please add all the fields'})
}else{
    User.findOne({email:email})
    .then((savedUser)=>{
        if(savedUser){
            return res.status(422).json({error:"user already exists with that email"})
        }
        bcrypt.hash(password,12)
        .then(hashedpassword=>{
            const user=new User({
                email,
                password:hashedpassword,
                name
            })
            user.save()
            .then(user=>{
                res.json({message:"Saved successfully"})
            })
            .catch(err=>{
                console.log(err)
            })
        })
     
    })
    .catch(err=>{
        console.log(err)
    })
}
})
router.post('/signin',(req,res)=>{
    const{email,password}=req.body
   if(!email || !password){
       res.status(422).json({error:"please add email or password"})
   }
   User.findOne({email:email})
   .then(savedUser=>{
       if(!savedUser){
       return res.status(422).json({error:"invalid email and password"})
       }
       bcrypt.compare(password,savedUser.password)
       .then(doMatch=>{
           if(doMatch){
          const token=jwt.sign({_id:savedUser._id},JWT_SECRET)
          res.json({token})
        }else{
               return res.status(422).json({error:"invalid email and password"})
           }
       })
       .catch(err=>{
           console.log(err)
       })
   })
})
module.exports=router