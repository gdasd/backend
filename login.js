const user_data = require('data-store')( {path: process.cwd() + '/data/users.json'} );

class User {
    constructor (username, password, score) {
        this.username = username;
        this.password = password;
        this.score = score;
    }

    updateScore (score) {
        if (score > this.score) {
            this.score = score;
        }
        user_data.set(this.username, this);
    }

    updatePass (pass) {
        this.password = pass;
        user_data.set(this.username, this);
    }

    delete () {
        user_data.del(this.username)
    }
}

User.getAllUsers = () => {
    // return Object.keys(user_data.data);
    return Object.values(user_data.data);
}

User.getAllNames = () => {
    // console.log("we bouta return")
    return Object.keys(user_data.data).map(names => names.username);
}

User.findByName = (name) => {
    let udata = user_data.get(name);
    if (udata != null) {
        return new User(udata.username, udata.password, udata.score);
    }
}

User.create = (username, password) => {
    if (user_data.get(username) == null) {
        let newUser = new User(username, password, "0");
        user_data.set(username, newUser);
        return newUser;
    }
    return null;
}

module.exports = User;