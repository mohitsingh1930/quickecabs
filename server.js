var createError = require('http-errors');
var express = require('express');
var dbfunctions = require(__dirname + '/dbFunctions/file.js')
var logger = require('morgan');
var ejs = require('ejs') 
var session = require('express-session')
var dateFns = require('date-fns')
var lodash = require('lodash')
const cryptoRandomString = require('crypto-random-string');
const mailer = require('./config/mailer.js')

var usersRouter = require('./routes/users.js');

var app = express();


//admin control variables
const minimumTimeDuration = 2; //->minimum time duration in hours for setting pickup time
const hotelPriceIncrement = 200;
const Price = {                //->price list for hotel rooms
  1: {
    name: 'Grace Resort, Manali',
    2: 2400+hotelPriceIncrement,
    3: 2800+hotelPriceIncrement
  },
  2: {
    name: 'The Rock Manali, Manali',
    1: 3200+hotelPriceIncrement,
    2: 2500+hotelPriceIncrement,
    3: 4000+hotelPriceIncrement
  },
  3: {
    name: 'Phoenix Resort, Mussoorie',
    1: 2700+hotelPriceIncrement,
    2: 3200+hotelPriceIncrement,
    3: 3900+hotelPriceIncrement
  },
  4: {
    name: 'Value and Spa, Mussoorie',
    1: 1600+hotelPriceIncrement,
    2: 2100+hotelPriceIncrement,
    3: 2800+hotelPriceIncrement
  }
}

app.set('view engine', 'ejs');

// app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser());
app.use(express.static('public'));


//session definition
const TWO_HOURS = 1000*60*60*2;

const {
  PORT = 3000,
  SESS_LIFETIME = TWO_HOURS,
  NODE_ENV = 'development',
  SESS_NAME = 'sid',
  SESS_SECRET = 'sssh!quiet',
} = process.env

const https = 0 //http or https
const IN_PROD = NODE_ENV === 'production'

app.use(["/", "/users"],session({
  name: SESS_NAME,
  resave: false,
  saveUninitialized: false,
  secret: SESS_SECRET,
  cookie: {
    maxAge: SESS_LIFETIME,
    sameSite: true,
    secure: IN_PROD && https
  }
}))


// app.use('/', indexRouter);

const checkAdmin = (req, res, next) => {
  if(req.session.user === 'admin') {
    console.log("Admin logged in");
    next();
  }
  else {
    console.log("admin not in");
    res.redirect('/')
  }
}


// app.use('/users/login')


app.get('/', (req, res) => {

  if(typeof req.session.msg !== undefined) {
    res.locals.msg = req.session.msg
    console.log(res.locals.msg);
    delete req.session.msg
  }

  res.render("home", {user_name: req.session.user?req.session.user.name:""})
})


app.use('/users', usersRouter);


//middleware to check if start date is acc to minimumTimeDuration
var checkValidTime = (req, res, next) => {

  var start_day = req.body.start_date;
  var end_day = (req.body.end_date != undefined)?req.body.end_date:req.body.start_date;

  var start_day = dateFormat(start_day)
  var end_day = dateFormat(end_day)

  console.log("start day and end day:", start_day, end_day, checkOldDay(start_day), checkOldDay(end_day));

  if(checkOldDay(start_day) || checkOldDay(end_day)) {

    msg = {
      title: `invalid pickup time`,
      body: `please choose pickup time atleast ${minimumTimeDuration} hours later from now`
    }

    req.session.msg = msg;

    res.redirect('/')

  }
  else {
    next()
  }

}


app.post('/dailyride/', checkValidTime, async (req, res) => {

  const booking_details = {
    from: req.body.destination_from,
    to: req.body.destination_to,
    start_date: req.body.start_date
    // end_date: req.body.end_date,
    // journey: req.params.journey_type
  }

  console.log(booking_details);

  // req.session.booking_details = booking_details;
  res.locals.dailyRide_booking_details = booking_details;
  res.locals.oneWay_booking_details = {from: '', to: '', start_date: '', end_date: '', journey: ''};
  res.locals.roundTrip_booking_details = {from: '', to: '', start_date: '', end_date: '', journey: ''};


  var day = dateFormat(booking_details.start_date);
  booking_details.start_datetime = day.format;
  req.session.booking_details = booking_details;


  //get available vehicles
  var rides = await dbfunctions.getAvailableVehicles()

  if(rides === 0 || rides === -1) {
    console.log(rides);
    return res.send("No rides available")
  }

  //assigning respective fares
  for(let ride of rides) {
    let fare = await dbfunctions.getFaresOf(ride.sno)
    // console.log(ride.name, fare);
    ride.fare = fare[0];

    //TODO: calculate total fares of each
    console.log(`fares of ${ride.name}:`, ride.fare.outstation, ride.fare.driver);
    ride.totalFare = ride.fare.local;
  }

  var km = await calculateDistance(booking_details.from, [booking_details.to])

  // var parentRoute = req.originalUrl.slice(1, req.originalUrl.slice(1).indexOf('/')+1)
  res.locals.parentRoute = 'dailyride';
  req.session.parentRoute = 'dailyride';

  rides = lodash.sortBy(rides, ['totalFare'], ['asc'])

  res.render('carselect', {vehicles: rides, duration: 1, distanceInKm: km})

})


