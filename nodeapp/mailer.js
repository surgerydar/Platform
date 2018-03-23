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
                    user: 'aftertrauma@gmail.com',
                    pass: 'Ta8le202'
                }
            });

            // setup e-mail data
            var mailOptions = {
                from: '"AfterTrauma " <aftertrauma@gmail.com>', // sender address (who sends)
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
            reject( err );
        }
    });
}

module.exports = new Mailer();
