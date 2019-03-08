/* eslint-env node, mongodb, es6 */
/* eslint-disable no-console */
var express = require('express')
var router = express.Router()
var Strategy = require('passport-facebook').Strategy;

module.exports = function( passport, config, db ) {
    //
    // configure strategy
    //
    function authenticate( accessToken, refreshToken, profile, callback) {
        let email = ( profile.emails ? profile.emails[ 0 ].value : undefined );
        if ( email === undefined ) {
            console.log( 'facebook : authenticate : no emails returned : ' + JSON.stringify(profile) );
            callback( new Error('facebook : authenticate : no emails returned : ' + JSON.stringify(profile) ) );
        } else {
            db.findOne('users', { $or : [ { facebookId: profile.id }, { email: email } ] } ).then( function(user) {
                if (!user) {
                    db.insert('users', { facebookId: profile.id, username: profile.displayName, email: email, groups: ["public"] } ).then( function(response) {
                        authenticate( accessToken, refreshToken, profile, callback );
                    }).catch( function( error ) {
                        callback(error);
                    });
                } else {
                    callback(null, user);
                }
            }).catch( function(error) {
                callback(error);
            });
        }
    }
    //
    //
    //
    console.log( 'initialising passport facebook strategy' );
    passport.use(new Strategy( {
            clientID: config.facebook.appId,
            clientSecret: config.facebook.appSecret,
            callbackURL: config.facebook.callbackUrl,
            profileFields:['id','displayName','emails'],
            display: 'page'
        }, authenticate )
    );    
    //
    // routes
    //
    console.log( 'setting facebook routes' );
    router.get('/login', passport.authenticate('facebook', {scope:"email"}) );
    //router.get('/callback', passport.authenticate('facebook', { successRedirect: '/', failureRedirect: '/login' }));
    router.get('/callback', passport.authenticate('facebook', { failureRedirect: '/login'  } ),
               function (req, res) {
                    var redirectTo = '/'; // Set default redirect value
                    if (req.session.reqUrl) {
                        redirectTo = req.session.reqUrl; // If our redirect value exists in the session, use that.
                        delete req.session.reqUrl; // Once we've used it, dump the value to null before the redirect.
                    }
                    console.log( 'facebook callback : redirecting to : ' + redirectTo );
                    res.redirect(redirectTo);
                }
              );
    //
    //
    //
    return router;
}