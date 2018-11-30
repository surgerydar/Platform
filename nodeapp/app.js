var env = process.env;
var config = require('./config.js');
var fs = require('fs');
//
// connect to database
//
var db = require('./platform.db.js');
db.connect(
	env.MONGODB_DB_HOST,
	env.MONGODB_DB_PORT,
	env.APP_NAME,
    env.MONGODB_DB_USERNAME,
	env.MONGODB_DB_PASSWORD
).then( function( db_connection ) {
    try {
        //
        // configure express
        //
        console.log('initialising express');
        let express = require('express');
        let bodyParser = require('body-parser');
        let jsonParser = bodyParser.json();
        let mailer = require('./mailer.js');
        //
        //
        //		
        let app = express();
        //
        //
        //
        app.use(bodyParser.json( {limit:'5mb'} ));
        app.use(bodyParser.urlencoded({'limit': '5mb', 'extended': false }));
        //
        // configure express
        //
        app.set('view engine', 'pug');
        app.use(express.static(__dirname+'/static',{dotfiles:'allow'}));
        //
        // session handling
        // TODO: session persistance https://www.npmjs.com/package/connect-mongo
        //
        app.use(require('cookie-parser')('unusual*windy'));
        app.use(require('express-session')({ secret: 'unusual*windy', resave: false, saveUninitialized: false }));
        //
        // authentication
        //
        let passport = require('./passportauth')( app, db );
        let facebook = require('./routes/facebook')( passport.passport, config, db );
        app.use( '/facebook', facebook );
        let twitter = require('./routes/twitter')( passport.passport, config, db );
        app.use( '/twitter', twitter );
        //
        // express routes
        //
        console.log('general routes');
        app.get('/', function (req, res) {
			res.render('index',{title: 'Platform', authorised: req.user && req.isAuthenticated() });
        });
        app.get('/privacy', function (req, res) {
			res.render('index',{title: 'Platform', authorised: req.user && req.isAuthenticated() });
        });
        app.get('/termsofservice', function (req, res) {
			res.render('index',{title: 'Platform', authorised: req.user && req.isAuthenticated() });
        });
        //
        // game content
        //
        console.log('content routes');
        let users = require('./routes/users')( passport.isAuthenticated, db );
        app.use( '/users', users );
        let levels = require('./routes/levels')( passport.isAuthenticated, db );
        app.use( '/levels', levels );
        let media = require('./routes/media')( passport.isAuthenticated, db );
        app.use( '/media', media );
        let audio = require('./routes/audio')( passport.isAuthenticated, db );
        app.use( '/audio', audio );
        let arcades = require('./routes/arcades')( passport.isAuthenticated, db );
        app.use( '/arcades', arcades );
        let rating = require('./routes/rating')( passport.isAuthenticated, db );
        app.use( '/rating', rating );
        //
        // ui
        //
        app.get('/play/:levelid', function (req, res) {
			res.render('play',{authorised: req.user && req.isAuthenticated(), levelid:req.params.levelid });
        });
        app.get('/edit/:levelid', passport.isAuthenticated, function (req, res) { // TODO: include authentication
			res.render('edit',{authorised: req.user && req.isAuthenticated(), levelid:req.params.levelid });
        });
        //
        // ui templates
        //
        let templates = require('./routes/template')();
        app.use( '/template', templates );
        //
        // admin
        //
        /*
        let admin = require('./routes/admin')( pasportAuth, db );
        app.use( '/admin', admin );
        */
        //
        // remove these in production
        //
		/*
        app.get('/testemail/:message', function(req,res) {
            mailer.send( 'jons@soda.co.uk', 'Testing AfterTrauma', req.params.message ).then( function( response ) {
                res.json( {status: 'OK'} );
            }).catch( function( error ) {
                res.json( {status: 'ERROR', message: JSON.stringify( error ) } );
            });
        });
		*/
        //
        // configure websockets
        //
        console.log('configuring websocket router');
        let wsr = require('./websocketrouter');
        /*
        //
        // connect authentication
        //
        console.log('authentication');
        let authentication = require('./authentication');
        authentication.setup(wsr,db);
        //
        // connect profile
        //
        console.log('profile');
        let profile = require('./profile');
        profile.setup(wsr,db);
        //
        // connect chat
        //
        console.log('chat');
        let chat = require('./chat');
        chat.setup(wsr,db);
        */
        //
        // connect fileuploader
        //
        let fileuploader = require('./fileuploader');
        fileuploader.setup(wsr);
        //
        // create server
        //
        console.log('creating server');
        let httpx = require('./httpx');
        let server = httpx.createServer(config.ssl, { http:app, ws:wsr });
        //
        // start listening
        //
        console.log('starting server');
        server.listen(env.NODE_PORT || 3000, env.NODE_IP || 'localhost', () => console.log('Server started'));
    } catch( error ) {
        console.log( 'unable to start server : ' + error );
    }
}).catch( function( err ) {
	console.log( 'unable to connect to database : ' + err );
});