app.post('/outstation/one-way|round-trip', checkValidTime, async (req, res) => {

  const booking_details = {
    from: req.body.destination_from,
    to: req.body.destination_to,
    start_date: req.body.start_date,
    end_date: req.body.end_date,
    journey: req.originalUrl.slice(12)
  }

  console.log(booking_details);

  req.session.booking_details = booking_details;


  var start_day = dateFormat(booking_details.start_date)
  var end_day = dateFormat(booking_details.end_date)

  req.session.booking_details.start_datetime = start_day.format;
  req.session.booking_details.end_datetime = end_day.format;


  console.log("start and end datetime:", start_day, end_day);

  //calculate total days for fares
  var days = dateFns.distanceInWordsStrict(
    new Date(start_day.year, start_day.month, start_day.date),
    new Date(end_day.year, end_day.month, end_day.date),
    {unit: 'd'}
  )

  var extra = dateFns.distanceInWordsStrict(
    new Date(2019, 08, 09, start_day.hour, start_day.minute),
    new Date(2019, 08, 09, end_day.hour, end_day.minute)
  ).split(' ')

  if(days > 15) {
    req.session.msg = {title: 'Invalid Details', body: 'Invalid nummber of days, rides are available for max 15 days'}
    return res.redirect('/')
  }

  days = Number(days.slice(0, days.indexOf(' ')))

  if(extra[1] === 'hours' && Number(extra[0]) > 3) {
    days++;
  }

  console.log("days:", days, "extras:", extra);


  //get available vehicles
  var rides = await dbfunctions.getAvailableVehicles()


  if(rides === 0 || rides === -1) {
    return res.send("No rides available")
  }

  if(!Array.isArray(booking_details.to)) {
    booking_details.to = [booking_details.to]
  }


  //check fare calculation method(days or km)
  
  //towards journey
  var km = await calculateDistance(booking_details.from, Array.isArray(booking_details.to)?booking_details.to:[booking_details.to]);
  
  if(km == -1) {
    req.session.msg = {
      title: 'Invalid Details',
      body: 'Please choose pickup/drop locations from suggestions, do not worry about actual coordinates'
    }

    return res.redirect('/')
  }


  //return: calculate return from final given destination to pickup location
  var returnStraight = await distanceMatrixAPI([booking_details.to[booking_details.to.length-1]], [booking_details.from])
  console.log("return straight distance:", returnStraight[0].distance.text.split(' ')[0])
  km += parseFloat(returnStraight[0].distance.text.split(' ')[0])

  km = Number.parseFloat(km).toPrecision(4)

  console.log("Total kilometers:", km, "and total days:", days)

  req.session.booking_details.distanceInKm = km;
  req.session.booking_details.duration = days;

  
  //assigning respective fares
  for(let ride of rides) {

    var temp=days;
    if(ride.sno == 1) {
      if(km > days*200) {
        temp = Math.ceil(km/200)
        console.log("days changed (200):", temp);
      }
    } else {
      if(km > days*250) {
        temp = Math.ceil(km/250)
        console.log("days changed (250):", temp);
      }
    }
    ride.days=temp;

    let fare = await dbfunctions.getFaresOf(ride.sno)
    // console.log(ride.name, fare);
    ride.fare = fare[0];

    // console.log(`fares of ${ride.name}:`, ride.fare.outstation, ride.fare.driver);
    ride.totalFare = ride.fare.outstation*temp + ride.fare.driver*temp;
  }


  var parentRoute = req.originalUrl.slice(1, req.originalUrl.slice(1).indexOf('/')+1)
  // console.log(parentRoute);
  res.locals.parentRoute = parentRoute;
  req.session.parentRoute = parentRoute


  //creating Neccesary objects of booking details for template
  var emptyObject = {from: '', to: '', start_date: '', end_date: '', journey: ''}

  if(req.originalUrl.slice(12) === 'one-way') {

    res.locals.oneWay_booking_details = booking_details;
    res.locals.roundTrip_booking_details = emptyObject;
    res.locals.oneWay_booking_details.to = res.locals.oneWay_booking_details.to.join('$');
    console.log(res.locals.oneWay_booking_details.to)
    
  } else if(req.originalUrl.slice(12) === 'round-trip') {
    
    res.locals.roundTrip_booking_details = booking_details;
    res.locals.oneWay_booking_details = emptyObject;
    res.locals.roundTrip_booking_details.to = res.locals.roundTrip_booking_details.to.join('$');
    console.log(res.locals.roundTrip_booking_details.to)

  }
  dailyRide_booking_details = emptyObject;


  rides = lodash.sortBy(rides, ['totalFare'], ['asc'])


  res.render('carselect', {vehicles: rides, distanceInKm: km, duration: days})

})


