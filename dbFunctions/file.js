const mysql = require('mysql')

const dbConnection = mysql.createConnection({
  host : "quickecabs.c6icae5zhws5.ap-south-1.rds.amazonaws.com",
  user : "admin",
  password : "quikecab_rahul",
  database : "quickecabs"
})

module.exports.getAvailableVehicles = () => {

  return new Promise((resolve, reject) => {
    dbConnection.query(`select name, seats, img from transports where availability=1`, (err, result) => {
      if(err) {
        console.log(err);
        resolve(-1)
      }
      else {
        if(result.length === 0) {
          resolve(0)
        }
        else {
          resolve(result)
        }
      }
    })
  })
}

module.exports.getFaresOf = (name) => {

  return new Promise((resolve, reject) => {
    dbConnection.query(`select * from fares where name='${name}'`, (err, result) => {
      if(err) {
        console.log(err);
        resolve(-1)
      }
      else {
        if(result.length === 0) {
          resolve(0)
        }
        else {
          resolve(result)
        }
      }
    })
  })
}


module.exports.setBookingInQueue = (details) => {

  return new Promise((resolve, reject) => {
    let sql = `insert into pending_bookings(Id, user_mail, user_name, name, fare, destination_from, destination_to, start_date, end_date, journey) values('${details.bookingId}', '${details.user_mail}', '${details.user_name}', '${details.category}', '${details.fare}', '${details.from}', '${details.to}', '${details.start_date}' ${details.end_date?`, '${details.end_date}', '${details.journey}'`:`, Null, Null`})`;
    console.log(sql);
    dbConnection.query(sql, (err, result) => {
      if(err) {
        console.log(err);
        resolve(-1)
      }
      else {
        resolve(1)
      }
    })
  })
}


module.exports.getPendingBookings = () => {

  return new Promise((resolve, reject) => {
    dbConnection.query(`select * from pending_bookings`, (err, result) => {
      if(err) {
        console.log(err);
        resolve(-1)
      }
      else {
        if(result.length === 0) {
          resolve([])
        }
        else {
          resolve(result)
        }
      }
    })
  })
}


module.exports.getActiveBookings = () => {

  return new Promise((resolve, reject) => {
    dbConnection.query(`select * from bookings where End=0 order by start_date`, (err, result) => {
      if(err) {
        console.log(err);
        resolve(-1)
      }
      else {
        if(result.length === 0) {
          resolve([])
        }
        else {
          resolve(result)
        }
      }
    })
  })
}


module.exports.getAllVehicles = () => {

  return new Promise((resolve, reject) => {
    dbConnection.query(`select * from transports`, (err, result) => {
      if(err) {
        console.log(err);
        resolve(-1)
      }
      else {
        if(result.length === 0) {
          resolve(0)
        }
        else {
          resolve(result)
        }
      }
    })
  })
}


module.exports.acceptBooking = (bookingId) => {
  return new Promise((resolve, reject) => {
    dbConnection.query(`insert into bookings (Id, user_mail, user_name, name, fare, destination_from, destination_to, start_date, end_date, journey) select * from pending_bookings where Id='${bookingId}'`, (err, result) => {
      if(err) {
        console.log(err.code);
        //TODO: seperate resolves by different types of errors generated
        resolve(-1)
      }
      else {
        if(result.length === 0) {
          resolve(0)
        } else {
          dbConnection.query(`delete from pending_bookings where id='${bookingId}'`, (err, result) => {
            if(err) {
              console.log(err);
            }
            else {
              console.log(result);
            }
          })
          resolve(result)
        }
      }
    })
  })
}


module.exports.endTrip = (bookingId) => {
  return new Promise((resolve, reject) => {
    dbConnection.query(`update bookings set end=1 where id='${bookingId}'`, (err, result) => {
      if(err) {
        console.log(err.code);
        //TODO: seperate resolves by different types of errors generated
        resolve(-1)
      }
      else {
        if(result.length === 0) {
          resolve(0)
        } else {
          resolve(result)
        }
      }
    })
  })
}


module.exports.toggleAvailability = (name) => {
  return new Promise((resolve, reject) => {
    dbConnection.query(`update transports set availability=(not availability) where name='${name}'`, (err, result) => {
      if(err) {
        console.log(err.code);
        //TODO: seperate resolves by different types of errors generated
        resolve(-1)
      }
      else {
        if(result.length === 0) {
          resolve(0)
        } else {
          resolve(result)
        }
      }
    })
  })
}
