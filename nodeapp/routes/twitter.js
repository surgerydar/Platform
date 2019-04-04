/* eslint-env node, mongodb, es6 */
/* eslint-disable no-console */
var express = require('express')
var router = express.Router()
var Strategy = require('passport-twitter').Strategy;

module.exports = function( passport, config, db ) {
    //
    // configure strategy
    //
    function authenticate( token, tokenSecret, profile, callback) {
        let email = ( profile.emails ? profile.emails[ 0 ].value : undefined );
        if ( email === undefined ) {
            console.log( 'twitter : authenticate : no emails returned : ' + JSON.stringify(profile) );
            callback( new Error('twitter : authenticate : no emails returned : ' + JSON.stringify(profile) ) );
        } else {
            db.findOne('users', { $or : [ { twitterId: profile.id }, { email: email } ] } ).then( function(user) {
                if (!user) {
                    let newUser = {
                        twitterId: profile.id, 
                        username: profile.displayName, 
                        email: profile.emails[0].value, 
                        groups: ["public"],  
                        role: "creator"
                    };
                    db.insert('users', newUser ).then( function() {
                        authenticate( token, tokenSecret, profile, callback );
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
    console.log( 'initialising passport twitter strategy' );
    passport.use(new Strategy( {
            consumerKey: config.twitter.appId,
            consumerSecret: config.twitter.appSecret,
            callbackURL: config.twitter.callbackUrl,
            includeEmail:true
        }, authenticate )                    
    );    
    //
    // routes
    //
    console.log( 'setting twitter routes' );
    router.get('/login', passport.authenticate('twitter', {scope:['include_email=true']}) );
    router.get('/callback', passport.authenticate('twitter', { failureRedirect: '/login' }),
               function (req, res) {
                    var redirectTo = '/'; // Set default redirect value
                    if (req.session.reqUrl) {
                        redirectTo = req.session.reqUrl; // if our redirect value exists in the session, use that.
                        delete req.session.reqUrl; // once we've used it, dump the value to null before the redirect.
                    }
                    console.log( 'twitter callback : redirecting to : ' + redirectTo );
                    res.redirect(redirectTo);
                }
              );
    //
    //
    //
    return router;
}