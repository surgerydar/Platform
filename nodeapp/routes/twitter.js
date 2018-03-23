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
                    db.insert('users', { twitterId: profile.id, username: profile.displayName, email: profile.emails[0].value } ).then( function(response) {
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
    router.get('/callback', passport.authenticate('twitter', { successRedirect: '/', failureRedirect: '/login' }));
    //
    //
    //
    return router;
}