// app.get('/outstation/cars', (req, res) => {
//   res.render('carselect', {vehicles: []})
// })


const redirectLogin = (req, res, next) => {
  if(!req.session.user) {
    res.redirect('/users/login')
  }
  else {
    next()
  }
}

app.post(['/dailyride/booking/:car_category/:fare','/outstation/booking/:car_category/:fare'], redirectLogin, async (req, res) => {

  //fetch journey details
  const booking_details = req.session.booking_details;

  var {car_category, fare} = req.params;
  console.log("url:", req.params, req.query);

  //generate bookingId
  var bookingId = booking_details.start_datetime.slice(0, booking_details.start_datetime.indexOf(' ')).split('-').join('') + cryptoRandomString({length: 7});

  //check ride is daily or outstation
  var parentRoute = req.session.parentRoute;
  console.log("Parent route:", parentRoute);
 
  //make details object
  details = {
    bookingId: bookingId,
    user_mail: req.session.user.email,
    user_name: req.session.user.name,
    car_id: car_category, 
    fare: fare,
    from: req.session.booking_details.from,
    to: Array.isArray(req.session.booking_details.to)?req.session.booking_details.to.join('$ '):req.session.booking_details.to,
    start_date: req.session.booking_details.start_datetime,
    end_date: (parentRoute === 'outstation')?req.session.booking_details.end_datetime:"",
    journey: (parentRoute === 'outstation')?req.session.booking_details.journey:""
  }


  //push into pending_booking table
  var details_pushed = await dbfunctions.setBookingInQueue(details);

  if(details_pushed != -1) {

    var sent = mailer.sendMail(req.session.user.email, "Booking request received", details, 2);

    if(sent) {
      req.session.msg = {
        title: 'Booking request received',
        body: `Booking request sent, we will inform you when it's confirmed, bookingId: ${details.bookingId}`
      }
    } else {
      req.session.msg = {
        title: 'Booking request received, Error in sending mail',
        body: `Booking request sent, we will inform you when it's confirmed, bookingId: ${details.bookingId}`
      }
    }


  } else {

    req.session.msg = {
      title: 'Error',
      body: 'Error in booking please rebook'
    }

  }

  res.redirect('/')

})


app.get('/HotelsList', (req, res)=> {
  res.render('HotelList');
})


app.get('/hotel[1-5]', (req, res) => {
  console.log(req.originalUrl);
  res.render(`${req.originalUrl.slice(1)}.ejs`)
})


app.post('/hotels/booking/:id', redirectLogin,  async (req, res) => {

  var hotel_details = req.body;
  hotel_details.id = req.params.id;


  console.log("hotel Booking Details:", hotel_details);
  hotel_details.totalPrice = computePrice(hotel_details);
  
  
  hotel_details.meal = {1: 'EP(Only Rooms)', 2: 'CP(Breakfast Included)', 3: 'MAP(Breakfast with lunch or dinner'}[hotel_details.meals];
  delete hotel_details.meals;
  
  console.log("hotel Booking Details:", hotel_details);

  if(hotel_details.computePrice == -1) {
    return res.redirect('/hotel' + req.params.id);
  }

  
  var sent = await mailer.sendMail(req.session.user.email, 'Hotel Booking Request', hotel_details, 3);

  var mailToAdmin = await mailer.sendMail(process.env.TEAM_MAIL, 'Hotel Booking Request', hotel_details, 3);

  if(sent && mailToAdmin) {
    var msg = {
      title: "Booking Request Sent",
      body: "Your request for booking "+ hotel_details.rooms +" rooms in Hotel "+Price[hotel_details.id].name+"successfully sent"
    }
  } else {
      var msg = {
      title: "Error in Booking",
      body: "Due to some fault booking request not sent, please rebook or contact admin"
    }
  }
    req.session.msg = msg;
  
    
    
  
  res.redirect(`/`);


})


