const express = require('express');

const app = express();

const cors = require('cors');



const bodyParser = require('body-parser');
app.use(bodyParser.json());

const expressSession = require('express-session');

app.use(expressSession({
    name: "tetrisSessionCookie",
    secret: "what it do babyyy",
    resave: false,
    saveUninitialized: false,
    proxy : true,
  /*  cookie: { 
        secure: true,
        maxAge: 5184000000,
        sameSite: 'none'
    }*/
}))

const cors_options = {
    origin: 'https://gdasd.github.io',
    credentials: true
  }

app.use(cors(cors_options));

const User = require("./login.js");

const login_data = require('data-store')( {path: process.cwd() + '/data/users.json'} );

app.post('/user', (req, res) => {
    let {username, password} = req.body;
    let newUser = User.create(username, password);
    if (newUser == null) {
        res.status(400).send("Unable to create user. Username already taken");
        return;
    }
    res.json(newUser);
    return;
})

app.post('/login', (req, res) => {
    let username = req.body.username;
    let password = req.body.password;
    // console.log(req.body);
    let user_data = login_data.get(username);
    // console.log(user_data)
    if (user_data.username == null) {
        res.status(404).send("User not found")
        return;
    }
    if (user_data.password == password) {
        // console.log("User " + username + " credentials valid")
        req.session.user = username;
        res.json(username)
        return;
    }

    res.status(403).send("Not authorized")
})

app.get('/logout', (req, res) => {
    delete req.session.user;
    res.json(true);
})

app.put('/userscore/:username', (req, res) => {
    //console.log("we in");
  /*  if (req.session.user == undefined) {
        // console.log("here")
        res.status(403).send("Unauthorized no one logged in")
        return;
    }*/

    let upUser = User.findByName(req.params.username);
    // console.log(upUser);
    if (upUser == null) {
        res.status(404).send("User not found");
        return;
    }

  /*  if(upUser.username != req.session.user) {
        res.status(403).send("Unauthorized user not logged in")
        return;
    }*/
    req.session.user = req.params.username;
    upUser.updateScore(req.body.score);
    res.json(upUser);
})

app.put('/userpass/:username', (req, res) => {
    //console.log("we in");
  /*  if (req.session.user == undefined) {
        // console.log("here")
        res.status(403).send("Unauthorized no one logged in")
        return;
    }*/

    let upUser = User.findByName(req.params.username);
    // console.log(upUser);
    if (upUser == null) {
        res.status(404).send("User not found");
        return;
    }

  /*  if(upUser.username != req.session.user) {
        res.status(403).send("Unauthorized user not logged in")
        return;
    }*/
    req.session.user = req.params.username;
    upUser.updatePass(req.body.pass);
    res.json(upUser);
    return;
})

app.delete('/user/:username', (req, res) => {
    if (req.session.user == undefined) {
        res.status(403).send("Unauthorized")
        return;
    }

    let delUser = User.findByName(req.params.username);
    if (delUser == null) {
        res.status(404).send("User not found");
        return;
    }

    if(delUser.username != req.session.user) {
        res.status(403).send("Unauthorized")
        return;
    }
    delUser.delete();
    delete req.session.user;
    return;
})


app.get('/users', (req, res) => {
    let username = req.session.user;
   /* if (req.session.user == undefined) {
        res.status(403).send("Unauthorized")
        return;
    }*/

    // to give you users for the leaderboard, I'll sort the users by score (descending) and send it
    // console.log("we here")
    let sortedUsers = User.getAllUsers()
    // console.log(sortedUsers)
    sortedUsers = sortedUsers.sort((a, b) => parseInt(b.score) - parseInt(a.score));
    req.session.user = req.body.username;
    res.json(sortedUsers);
    return;
})

app.get('/username', (req, res) => {
    let username = req.session.user;
    if (req.session.user == undefined) {
        res.status(403).send("unauthorized")
        return;
    }
    
    req.session.user = username;
    res.json(req.session.user);
})


/*app.get('/user/:username', (req, res) => {
    if (req.session.user == undefined) {
        res.status(403).send("Unauthorized no none logged in")
        return;
    }

    let user = User.findByName(req.params.username);

    if (user == null) {
        res.status(404).send("User not found");
        return;
    }

    if(user.username != req.session.user) {
        res.status(403).send("Unauthorized user not logged in")
        return;
    }

    res.json(user);
})*/



const PORT = process.env.PORT || 3030;
app.listen(PORT, () => {
    console.log(`Our app is running on port ${ PORT }`);
});