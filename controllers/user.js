const CHAT = require("../models/Chat");
const USER = require("../models/User");
const bcrypt = require("bcrypt");
const GROUP = require("../models/group");
const GROUPCHAT = require("../models/GroupChat");
const MEMBER = require("../models/Member");
const  mongoose = require("mongoose");

const loadRegisterUser = async (req, res) => {
  try {
    res.render("register");
  } catch (err) {
    console.log(err.message);
  }
};

const RegisterUser = async (req, res) => {
  try {
    const hashpass = await bcrypt.hash(req.body.password, 10);

    let user = new USER({
      name: req.body.name,
      email: req.body.email,
      image: "images/" + req.file.filename,
      password: hashpass,
    });
    user = await user.save();

    res.render("register", { data: user, message: "user created" });
  } catch (err) {
    console.log(err.message);
  }
};

const LoadLogin = async (req, res) => {
  try {
    res.render("login");
  } catch (err) {
    console.log(err.message);
  }
};
const Login = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    if (email) {
      const userData = await USER.find({ email: email });
      if (userData) {
        const checkpassword = await bcrypt.compare(
          password,
          userData[0].password
        );

        if (checkpassword) {
          req.session.user = userData[0];
          res.cookie('user',JSON.stringify(userData[0]))
          res.redirect("/dashboard");
        } else {
          res.render("login", { message: "password not match" });
        }
      } else {
        res.render("login", { message: "Invalid Email or password" });
      }
    }
  } catch (err) {
    console.log(err.message);
  }
};

const Logout = async (req, res) => {
  try {
    req.session.destroy();
    res.clearCookie('user');

    res.redirect("/");
  } catch (err) {
    console.log(err.message);
  }
};

const DashboardLoad =async (req, res) => {
  try{
  var users= await USER.find({_id:{$nin:[req.session.user._id]}})
    res.render("dashboard", { user: req.session.user ,users});

  }catch(err){console.log(err.message)}
};



const saveChat =async (req,res)=>{
   try{
    let chat=  new CHAT({
        sender_id:req.body.sender_id,
        receiver_id:req.body.receiver_id,
        message:req.body.message
      })
 
      chat = await chat.save();
     
    res.status(201).json({success:true,msg:"message send",chat})

   }catch(err){
    res.status(400).json({success:false,msg:err.message})
   }
}

const deleteChat=async(req,res)=>{
  try{
    let response=     await CHAT.deleteOne({_id:req.body.id});
    res.status(200).json({success:true,msg:"message deleted"})
  }catch(err){
    res.status(400).json({success:false,msg:err.message})
  }
}

const updateChat=async(req,res)=>{
  try{
    let response=await CHAT.findByIdAndUpdate({_id:req.body.id},{$set:{message:req.body.message}});
    res.status(200).json({success:true,msg:"message update",response})
  }catch(err){
    res.status(400).json({success:false,msg:err.message})
  }
}

const loadGroups=async (req,res)=>{
  try{
    const groups = await GROUP.find({creator_id:req.session.user._id})
   
      res.render("group",{groups:groups})
  }catch(err){
console.log(err.message)
  }
}

const CreateGroup =async (req,res)=>{
  try{
    let group = new GROUP({
      creator_id:req.session.user._id,
      name:req.body.name,
      image:'images/'+req.file.filename,
      limit:req.body.limit,
    })

    group = await group.save()
    const groups = await GROUP.find({creator_id:req.session.user._id})
    res.render('group',{
      message:req.body.name+ " group is created ",groups:groups
    })

  }catch(err){
    console.log(err.message)
  }
}


const getMembers=async (req,res)=>{
  try{
    const group_id =new mongoose.Types.ObjectId(req.body.group_id);
    const user_id =new mongoose.Types.ObjectId(req.session.user._id);
      const users = await USER.aggregate([
        {
 $lookup:{
    from:'members',
    localField:'_id',
    foreignField:'user_id',
    pipeline:[
      {
        $match:{
          $expr:{
                $and:[
                  {
                    $eq:["$group_id",group_id]
                  },
                ]
          }
        }
      }
    ],
    as:'member' 

 }
        },
        {
          $match:{"_id":{$nin:[user_id]}}
        }
      ]);
      res.status(200).send({success:true,data:users});

  }catch(err){
    res.status(400).send({success:false,msg:err.message});

  }
}
const addMembers =async (req,res)=>{
    try{
       if(!req.body.members){
        res.status(200).send({success:false,message:"please select any one"});
       }else if(req.body.members.length > parseInt(req.body.limit)){
        res.status(200).send({success:false,message:"please you cannot select more then "+ parseInt(req.body.limit) + " Members"});
       }else{
 await MEMBER.deleteMany({group_id:req.body.group_id});
  let data =[];
  for(let i =0;i<req.body.members.length;i++){
    data.push({
      user_id:req.body.members[i],
      group_id:req.body.group_id
    })
  }

 let members= await MEMBER.insertMany(data);

         res.status(200).send({success:true,message:"member added",members});
        
       }



    }catch(err){
  res.status(400).send({success:false,message:err.message});
    }
}



