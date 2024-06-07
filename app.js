require("dotenv").config();
const mongoose = require("mongoose");
const UserRoute = require("./routes/user");
mongoose.connect("mongodb://127.0.0.1:27017/chatApp");
const express = require("express");
const USER = require("./models/User");
const CHAT = require("./models/Chat");
const app = express();
app.set("view engine", "ejs");
app.set("views", "./views");

const http = require("http").Server(app);
app.use(UserRoute);

const io = require('socket.io')(http);
const usp = io.of('/user-namespace')

usp.on('connection',async (socket)=>{
  console.log("connected",socket.id)

  var userId=socket.handshake.auth.token;
 await USER.findByIdAndUpdate({_id:userId},{$set:{is_online:"1"}})
//user broadcast online status
 socket.broadcast.emit('getOnlineUser',userId);

 

    socket.on("disconnect",async ()=>{
       console.log("disconnected",socket.id)
       await USER.findByIdAndUpdate({_id:userId},{$set:{is_online:"0"}})
//user broadcast offline status
 socket.broadcast.emit('getOfflineUser',userId);
    })


    //chating implementation
    socket.on("newChat",(data)=>{
        socket.broadcast.emit('loadnewChat',data);

    })

//loard old chats

socket.on("existsChat",async ({sender_id,receiver_id})=>{
     var chats= await CHAT.find({$or:[
        {sender_id:sender_id,receiver_id:receiver_id},
        {sender_id:receiver_id,receiver_id:sender_id}
       ]});
     socket.emit('loadChats',chats);
})

//chat deleted
socket.on("chatDeleted",(id)=>{
  socket.broadcast.emit('deleteChat',id);
})

//chat updated
socket.on("chatUpdated",({id,message})=>{
  socket.broadcast.emit('updateChat',{id,message});
})


// new group chat

socket.on("newGroupChat",(data)=>{
  socket.broadcast.emit('loadnewGroupChat',data);
})


// deleteGroupChat

socket.on("deleteGroupChat",(g_chat_id)=>{
  socket.broadcast.emit('deleteGroupMessage',g_chat_id);
})

})

http.listen(3000, () => {
  console.log("server started");
});
