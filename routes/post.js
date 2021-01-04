const express=require('express')
const router=express.Router()
const mongoose=require('mongoose')
const Post=require('../models/post  ')
const requireLogin=require('../middleware/requireLogin')


router.get('/allpost',(req,res)=>{
    Post.find()
    .populate("postedBy","_id")
    .then(posts=>{
        res.json({posts})
    })
    .catch(err=>{
        console.log(err)
    })
})
router.post('/createpost',requireLogin,(req,res)=>{
    const {title,body}=req.body
    if(!title || !body){
        return res.status(422).json({error:"please add all the fields"})
    }
   const post=new post({
        title,
        body,
        postedBy:req.user
   })
   post.save().then(result=>{
       res.json({post:result})
   })
   .catch(err=>{
       console.log(err)
   })
})
router.get('/mypost',(req,res)=>{
    Post.find({postedBy:req.user._id})
    .populate("PostedBy","_id name")
    .then(mypost=>{
        res.json(mypost)
    })
    .catch(err=>{
        console.log(err)
    })
})
module.exports=router