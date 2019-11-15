const express = require('express')
const session = require('express-session')
const bodyParser = require('body-parser')
// const mysql = require("mysql")
const ejs = require("ejs")
const crypto = require("crypto-random-string")
const user = require("../dbFunctions/users.js")
const mailer = require("../config/mailer.js")



const redirectLogin = (req, res, next) => {
  if(!req.session.user) {
    res.redirect('login')
  }
  else {
    next()
  }
}

const redirectHome = (req, res, next) => {
  if(req.session.user) {
    console.log(`user ${req.session.user.email} already logged In`);
    res.redirect('/')
  }
  else {
    console.log("No user logged In");
    next()
  }
}

const adminIn = (req, res, next) => {
  var {email, password} = req.body;

  if(email === 'admin@123' && password === 'admin') {
    req.session.user = 'admin';
    return res.redirect('/admin')
  }
  next()
}

const app = express.Router()


app.use(bodyParser.urlencoded({extended: true}));


app.get('/', (req, res) => {
  res.render("home", {userId: req.session.user?req.session.user.email:0, baseUrl : req.baseUrl})
})

app.get('/profile', redirectLogin, (req, res) => {
  res.render("profile", {user: req.session.user})
})

app.get('/login', redirectHome, (req, res) => {
  res.render("users/login", {error_msg: ""})
})

app.post('/login', adminIn, redirectHome, async (req, res) => {
  const { email, password } = req.body

  const userExists = await user.find(email, password)

  if(userExists && userExists != -1) {

    const isActive = await user.isActive(email);
    console.log("is Active:", isActive);
    if(isActive) {

      req.session.user = {user_id: userExists.user_id, name: userExists.name, email: userExists.email}
      console.log(`user ${userExists.email} successfully logged in`);
      req.session.msg= {title: "Logged In", body: 'successfully logged in now you can book'}
      res.redirect(req.session.lastUrl)

    }
    else {
      res.render("users/login", {error_msg: "user is inactive if new then verify your email first "})
    }
  }
  else {
    res.render("users/login", {error_msg: "Not Found"})
    console.log("user not exists");
  }
})

app.post('/logout', redirectLogin, (req, res) => {
  let user_name = req.session.user.name
  req.session.destroy()
  res.clearCookie(process.env.SESS_NAME)
  console.log(`user ${user_name} successfully logged out`);
  res.redirect(`/`)
})

app.get('/register', redirectHome, (req, res) => {
  console.log('register');
  res.render("users/signup", {error_msg: ""})
})

app.post('/register', redirectHome, async (req, res) => {
  const { name, email, password } = req.body

  const userExists = await user.find(email)

  if(!userExists) {

    //uncomment the below lines, commented for escaping mailer functionality

    //generate verification token
    const token = crypto({length: 20})
    console.log(token);

    //email the token to user's given email address
    const mailer = require("../config/mailer.js")
    const sent = await mailer.sendMailToken(email, "Recover password token", token)

    if(!sent) {
      res.render("users/register", {error_msg: "cannot send"})
      return
    }

    //creating new user with that token
    const userCreated = await user.create(name, email, password, active=0, token)

    // const userCreated = await user.create(name, email, password, active=1)

    //if user created successfully then redirect to login
    if(userCreated) {
      console.log("User successfully created");
      res.redirect("/users/login")
    }
    else {
      res.render("users/signup", {error_msg: "ERROR"})
    }

  }
  else {
    res.render("users/signup", {error_msg: "email address already present"})
  }
})


app.get("/verify", (req, res) => {
  res.render("users/verify", {forget: 0, error_msg: "Verify email"})
})


app.post("/verify", async (req, res) => {

  const {email, token} = req.body;
  token = token.trim()
  console.log("token is:", token);

  const userExists = await user.find(email)

  if(userExists) {
    console.log("exists")

    const verified = await user.verify(email, token)
    console.log("verification:", verified);
    if(verified) {
      console.log(`user ${email} successfully verified`);
      res.render("users/login", {error_msg: "Now you can login"})
    }
    else{
      res.render("users/verify", {error_msg: "token did not match"})
      console.log(`user ${email} could not verified`);
    }
  }
  else {
    res.render("users/login", {error_msg: "User Not exists"})
  }


})

app.get('/forget', (req, res) => {
  res.render("users/forgetPassword", {error_msg: ""})
})


//for sending verification code
app.post("/changePassword", async (req, res) => {

  const {email} = req.body;

  const userExists = await user.find(email)

  if(!userExists) {
    res.render("users/forgetPassword", {error_msg: "user not registered"})
    return
  }

  //generate Token
  const token = crypto({length: 6, characters: '1234567890'})

  //set token
  const set = await user.setToken(email, token)

  //send mail
  const mailer = require("../config/mailer.js")
  const sent = mailer.sendMailToken(email, "Recover password token", token)

  if(!sent) {
    res.render("users/forgetPassword", {error_msg: "cannot send"})
    return
  }

  //redirect verify
  res.render("users/verify",{forget: 1, error_msg: "token successfully sent"})

})


//for changing password
app.post('/forget', async (req, res) => {

  const { email, password, token } = req.body;

  console.log(email,token);
  token = token.trim()

  //check token
  const verified = await user.verify(email, token)

  if(verified) {

    //

    //reset password
    const reset = await user.changePassword(email, password)

    if(reset) {
      //redirectLogin
      res.render("users/login", {error_msg: "password successfully changed"})
    }
    else {
      console.log(reset);
    }
  }
  else {
    res.render("users/login", {error_msg: "email not found"})
  }
})



//XMLHttpRequest response routes
//send the presence of user
app.post("/loggedUser", (req, res) => {

  console.log("session user:", req.session.user);

  if(req.session.user) {
    res.send(req.session.user)
  } else { 
    res.send("")
  }
})

app.post("/signIn", (req, res) => {

  const {email, name} = req.body;

  req.session.user = {name: name, email: email};
  req.session.save()
  res.render("home", {user: req.session.user})

  console.log(`User ${req.session.user.email} successfully loggedIn`);
})

app.post('/lastUrl', (req, res) => {

  console.log('client requested lastUrl:', req.session.lastUrl);

  res.status(200).send(req.session.lastUrl?req.session.lastUrl:'')

})

module.exports = app;
