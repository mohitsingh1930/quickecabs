const mysql = require('mysql')

const dbConnection = mysql.createConnection({
  host : process.env.DB_HOST,
  user : process.env.DB_USER,
  password : process.env.DB_PASSWORD,
  database : process.env.DB_NAME
})

module.exports.getAvailableVehicles = () => {

  return new Promise((resolve, reject) => {
    dbConnection.query(`select sno, name, seats, img from transports where availability=1`, (err, result) => {
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

module.exports.getFaresOf = (id) => {

  return new Promise((resolve, reject) => {
    dbConnection.query(`select * from fares where sno=${id}`, (err, result) => {
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
    let sql = `insert into pending_bookings(Id, user_mail, user_name, sno, fare, destination_from, destination_to, start_date, end_date, journey) values('${details.bookingId}', '${details.user_mail}', '${details.user_name}', '${details.car_id}', '${details.fare}', '${details.from}', '${details.to}', '${details.start_date}' ${details.end_date?`, '${details.end_date}', '${details.journey}'`:`, Null, Null`})`;
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
    dbConnection.query(`select pending_bookings.*, transports.name from pending_bookings, transports where transports.sno=pending_bookings.sno`, (err, result) => {
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
    dbConnection.query(`select bookings.*, transports.name from bookings, transports where transports.sno=bookings.sno and End=0 order by start_date`, (err, result) => {
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
    dbConnection.query(`insert into bookings (Id, user_mail, user_name, sno, fare, destination_from, destination_to, start_date, end_date, journey) select * from pending_bookings where Id='${bookingId}'`, (err, result) => {
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


module.exports.assignCarNumber = (bookingId, carNumber) => {
  return new Promise((resolve, reject) => {
    dbConnection.query(`update bookings set car_number='${carNumber}' where id='${bookingId}'`, (err, result) => {
      if(err) {
        console.log(err);
        resolve(0);
      } else {
        resolve(result);
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