// app.get('/packages', (req, res) => {
//   res.render('packages.ejs')
// })
//
//
// app.post('/packages', async (req, res) => {
//
//   var details = req.body;
//
//   var subject = 'Packages enquiry'
//
//   var sent = await mailer.sendMail('mohitsingh1930@gmail.com', subject, details, 2)
//
//   if(sent) {
//     res.send('your request is successfully sent, we will contact you')
//   } else {
//     res.send('Error in sending enquiry try again later or contact admin directly <a href="/contacts">Contact</a>')
//   }
//
// })


app.get('/admin', checkAdmin, async (req, res) => {

  //TODO: check if the user is a admin or not


  //get pending bookings
  const pending_bookings = await dbfunctions.getPendingBookings()

  for(let i=0; i<pending_bookings.length; i++) {
    pending_bookings[i].start_date = dateFns.format(`${pending_bookings[i].start_date}`, 'HH:mm Do MMM, YYYY')
    pending_bookings[i].end_date = dateFns.format(`${pending_bookings[i].end_date}`, 'HH:mm Do MMM, YYYY')
  }

  //get active journeys
  const active_bookings = await dbfunctions.getActiveBookings()

  for(let i=0; i<active_bookings.length; i++) {
    active_bookings[i].start_date = dateFns.format(`${active_bookings[i].start_date}`, 'HH:mm Do MMM, YYYY')
    active_bookings[i].end_date = dateFns.format(`${active_bookings[i].end_date}`, 'HH:mm Do MMM, YYYY')
  }

  //get all list of cars
  const cars = await dbfunctions.getAllVehicles()

  console.log("active_bookings:", active_bookings);

  res.render("admin", {pending_bookings: pending_bookings, bookings: active_bookings, cars: cars})

})


app.get('/AboutUs', (req, res) => {
  res.render('about-us')
})


app.get('/Contacts', (req, res) => {
  res.render('contacts')
})


//XMLHttpRequest response routes
app.post('/admin/acceptBooking/', checkAdmin, async (req, res) => {
  const id = req.body.id;
  const mail = req.body.email;
  const carNumber = req.body.carNumber;
  console.log("booking request received for id:", id);

  var sent = mailer.sendMail(mail, 'Booking Confirmed', {carNumber: carNumber}, 2)

  if(sent) {

    const accepted = await dbfunctions.acceptBooking(id, carNumber)

    if(!accepted) {
      console.log(`Booking id: ${id} not exists in pending bookings`);
      res.send('0')
    }
    else if(accepted === -1) {
      res.send('-1')
    }
    else {
      res.send('1')
    }

  } else {
    res.send('Mail Error')
  }



})


app.post('/admin/endTrip/', checkAdmin, async (req, res) => {
  const id = req.body.id;

  console.log("ending request received for id:", id);

  const ended = await dbfunctions.endTrip(id)

  if(!ended) {
    console.log(`Booking id: ${id} not exists in bookings`);
    res.send('0')
  }
  else if(ended === -1) {
    res.send('-1')
  }
  else {
    res.send('1')
  }

})


app.post('/admin/toggleAvailability/', checkAdmin, async (req, res) => {
  const name = req.body.name;

  console.log("toggle request received for car name:", name);

  const toggled = await dbfunctions.toggleAvailability(name)

  if(!toggled) {
    console.log(`car: ${name} not exists in transports`);
    res.send('0')
  }
  else if(toggled === -1) {
    res.send('-1')
  }
  else {
    res.send('1')
  }

})


app.post('/admin/cancelRequest', async (req, res) => {

  const id = req.body.id;

  console.log("booking id:", id);

  var cancelled = await dbfunctions.cancelRequest(id)

  if(cancelled) {
    res.send('1')
  } else {
    res.send('0')
  }
}) 


app.post('/hotels/:id/getPrice', (req, res) => {

  var id = req.params.id;
  console.log("hotel", id,"price demanded by client:", Price[id]);
  res.send(Price[id]);
})




// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.listen(3000, () => {
  console.log("server started at 3000")
 
  app.locals.key = process.env.GMAPS_KEY

  app.locals.url = (process.env.NODE_ENV === 'production')?'www.quikecab.online':'127.0.0.1:3000';

  console.log("NODE_ENV:", app.locals.url)


  console.log("<<<<<<<<<<<<<WELCOME TO QUIKECAB>>>>>>>>>>>>>>>>>")
})

// module.exports = app;






//Neccesary function definitions
function dateFormat(datetime) {

  var date = datetime.slice(6)

  const dayObj = {
    date: Number(date.substr(3, 2)),
    month: Number(date.substr(0, 2)),
    year: Number(date.substr(6, 4)),
    hour: Number(datetime.substr(0, 2)),
    minute: Number(datetime.substr(3, 2)),
    format: dateFns.format(new Date(Number(date.substr(6, 4)), Number(date.substr(0, 2))-1, Number(date.substr(3, 2)), Number(datetime.substr(0, 2)), Number(datetime.substr(3, 2)), 00), 'YYYY-MM-DD HH:mm:ss')
  }

  return dayObj;
}


function checkOldDay(day) {

  var possibleTime = new Date();

  possibleTime.setHours(possibleTime.getHours() + minimumTimeDuration)

  console.log('possible time:', dateFns.format(possibleTime, 'HH:MM DD/MMM/YYYY'));

  return dateFns.isBefore(new Date(day.year, day.month-1, day.date, day.hour, day.minute), possibleTime)
}


function computePrice(details) {

  var roomPrice = Price[details.id];

  var rooms = Number(details.rooms);
  var adults = Number(details.adults);
  var children = Number(details.children);
  var meal = Number(details.meals);
  var checkInDate = new Date(details['checkIn'])
  var checkOutDate = new Date(details['checkOut'])


  //calculating totaldays
  var totalDays = 0;
  if(details['checkIn'] && details['checkOut']) {

    let diff = checkOutDate - checkInDate;
    if(diff < 0) {
        return -1;
    } else {
        totalDays = diff/(1000*60*60*24);
    }

  } else {
      console.log("date inputs not filled")
      return -1;
  }
  

  console.log("pricing compute details:", roomPrice, rooms, adults, children, meal, totalDays);

  // console.log('rooms=', rooms, 'adults=', adults, 'children=', children, 'meal=', meal);

  var maxPersonsAllowed = rooms*2;
  var totalPrice = rooms*roomPrice[meal];

  if(maxPersonsAllowed < adults+children) {
      var temp = maxPersonsAllowed-adults;
      if(temp>0) {
          if(temp-children < 0){
              temp = temp - children;
              var totalPrice = totalPrice + (-1)*temp*roomPrice[meal]*0.3;
          }
      }
      else {
        totalPrice = totalPrice + ((-1)*temp*0.35 + children*0.3)*roomPrice[meal];
    }
  }

    totalDays++;
    totalPrice = totalPrice*totalDays;
    return totalPrice;
}




async function calculateDistance(origin, destinations) {

  // if(!(Array.isArray(destinations) && typeof origin === 'string')) {
  //   console.log("Arguments:", origin, destinations);
  //   return 'Invalid arguments'
  // }

  var distanceInKms = 0;

  distanceInKms = await distanceMatrixAPI(origin, destinations[0])

  if(distanceInKms[0].status == 'NOT_FOUND' || distanceInKms[0].status == 'ZERO_RESULTS') {
    console.log("error in inputs");
    return await Promise.resolve(-1)
  }

  distanceInKms = parseFloat(distanceInKms[0].distance.text.split(' ')[0])

  for(let i=0; i<destinations.length-1; i++) {

    let temp = await distanceMatrixAPI([destinations[i]], [destinations[i+1]])
    temp = temp[0].distance.text.split(' ')[0]

    // console.log(temp)

    temp = parseFloat(temp)


    distanceInKms += temp;
  }

  console.log("distanceInKms:", distanceInKms);

  return Promise.resolve(distanceInKms);
}

async function distanceMatrixAPI(origins, destinations) {

  const gmapsDistanceMatrix = require('@google/maps')

  const mapsClient = gmapsDistanceMatrix.createClient({
    key: process.env.GMAPS_KEY,
    Promise: Promise
  })

  query = {
    origins: origins,
    destinations: destinations,
    mode: 'driving',
    units: 'metric'
  }

  var result = await mapsClient.distanceMatrix(query).asPromise()

  console.log(result.json.rows[0].elements);

  return Promise.resolve(result.json.rows[0].elements);

}