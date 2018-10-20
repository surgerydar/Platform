var express = require('express')
var router = express.Router()

module.exports = function( authentication, db ) {
    //
    // levels routes
    //
    console.log( 'setting levels routes' );
    router.get( '/', function (req, res) {
        var listview    = req.query.listview || false;
        var creator     = req.query.creator;
        var filter      = req.query.filter;
        var offset      = req.query.offset ? parseInt(req.query.offset) : undefined;
        var limit       = req.query.limit ? parseInt(req.query.limit) : undefined;
        
        var query = {};
        if ( creator ) {
            query = { creatorid: creator };
        }
        if ( filter ) {
            var test = new RegExp(filter,'i');
            var condition = { $or: [ { name: { $regex: test } }, { creator: { $regex: test } }, { tags: { $regex: test } } ] };
            if ( query.creatorid ) {
                query = { $and: [ query, condition ] };
            } else {
                query = condition;
            }
        }
        var projection = {};
        db.find( 'levels', query, projection, {created: -1}, offset, limit ).then( function(levels) {
            if ( listview ) {
                db.count( 'levels', query ).then(function(count) {
                    res.json({ status: 'OK', data: {
                        pagecount: limit ? Math.ceil( count / limit ) : 1,
                        pagenumber: limit ? Math.floor( offset / limit ) : 1,
                        rows: levels
                    }});
                }).catch( function( error ) {
                    res.json({ status: 'ERROR', error: error});
                });
            } else {
                res.json({ status: 'OK', data: levels});
            }
        }).catch( function( error ) {
            res.json({ status: 'ERROR', error: error});
        });
    }); 
    router.get( '/:id', function (req, res) {
        let _id = db.ObjectId(req.params.id);
        db.findOne( 'levels', {_id:_id} ).then( function(level) {
            res.json( { status: 'OK', data: level} );
        }).catch( function( error ) {
            res.json({ status: 'ERROR', error: error});
        });
    }); 
    router.post('/', authentication, function (req, res) { // new level
        var level       = req.body;
        level.creatorid = req.user._id;
        level.creator   = req.user.username;
        level.created   = Date.now();
        level.modified  = level.created;
        db.insert( 'levels',  level ).then( function( response ) {
            res.json({ status: 'OK', data: { _id: response._id, name: level.name } });
        }).catch( function( error ) {
            res.json({ status: 'ERROR', error: error});
        });
    });    
    router.put('/:id', authentication, function (req, res) { // update level
        var _id         = db.ObjectId(req.params.id);
        var level       = req.body;
        level.creatorid = req.user._id;
        level.creator   = req.user.username;
        level.modified  = Date.now();
        db.updateOne( 'levels',  { _id:_id }, { $set : level } ).then( function( response ) {
            res.json({ status: 'OK', data: { _id:_id, name: level.name } });
        }).catch( function( error ) {
            res.json({ status: 'ERROR', error: error});
        });
    });    
    return router;
}