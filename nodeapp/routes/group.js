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
    router.get( '/:group', authentication, validateGroup(), function (req, res) {
        console.log( '/group : redirecting to / : session : ' + JSON.stringify(req.session) );
        res.redirect('/');
    }); 
    //
    //
    //
    return router;
}