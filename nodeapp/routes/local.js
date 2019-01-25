var express = require('express')
var router = express.Router()
var Strategy = require('passport-local').Strategy
var bcrypt = require('bcryptjs')


module.exports = function( passport, config, db ) {
    //
    //
    //
    function createHash( text ) {
        return bcrypt.hashSync( text, 10);
    }
    
    //
    // configure strategy
    //
    function authenticate( req, username, password, done ) {
        console.log( 'login user : ' + username );
        db.findOne('users', { $or : [ { username: username }, { email: username } ] } ).then( function(user) {
            if (!user) {
                console.log( 'login user : invalid username : ' + username );
                done(null, false, { message: 'unknown user or email' });
            } else {
                //
                // decrypt password
                //
                if ( bcrypt.compareSync( password, user.password ) ) {
                    //
                    // remove password
                    //
                    console.log( 'login user : logged in : ' + username );
                    done(null, {_id: user._id, username: user.username});
                } else {
                    console.log( 'login user : invalid password : ' + password );
                    done(null, false, { message: 'password is incorrect' });  
                }
            }
        }).catch( function(error) {
            console.log( 'login user : error finding user : ' + error );
            done(error);
        });
    }
    //
    //
    //
    function register( req, username, password, done ) {
        console.log( 'registering user : ' + username );
        var user = {
            username: req.body.username,
            email: req.body.email.toLowerCase(),
            password: createHash(req.body.password)
        };
        db.findOne('users', { $or : [ { username: user.username }, { email: user.email } ] } ).then( function(response) {
            if ( response ) {
                console.log( 'registering user : error : ' + user.username + ' : already exists');
                //res.render('register', {error: 'username or email already registered'} );
                done(null, false, { message: 'username or email already registered' });
            } else {
                console.log( 'registering user :  adding user : ' + user.username );
                db.insert( 'users', user ).then( function(response) {
                    console.log( 'registering user :  added user : ' + user.username );
                    //res.redirect('/');
                    done(null, {_id: response.insertedId, username: user.username});
                }).catch( function( error ) {
                    console.log( 'registering user :  error adding to database : ' + error );
                    //res.render('register', {error: 'server error : ' + error.toString() } );
                    done(error, false, { message: 'server error : ' + error });
                });
            }
        }).catch( function( error ) {
            console.log( 'registering user :  error searching database : ' + error );
            //res.render('register', {error: 'server error : ' + error.toString() } );
            done(error, false, { message: 'server error : ' + error });
        });
    }
    //
    //
    //
    console.log( 'initialising passport local strategy' );
    passport.use('local-login', new Strategy( { passReqToCallback : true }, authenticate));    
    passport.use('local-register', new Strategy( { passReqToCallback : true }, register));    
    //
    // routes
    //
    console.log( 'setting pasport local routes' );
    //router.post('/login', passport.authenticate('local-login', {} ));
    router.post('/login', function(req, res, next) {
        passport.authenticate('local-login', function(error, user, info) {
            if ( info ) {
                console.log( 'login error : ' + JSON.stringify( info ) );
            }
            if (error) { 
                res.render('login',{error:info?info.message:error,username:req.body.username});
            } else {
                if (!user) { 
                    res.render('login',{error:info?info.message:'unknown user',username:req.body.username});
                } else {
                    req.login(user, function(error) {
                        if (error) { 
                            res.render('login',{error:error,username:req.body.username});
                        } else {
                            var redirectTo = '/'; // Set default redirect value
                            if (req.session.reqUrl) {
                                redirectTo = req.session.reqUrl; // if our redirect value exists in the session, use that.
                                delete req.session.reqUrl; // once we've used it, dump the value to null before the redirect.
                            }
                            console.log( 'login callback : redirecting to : ' + redirectTo );
                            res.redirect(redirectTo);
                        }
                    });
                }
            }
        })(req, res, next);
    });
    //
    // register
    //
    router.get('/register', function (req, res) {
        res.render('register',{authorised: req.user});
    });
    router.post('/register', function( req, res, next ) {
        passport.authenticate('local-register', function(error, user, info) {
            if ( info ) {
                console.log( 'register error : ' + JSON.stringify( info ) );
            }
            if (error) { 
                //res.render('register',{error:error,username:req.body.username});
                res.render('register',{error:info?info.message:error,username:req.body.username,email:req.body.email});
            } else {
                if (!user) { 
                    res.render('register',{error:info?info.message:'registration error',username:req.body.username,email:req.body.email});
                } else {
                    req.login(user, function(error) {
                        if (error) { 
                            res.render('register',{error:error,username:req.body.username});
                        } else {
                            var redirectTo = '/'; // Set default redirect value
                            if (req.session.reqUrl) {
                                redirectTo = req.session.reqUrl; // if our redirect value exists in the session, use that.
                                delete req.session.reqUrl; // once we've used it, dump the value to null before the redirect.
                            }
                            console.log( 'login callback : redirecting to : ' + redirectTo );
                            res.redirect(redirectTo);
                        }
                    });
                }
            }
        })(req, res, next);
    });
    //
    //
    //
    return router;
}