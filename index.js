const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
app.use(bodyParser.json());

const expressSession = require('express-session');
const cors_options = {
    origin: 'https://gdasd.github.io',
    credentials: true
  }

app.use(cors(cors_options));

const User = require("./login.js");

const login_data = require('data-store')( {path: process.cwd() + '/data/users.json'} );

app.use(expressSession({
    name: "tetrisSessionCookie",
    secret: "what it do babyyy",
    resave: false,
    saveUninitialized: false,
    proxy : true,
    cookie: { 
        secure: true,
        maxAge: 5184000000,
        sameSite: 'none'
    }
}))

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
    let user_data = login_data.get(username);
    if (user_data.username == null) {
        res.status(404).send("User not found")
        return;
    }
    if (user_data.password == password) {
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
    let upUser = User.findByName(req.params.username);
    if (upUser == null) {
        res.status(404).send("User not found");
        return;
    }
    upUser.updateScore(req.body.score);
    res.json(upUser);
})

app.post('/userpass/:username', (req, res) => {
    let user_data = login_data.get(req.params.username);
    let upUser = User.findByName(req.params.username);
    if (upUser == null) {
        res.status(404).send("User not found");
        return;
    }
    if (user_data.password != req.body.currentPassword) {
        res.status(403).send("Wrong Password");
        return;
    }

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
    // to give you users for the leaderboard, I'll sort the users by score (descending) and send it
    let sortedUsers = User.getAllUsers()
    sortedUsers = sortedUsers.sort((a, b) => parseInt(b.score) - parseInt(a.score));
    res.json(sortedUsers);
    return;
})

app.get('/username', (req, res) => {
    if (req.session.user == undefined) {
        res.status(403).send("unauthorized")
        return;
    }
    res.json(req.session.user);
})

const PORT = process.env.PORT || 3030;
app.listen(PORT, () => {
    console.log(`Our app is running on port ${ PORT }`);
});
