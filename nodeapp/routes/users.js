var express = require('express')
var router = express.Router()

module.exports = function( authentication, db ) {
    //
    // levels routes
    //
    console.log( 'setting users routes' );
    router.get( '/', function (req, res) {
        var listview    = req.query.listview || false;
        var filter      = req.query.filter;
        var type        = req.query.type;
        var urlonly     = req.query.urlonly;
        var offset      = req.query.offset ? parseInt(req.query.offset) : undefined;
        var limit       = req.query.limit ? parseInt(req.query.limit) : undefined;
        
        var query = {};
        if ( filter ) {
            var test = new RegExp(filter,'i');
            query = { $or: [ { username: { $regex: test } }, { tags: { $regex: test } } ] };
        }
        db.find( 'users', query, { password: 0 }, { username: 1 }, offset, limit ).then( function(users) {
            if ( listview ) {
                db.count( 'users', query ).then(function(count) {
                    res.json({ status: 'OK', data: {
                        pagecount: limit ? Math.ceil( count / limit ) : 1,
                        pagenumber: limit ? Math.floor( offset / limit ) : 1,
                        rows: users
                    }});
                }).catch( function( error ) {
                    res.json({ status: 'ERROR', error: error});
                });
            } else {
                res.json({ status: 'OK', data: users});
            }
        }).catch( function( error ) {
            res.json({ status: 'ERROR', error: error});
        });
    }); 
    router.get( '/:id', function (req, res) {
        let _id = db.ObjectId(req.params.id);
        //
        // dynamic arcade
        //
        db.findOne( 'users', {_id:_id} ).then( function(user) {
            res.json( { status: 'OK', data: user} );
        }).catch( function( error ) {
            res.json({ status: 'ERROR', error: error});
        });
    }); 
    /* TODO: **platform** new users created through social login so should never be called
    router.post('/', authentication, function (req, res) { // new user
        var level       = req.body;
        level.creator   = req.user._id;
        level.created   = Date.now();
        db.insert( 'users',  level ).then( function( response ) {
            res.json({ status: 'OK', response: response, level: level });
        }).catch( function( error ) {
            res.json({ status: 'ERROR', error: error});
        });
    });    
    */
    // TODO: **platform** sould perhaps be /:id
    router.put('/:id', authentication, function (req, res) { // update user
        var user       = req.body;
        user.modified  = Date.now();
        let _id = db.ObjectId(req.params.id);
        user._id = undefined;
        db.updateOne( 'users',  { _id:_id }, { $set : user } ).then( function( response ) {
            res.json({ status: 'OK', data: user });
        }).catch( function( error ) {
            res.json({ status: 'ERROR', error: error});
        });
    });    
    return router;
}