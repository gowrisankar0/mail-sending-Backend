const router =require("express").Router();
const User =require("../models/user");
const bcrypt=require("bcrypt");
const jwt = require("jsonwebtoken");
const verifyToken=require("../middleware/verify");
const pwd ="xgheiilpbqvpjcgp";
const email ="gsankar9797@gmail.com";
const nodemailer =require("nodemailer")



router.get("/",(req,res)=>{
    res.send("User route is working");
});


router.post("/signup",async(req,res)=>{
    try {
        const salt = await bcrypt.genSalt(10);
        const password = await bcrypt.hash(req.body.password,salt);
        const user =new User({
            name:req.body.name,
            email:req.body.email,
            password,
        });
        const data =await user.save();

        const transporter =nodemailer.createTransport({
            service:"gmail",
            auth:{
                user:email,
                pass:pwd
            }

        })


        let info =await transporter.sendMail({
            from:"Tech Blsters <gsankar9797@gmail.com>",
            to:req.body.email,
            subject:"Welcome to our platform tech blasters",
            html:
           ` <div>
                <h2>Welcome to our platform hope. ${req.body.name}. u will have a nice experince</h2>
                <div>
                <p>Thanks and regards</p>
                <p>from tech blasters</p>
                </div>
            </div>`
        });

        console.log(info);
        res.json({msg:"signed up succesfully"});
    } catch (error) {
        console.log({msg:error.message});
    }
});


router.put("/add-sport/:userId",async(req,res)=>{
    try {
        const user =await User.findByIdAndUpdate(req.params.userId,{$push:{sports:req.body.name}},{new:true});
        res.json(user)
    } catch (error) {
        console.log({msg:error.message});
    }
});


router.post("/login",async (req,res)=>{
try {
    const user = await User.findOne({email:req.body.email});
    if(user){

        const result = await bcrypt.compare(req.body.password,user.password)
       if(result){
             const token = jwt.sign({id:user._id},"secretkey")
             return res.json(token)
       }else{
        return res.json({msg:"wrong password"})
       }
    }else{
        return res.json({msg:"no user found"});
    }
} catch (error) {
    return res.json({msg:error.message})
}
})


router.put("/remove-sport/:userId",async(req,res)=>{
    try {
        const user = await User.findByIdAndUpdate(req.params.userId,{
            $pull:{sports:req.body.name}
        },{new:true});

        res.json(user);
    } catch (error) {
        console.log({msg:error.message});
    }
})


router.get("/filter",async(req,res)=>{
    try {
        // const data =await User.find({age:{$gt:18}});
        // const data =await User.find({age:{$gte:18}});
        // const data =await User.find({age:{$lt:18}});
        // const data =await User.find({age:{$lte:18}});
        const data =await User.find().sort({age:"asc"}).select("-name -email");
        res.json(data);
    } catch (error) {
        console.log({msg:error.message});
    }
});



router.get("/data",verifyToken,async(req,res)=>{
try {
    const userId =req.userId;
    const user = await User.findById(userId);
    res.json(user)
} catch (error) {
    console.log({msg:error.message});
}
})

module.exports=router;