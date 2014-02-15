var nodemailer = require('nodemailer');
var mustache = require('mustache');
var parseArgs = require('minimist');
var fs = require('fs');
var csv = require('fast-csv');

var argv = parseArgs(process.argv.slice(2));

var from = argv.from;
var subject = argv.subject;

var bodyTemplate = fs.readFileSync(argv.bodytemplate, 'utf8');
var receiverStream = fs.createReadStream(argv.receivers);

var service = argv.service || 'Gmail';
var user = argv.user;
var pass = argv.pass;

var smtpTransport = nodemailer.createTransport('SMTP', {
  service: service,
  auth: {
    user: user,
    pass: pass
  }
});

var send = function(receiver) {
  var mailOptions = {
    from: from,
    to: receiver.email,
    subject: subject,
    text: mustache.render(bodyTemplate, receiver)
  }

  smtpTransport.sendMail(mailOptions, function(error, response) {
    if (error) {
      console.log(error);
    } else {
      console.log(response.message);
    }
  });
}

csv(receiverStream, {headers: true})
  .on('data', function(data) {
    console.log(data);
    send(data);
  })
  .on('end', function() {
    console.log('done');
  })
  .parse();