const updateGroup =async (req,res)=>{
  try{

    if(parseInt(req.body.limit) < parseInt(req.body.last_limit)){
       await MEMBER.deleteMany({group_id:req.body.gid})
    }
    var updateObj;
    if(req.file != undefined){
       updateObj = {
        name:req.body.name,
        image:"images/"+req.file.filename,
        limit:req.body.limit
       }
    }else{
      updateObj = {
        name:req.body.name,
        limit:req.body.limit
       }
    }

   await GROUP.findByIdAndUpdate({_id:req.body.gid},{
      $set:updateObj
    })

    
    res.status(201).send({
      message:req.body.name+ " group is updated ",success:true})

  }catch(err){
    console.log(err.message)
  }
}

const deleteGroup =async (req,res)=>{
 try{

  await GROUP.deleteOne({_id:req.body.dgid});
  await MEMBER.deleteMany({group_id:req.body.dgid});


  res.status(200).send({success:true,message:"group delete"})


 }catch(err){
  res.status(400).send({success:false,message:err.message})
 }
}


const shareGroup = async(req,res)=>{
  try{

  const groupData = await GROUP.findOne({_id:req.params.id});
  if(!groupData){
     res.render('error',{message:"404 page not found!"})
  }else if(req.session.user==undefined){
    res.render('error',{message:"you need to login to access the share url!"})
    
  }else{
      var totalMember = await MEMBER.find({group_id:req.params.id}).countDocuments();
var available = groupData.limit - totalMember;
var isOwner = groupData.creator_id == req.session.user._id?true:false;

var isJoined = await MEMBER.find({
  group_id:req.params.id,
  user_id:req.session.user._id
}).countDocuments();

res.render("shareLink",{group:groupData,totalMember,available,isOwner,isJoined})


  }

  }catch(err){
    console.log(err.message)
  }
}


const joinGroup=async (req,res)=>{
   try{

   const member = new MEMBER({
    group_id:req.body.group_id,
    user_id:req.session.user._id
   })
   await member.save();
    res.status(200).send({success:true,message:"you are joined"})

   }catch(err){
    res.status(400).send({success:false,message:err.message})
   }
}


const ChatGroup=async (req,res)=>{
  try{

    const myGroup = await GROUP.find({creator_id:req.session.user._id});

    const JoinedGroup = await MEMBER.find({user_id:req.session.user._id}).populate('group_id');

    res.render("groupChat",{myGroup,JoinedGroup})
 

  }catch(err){
  console.log(err.message)
  }
}


const saveGroupChat=async(req,res)=>{
   try{

    let groupChat = new GROUPCHAT({
      group_id:req.body.group_id,
      sender_id:req.body.sender_id,
      message:req.body.message
    })

   groupChat= await groupChat.save();

   res.status(200).send({success:true,message:"message sent",data:groupChat})
   }catch(err){
    res.status(400).send({success:false,message:err.message})
   }
}


const loadGroupChats=async (req,res )=>{
  try{
    const groupChats = await GROUPCHAT.find({group_id:req.body.group_id})

    res.status(200).send({success:true,message:"load group chats",groupChats})
  }catch(err){
    res.status(400).send({success:false,message:err.message})
  }
}


const deleteGroupMessage=async(req,res)=>{
   try{

     await GROUPCHAT.deleteOne({_id:req.body.g_chat_id});
    res.status(200).send({success:true,message:"group message delete"});
   }catch(err){
    res.status(400).send({success:false,message:err.message})
   }
}

module.exports = {
  loadRegisterUser,
  RegisterUser,
  LoadLogin,
  Login,
  Logout,
  DashboardLoad,
  saveChat,
  deleteChat,
  updateChat,
  loadGroups,
  CreateGroup,
  getMembers,
  addMembers,
  updateGroup,
  deleteGroup,
  shareGroup,
  joinGroup,
  ChatGroup,
  saveGroupChat,
  loadGroupChats,
  deleteGroupMessage,
};
