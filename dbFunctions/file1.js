const mysql = require('mysql')

const dbConnection = mysql.createConnection({
  host : "localhost",
  user : "ODBC",
  password : "",
  database : "quickiCabs"
})

module.exports.getAvailableVehicles = (date) => {

  return new Promise((resolve, reject) => {
    dbConnection.query(`select distinct(transports.category), transports.name from transports, bookings where (date(bookings.start_date)>${date} and bookings.id=transports.booking_no) or transports.booking_no is NULL`, (err, result) => {
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
    dbConnection.query(`insert into pending_booking(Id, user_mail, user_name, category, destination_from, destination_to, start_date, end_date, journey) values('${details.bookingId}', '${details.user_mail}', '${details.user_name}', '${details.category}', '${details.from}', '${details.to}', '${details.start_date}', '${details.end_date}', '${details.journey}')`, (err, result) => {
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
          resolve(0)
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
    dbConnection.query(`select * from bookings where End!=0 order by start_date`, (err, result) => {
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
