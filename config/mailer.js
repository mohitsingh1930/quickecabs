// jshint esversion:6
// const nodemailer = require("nodemailer")
// const mail_user = require(__dirname + "/user_mail.js")
const ejs = require("ejs")
// const mail_html = require("../views/email/onRegister.ejs")
const fs = require('fs');


require.extensions['.ejs'] = function (module, filename) {
    module.exports = fs.readFileSync(filename, 'utf8');
};


const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_KEY)


async function main(to, subject, token, mail)
{
  // // Generate test SMTP service account from ethereal.email
  // // Only needed if you don't have a real mail account for testing
  // let testAccount = await nodemailer.createTestAccount();
  //
  // // create reusable transporter object using the default SMTP transport
  // console.log(mail_user.user, mail_user.pass);
  // let transporter = nodemailer.createTransport({
  //   host: "smtp.ethereal.email",
  //   port: 587, // port: 587,
  //   secure: false, // true for 465, false for other ports
  //   auth: {
  //     user: testAccount.user,       // generated ethereal user
  //     pass: testAccount.pass        // generated ethereal password
  //   }
  // }, function(error, response){
  //       if(error){
  //           console.log(error);
  //       }else{
  //           res.redirect('/');
  //       }
  //   }
  // );


  var mail_file = {
    1: 'onRegister.ejs',
    2: 'bookingPending',
    3: 'bookingConfirmed',
    4: 'hotels.ejs'
  }


  var mail_html;

  switch(mail) {
    case 1:
      mail_html = ejs.render(require("../views/email/onRegister.ejs"), {token: token});
      break;
    case 2:
      mail_html = ejs.render(require("../views/email/bookingRequest.ejs"), {details: token});
      break;
    case 3:
      mail_html = ejs.render(require("../views/email/hotels.ejs"), {details: token});
      break;
  }


  var msg = {
    from: '<Devs@ineptdevs.com>',
    to: to,
    subject: subject,
    html: mail_html
  }


  return new Promise((resolve, reject) => {

    sgMail.send(msg)
    .then((result) => {
      console.log("email sent");
      resolve(1)
    })
    .catch((err) => {
      console.log(err.response);
      resolve(0)
    })

  })


  // module.exports = transporter
  //
  // // send mail with defined transport object
  // var mail_html = ejs.render(require("../views/email/onRegister.ejs"), {token: 123});
  //
  // const info = await transporter.sendMail({
  //   from: 'mohitsingh1930@gmail.com', // sender address
  //   to: 'abc@123.com', // list of receivers
  //   subject: "Hello", // Subject line
  //   //text: "Hello world?", // plain text body
  //   html: mail_html // html body
  // })


}


// main().catch(console.error)


module.exports.sendMailToken = async (to, subject, token, mail=1) => {
  console.log('mailer');
  return await main(to, subject, token, mail)
}


module.exports.sendMail = async (to, subject, details, mail) => {
  console.log('mailer');
  return await main(to, subject, details, mail)
}
