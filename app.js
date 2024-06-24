if(process.env.NODE_ENV !="production"){
    require("dotenv").config();
}
const methodOverride=require('method-override');
const userprofile=require('./schema/userprofile.js');
const ejsmate= require("ejs-mate");
const mongoose=require('mongoose')
const express=require('express');
const session= require("express-session");
var bodyParser = require('body-parser');
const listing= require("./schema/listing.js");
var app = express();
app.use(bodyParser.json());
app.use(express.urlencoded({extended: true}));
const path=require('path');
const passport=require("passport");
const localStrategy = require("passport-local");
const mongo_url=process.env.ATLAS_URL;
const User=require('./schema/user.js')
const message=require('./schema/message.js')
app.set("view engine", "ejs");
app.set("views",path.join(__dirname,"views"));
app.engine("ejs", ejsmate);
const multer  = require('multer')
const{storage}=require("./cloudconfig.js");
const upload = multer({storage});
const { Server }=require('socket.io');
const http=require("http");
const server=http.createServer(app);
const io=new Server(server);

let socketConnected=new Set();

//socket.io
io.on("connection",onconnected);

function onconnected(socket){
  console.log("A new user is joined",socket.id)
  socketConnected.add(socket.id);

  io.emit("client-message", socketConnected.size);

  socket.on("disconnect",()=>{
    console.log("disconnected",socket.id)
    socketConnected.delete(socket.id);
    io.emit("client-message", socketConnected.size);
  })
  socket.on("message",(data)=>{
    console.log(data);

    socket.broadcast.emit('chat-message',data)
  })
}



const sessionOptions = {
  secret:"secret keywords",
  resave: false,
  saveUninitialized: true,
  // Other session options...
};

app.use((req,res,next)=>{
  
  res.locals.currUser=req.user;
  if(req.user){
      let {username}=req.user;
      res.locals.username=username;
  }
  
  // res.locals.username=req.user.username;
  next();
})

app.use(session(sessionOptions));
app.use(express.static(path.join(__dirname,"/public")));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(methodOverride("_method"));

async function main(){
   await mongoose.connect(mongo_url);
}

main()
  .then(() => {
    console.log("connected to DB connected hai");
  })
  .catch((err) => {
    console.log(err);
});

app.get("/",async(req,res,next)=>{
  let currUser=req.user;

    res.render("./interface/home.ejs",{currUser})
})




app.get("/profile/new",
async(req,res)=>{

    let user=await userprofile.findById(req.user._id);
    let currUser=req.user;
    res.render(`./interface/edit.ejs`,{currUser,user});
})

//post route
app.post("/profile/:id",upload.single("listing[image]"),async(req,res)=>{
  try{ let {id}=req.params;
    let Listing=new userprofile(req.body.listing);
    let user=await User.findById(id);
    if(req.file){
      let url =req.file.path;
    let filename=req.file.filename;
    user.profileimage = {url, filename};
    }
    Listing._id=req.user._id;
    user.userprofile.push(Listing);
    await user.save();
    await Listing.save();
    res.redirect(`/profile/Freelancer/${id}`)
}catch(err){
  let {id}=req.params;
    let Listing=await userprofile.findByIdAndUpdate(id ,{...req.body.listing});
    let user=await User.findById(id);
    if(req.file){
      let url =req.file.path;
    let filename=req.file.filename;
    user.profileimage = {url, filename};
    }
    
    // Listing.About=About;
    user.userprofile.push(Listing);
    await user.save();
    await Listing.save();
    res.redirect(`/profile/Freelancer/${id}`,)

}})
app.put("/profile/:id" ,async(req,res)=>{
  let {id}=req.params;
    let{About, expected ,previousjob}=req.body.listing;
    let Listing=await userprofile.findByIdAndUpdate(id ,{...req.body.listing});
    let user=await User.findById(id);
    let url =req.file.path;
    let filename=req.file.filename;
    user.profileimage = {url, filename};
    await user.save();
    await Listing.save();
    res.redirect(`/profile/${id}`)
})


app.get("/listings/new" ,(req,res,next)=>{
  let currUser=req.user;
  res.render("./users/add.ejs",{currUser});
})
app.post("/notification/:id" ,async(req,res,next)=>{
  const {id}=req.params;
  const {button_value}=req.body;
  let user=await User.findById(req.user._id);
  const String = `You got a message related to ${button_value} from ${user.username}` ;
  const messages= new message({title:String});
  await messages.for.push(id);
  await messages.save();
  res.redirect(`/profile/Freelancer/${id}`)
})


app.post("/listings",
async (req,res,next)=>{
    const newlistings= new listing(req.body.listing);
    await newlistings.owners.push(req.user._id);
    await newlistings.save();
    res.redirect("/"); 
});

app.get("/dashboardf/:id",async(req,res)=>{
  let currUser=req.user;
  const allListings=await listing.find({});
  res.render('./interface/dashboardf.ejs',{allListings,currUser});
});
app.get("/dashboardp/:id",async(req,res)=>{
  let {id}=req.params;
  let joboffered=await listing.find({owners:id});
  console.log(joboffered);
  let Listings=await userprofile.find({});
  let currUser=req.user;
  const allListings=await User.find({profession:"Freelancer"}).populate("userprofile");
  res.render('./interface/dashboardp.ejs',{allListings,currUser,joboffered,Listings});
});

app.get("/login", (req,res,next)=>{
    res.render("./users/login.ejs");
})

app.get('/profile/:id', (req,res) =>{
  res.render()
})
app.get("/job/:id",async(req,res)=>{
  let {id}=req.params;
  let joboffered=await listing.findById(id);
  console.log(joboffered);
  res.render('./interface/job.ejs',{joboffered});
})
app.get("/profile/Freelancer/:id", async(req,res,next)=>{
    let {id}=req.params;
    let Listing=await userprofile.findById(id);
    let Idowner= await User.findById(id);
    let msgs=await message.find({for:id});
    let currUser=req.user;
    res.render("./users/profile.ejs",{Idowner,Listing,currUser,msgs});
})
app.get("/profile/Producer/:id", async(req,res,next)=>{
    let {id}=req.params;
    let Listing=await userprofile.findById(id);
    let Idowner= await User.findById(id);
    let msgs=await message.find({for:id});
    let currUser=req.user;
    let joboffered=await listing.find({owners:id});
    res.render("./users/profileprod.ejs",{currUser,Listing,Idowner,msgs,joboffered});
})
app.get("/signup", (req,res,next)=>{
    res.render("./users/signup.ejs");
})
//signup
app.post("/signup",upload.single("Image"),async(req,res,next)=>{
  let {Email ,username,profession ,password,}=req.body;
  const newuser = new User({Email,username,profession});
  if(req.file){let filename=req.file.filename || "EMpty";
  let url =req.file.path || "...";
  newuser.profileimage = {url, filename};}
  const registerUser = await User.register(newuser,password);
  
  req.login(registerUser,(err)=>{
      if(err){
          return next(err);
      }
      res.redirect("/");
  })
});
app.post('/login',
  passport.authenticate('local', { failureRedirect: '/login', failureFlash:true }),
  function(req, res) {
    res.redirect("/");
  });

app.get("/logout",(req,res,next)=>{
  
  req.logout((err)=>{
      if(err){
          console.log("error");
      }
      res.redirect("/login");
  })
})

server.listen(8080 ,()=>{
    console.log("we are live WOHO!");
}) 