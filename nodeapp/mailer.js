/* eslint-env node, mongodb, es6 */
/* eslint-disable no-console */
var nodemailer = require('nodemailer');

function Mailer() {   
    
}
// TODO: error reporting
Mailer.prototype.send = function( address, subject, html ) {
    return new Promise( function( resolve, reject ) {
        try {
            // Create the transporter with the required configuration for Gmail
            // change the user and pass !
            var transporter = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 465,
                secure: true, // use SSL
                auth: {
                    user: 'platformgame.net@gmail.com',
                    pass: "saGtT'd{u48a.]jt"
                }
            });

            // setup e-mail data
            var mailOptions = {
                from: '"Platform Game " <platformgame.net@gmail.com>', // sender address (who sends)
                to: address, // list of receivers (who receives)
                subject: subject, // Subject line
                html: html // html body
            };

            // send mail with defined transport object
            transporter.sendMail(mailOptions, function(error, info){
                if(error){
                    console.log( error );
                    reject( error )
                }

                resolve( info );
            });
        } catch( error ) {
            console.log( error );
            reject( error );
        }
    });
}

module.exports = new Mailer();
