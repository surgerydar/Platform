//
// passport authentication 
//
/* eslint-env node, mongodb, es6 */
/* eslint-disable no-console */
var passport = require('passport');

module.exports = function( app, db ) {
    //
    //
    //
    passport.serializeUser(function(user, callback) {
        //console.log( 'serialising user');
        callback(null, user._id);
    });

    passport.deserializeUser(function(id, callback) {
        //console.log( 'deserialising user');
        db.findOne('users', { _id:db.ObjectId(id) }, { username: 1, role: 1, groups: 1 } ).then( function(user) {
            /*
                user appended to req
                user : {
                    username: "username",
                    role: "admin|moderator|creator",
                    groups: [ "system" | "group1", "group2" ... "groupN" ]
                }
            
            */
            //console.log( 'deserialised user : ' + JSON.stringify(user) );
            callback(null, user);
        }).catch( function( error ) {
            callback( error );
        });
    });
    //
    //
    //
	app.use(passport.initialize());
	app.use(passport.session());
    //
    // routes
    //
    app.get('/login', function(req, res){
        let param = req.query;
        param.title = 'Log in to Platform';
        res.render('login', param);
    });
    app.get('/logout', function(req, res){
        console.log( 'logout user : ' + JSON.stringify(req.user) + ' : xhr : ' + req.xhr );
        delete req.session.group;
        req.logout();
        if( req.xhr ) {
            res.json( { status: 'OK' } );
        } else {
            res.redirect('/');
        }
    });
    app.get('/authentication', function( req, res ) {
        if ( req.user && req.isAuthenticated() ) {
            res.json( { status: 'OK', user: req.user });
        } else {
            res.json( { status: 'ERROR', error: 'you have to be logged in' });
        }
        
    });
    //
    //
    //
    return {
        passport: passport,
        isAuthenticated: function(req, res, next) {
            if ( req.user && req.isAuthenticated() ) {
                return next();
            } else {
                if( req.xhr ) {
                    // ajax requests get a brief response
                    console.log( 'rejecting xhr request' );
                    //res.status(401).json({ status : 'ERROR', message : 'you have to be logged in' });
                    res.json({ status : 'ERROR', error : 'you have to be logged in' });
                } else {
                    // all others are redirected to login
                    console.log( 'redirecting to login' );
                    // store original url for redirection after successful authentication
                    req.session.reqUrl = req.originalUrl;
                    //
                    // build query string
                    //
                    let query = '';
                    for ( var key in req.query ) {
                        if ( query.length === 0 ) {
                            query += '?';
                        } else {
                            query += '&';
                        }
                        query += key + '=' + req.query[ key ];
                    }
                    //
                    // redirect to login
                    //
                    res.redirect('/login' + query);
                }
            }
        }
    }
}
