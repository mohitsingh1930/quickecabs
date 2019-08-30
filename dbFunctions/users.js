const mysql = require("mysql")
const bcrypt = require('bcrypt');
// const dateLib = require('../config/date.js')

const dbConnection = mysql.createConnection({
  host : "localhost",
  user : process.env.DB_USER,
  password : process.env.DB_PASSWORD,
  database : "quickecabs"
})


//find the user and resolves user all info else 0 if not found
module.exports.find = (email, password="") => {
  return new Promise((resolve, reject) => {
    var sql = `select * from our_users where email='${email}'`;
    // console.log(sql);
    dbConnection.query(sql, (err, result) => {
      if(err) {
        console.log(err);
      }
      if(result.length === 0) {
        console.log("Not exists");
        resolve(0);
      }
      else if(password != ""){
        console.log(password, result[0].password);
        if(bcrypt.compareSync(password, result[0].password)) {
          resolve(result[0])
        }
        else {
          resolve(-1)
        }
      }
      else {
        resolve(1);
      }
    })
  })
}


//create a user and resolves 1 if successfully created
module.exports.create = (name, email, password, active=0, validateToken="") => {
  return new Promise((resolve, reject) => {
    const password_hash = bcrypt.hashSync(password, 10)
    console.log(password_hash);
    dbConnection.query(`insert into our_users(email, name, password, active, validateToken) values('${email}', '${name}', '${password_hash}', ${active}, '${validateToken}')`, (err, result) => {
      if(err) {
        console.log(err);
        resolve(0)
      }
      else {
        resolve(1)
      }
    })
  })
}


// check if the the user is active or not
module.exports.isActive = (email) => {
  return new Promise((resolve, reject) => {
    dbConnection.query(`select active from our_users where email='${email}'`, (err, result) => {
      if(err) console.log(err);
      else {
        resolve(Number(result[0].active))
      }
    })
  })
}


//verifies the user by the given token and make user in active state
module.exports.verify = (email, token) => {
  return new Promise((resolve, reject) => {
    dbConnection.query(`select validateToken from our_users where email='${email}'`, (err, result) => {
      if(err) console.log(err);
      else {
        if(result[0].validateToken == token) {
          dbConnection.query(`update our_users set active=1, validateToken="" where email='${email}'`, (err, result) =>{
            if(err) {
              console.log(err)
              resolve(0)
            }
            else {
              resolve(1)
            }
          })
        }
      }
    })
  })
}


//set validateToken inside database
module.exports.setToken = (email, token) => {
  return new Promise((resolve, reject) => {
    dbConnection.query(`update our_users set validateToken='${token}' where email='${email}'`, (err) => {
      if(err) {
        console.log(err);
        resolve(0)
      }
      else {
        resolve(1)
      }
    })
  })
}


//change password of given email
module.exports.changePassword = (email, newPassword) => {
  return new Promise((resolve, reject) => {
    const password_hash = bcrypt.hashSync(newPassword, 10)
    dbConnection.query(`update our_users set password='${password_hash}' where email='${email}' `, (err, result) => {
      if(err) {
        console.log(err);
        resolve(0)
      }
      else {
        resolve(1)
      }
    })
  })
}


//inactives the user
module.exports.setInactive = (email) => {
  return new Promise((resolve, reject) => {
    dbConnection.query(`update our_users set active=false where email='${email}'`, (err, result) => {
      if(err) console.log(err);
      else {
        resolve(Number(result[0].active))
      }
    })
  })
}


//add comment to a post
module.exports.addComment = (post_id, userId, comment, comment_date_time) => {


  return new Promise((resolve, reject) => {
    dbConnection.query(`insert into comments values(${post_id}, ${userId}, '${comment_date_time}', '${comment}')`, (err, result) => {
      if(err) {
        console.log(err);
        resolve(0)
      }
      else {
        resolve(1)
      }
    })
  })
}
