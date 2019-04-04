/* eslint-env node, mongodb, es6 */
/* eslint-disable no-console */
var express = require('express')
var router  = express.Router()

module.exports = function( authentication, db ) {
    //
    //
    //
    function validateGroup() {
        return function( req, res, next ) {
            //
            // check for valid group
            //
            console.log( 'group.validateGroup' );
            db.findOne('groups',{name:req.params.group} ).then( function( response ) {
                if ( response ) {
                    //
                    // check for membership of valid group
                    //
                    if (req.user && ( req.user.groups.indexOf('system') >= 0 || req.user.groups.indexOf(req.params.group) >= 0 ) ) {
                        req.session.group = req.params.group;
                        next();
                    } else {
                        console.log( 'group.validateGroup : Unauthorized - not registered with this group' );
                        res.status(403).render('static', { content:'Unauthorized - not registered with this group'});
                    }
                } else {
                    console.log( 'group.validateGroup : Unauthorized - unknown group' );
                    res.status(403).render('static', { content:'Unauthorized - unknown group'});    
                }
            }).catch( function( error ) {
                console.log( 'group.validateGroup : Unauthorized - unknown group : ' + error );
                res.status(403).render('static', { content:'Unauthorized - invalid group'});
            });
        };
    }
    //
    //
    //
    console.log( 'setting group routes' );
    router.get( '/', authentication, function (req, res) {
        //
        // list users groups
        //
        res.render('groups', { user: req.user } );
    }); 
    router.get( '/:group', authentication, validateGroup(), function (req, res) {
        console.log( '/group : redirecting to / : session : ' + JSON.stringify(req.session) );
        res.redirect('/');
    }); 
    //
    //
    //
    router.get( '/join/:groupid', function (req, res) {
        //
        // find group
        //
        let groupid = db.ObjectId(req.params.groupid);
        db.findOne('groups', {_id: groupid } ).then( function( group ) {
            //
            // find pending invite
            //
            db.findOne( 'invites', { group: group.name, email: req.query.email } ).then( function( invite ) {
                //
                // accept invite
                //
                db.updateOne( 'invites', { _id: invite._id }, { $set: { accepted: true } } ).then( function() {
                    //
                    // check for existing user
                    //
                    db.findOne( 'users', { email: req.query.email } ).then( function(user) {
                        if ( user ) {
                            let query = '?email=' + user.email + '&istwitter=' + user.hasOwnProperty('twitterId') + '&isfacebook=' + user.hasOwnProperty('facebookId');
                            if ( user.groups.indexOf( group.name ) >= 0 ) {
                                if ( req.user ) {
                                    //
                                    // end current session if users dont match 
                                    //
                                    if ( req.user._id !== user._id ) {
                                        req.logout();
                                        delete req.session.group;
                                    }
                                }
                                //
                                // redirect to initialise group session
                                //
                                res.redirect('/group/' + group.name + query );    
                            } else {
                                //
                                // add group to user's groups
                                //
                                db.updateOne( 'users', { _id: user._id }, { $push: { groups: group.name } } ).then( function() {
                                    res.redirect('/group/' + group.name + query ); 
                                }).catch( function( error ) {
                                    res.status(500).render('static', { content:'<h1>error joining group : ' + error + '</h1>'} );    
                                });
                            }
                        } else {
                            //
                            // render register
                            //
                            res.render('register', { group: group, email: req.query.email } );
                        }
                    }).catch( function(error) {
                        res.status(500).render('static', { content:'<h1>error accepting invite : ' + error + '</h1>'} );    
                    });
                });
            }).catch( function() {
                res.status(500).render('static', { content:'<h1>invite has expired or is invalid</h1>'} );    
            });
        }).catch( function() {
            res.status(500).render('static', { content:'<h1>invalid group</h1>'} );    
        });
    }); 
    //
    //
    //
    /*
    router.get( '/:group', authentication, validateGroup(), function (req, res) {
    }); 
    */
    //
    //
    //
    return router;
}