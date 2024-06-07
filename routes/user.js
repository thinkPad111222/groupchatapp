const express = require("express");
const {
  RegisterUser,
  loadRegisterUser,
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
} = require("../controllers/user");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

const path = require("path");
const multer = require("multer");
const session = require("express-session");
const { is_login, is_logout } = require("../middlewares/auth");
const { SESSION_SECRET } = process.env;

const UserRoute = express.Router();
UserRoute.use(cookieParser());
UserRoute.use(session({ secret: SESSION_SECRET }));
UserRoute.use(bodyParser.json());
UserRoute.use(bodyParser.urlencoded({ extended: true }));



UserRoute.use(express.static("public"));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../public/images"));
  },
  filename: function (req, file, cb) {
    const filename = `${Date.now()}-${file.originalname}`;
    cb(null, filename);
  },
});

UserRoute.get("/", is_logout, LoadLogin);
UserRoute.post("/", Login);

const upload = multer({ storage });
UserRoute.get("/register", is_logout, loadRegisterUser);
UserRoute.post("/register", upload.single("image"), RegisterUser);
UserRoute.get('/groups',is_login,loadGroups);
UserRoute.post('/get-members',getMembers);
UserRoute.post('/add-members',addMembers);


UserRoute.post('/groups',upload.single("image"),CreateGroup);
UserRoute.post('/update-group',upload.single("image"),updateGroup);


UserRoute.get("/dashboard", is_login, DashboardLoad);
UserRoute.get('/share-group/:id',is_login,shareGroup);
UserRoute.get('/group-chat',is_login,ChatGroup);


UserRoute.get("*", (req, res) => res.redirect("/"));

UserRoute.get("/logout", is_login, Logout);

UserRoute.post("/save-chat", saveChat);
UserRoute.post("/save-groupchat", saveGroupChat);

UserRoute.post("/delete-chat", deleteChat);
UserRoute.post('/deleteGroupMessageUrl',deleteGroupMessage);
UserRoute.post('/update-chat',updateChat);
UserRoute.post('/delete-group',deleteGroup);
UserRoute.post('/join-group',joinGroup);
UserRoute.post('/loadGroupChats',loadGroupChats);













module.exports = UserRoute;
