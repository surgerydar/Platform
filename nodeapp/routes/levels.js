/* eslint-env node, mongodb, es6 */
/* eslint-disable no-console */
var express = require('express')
var router = express.Router()

module.exports = function( authentication, db ) {
    //
    // levels routes
    //
    console.log( 'setting levels routes' );
    router.get( '/thumbnail/:id', function(req, res) {
        try {
            let _id = db.ObjectId(req.params.id);
            db.findOne( 'levels', {_id:_id}, {thumbnail:1} ).then( function(level) {
                if ( level.thumbnail && level.thumbnail.length > 0 ) {
                    var base64 = level.thumbnail.replace(/^data:image\/png;base64,/, '');
                    var image = Buffer.from( base64, 'base64' );
                    res.writeHead(200, {
                         'Content-Type': 'image/png',
                         'Content-Length': image.length
                    });
                    res.end(image);
                } else {
                    res.redirect('/images/deleted.png');
                }
            }).catch( function( error ) {
                console.log('/levels/thumbnal/' + req.params.id + ' : error : ' + error );
                res.redirect('/images/deleted.png');
            });
        } catch( error ) {
            console.log('/levels/thumbnal/' + req.params.id + ' : error : ' + error );
            res.redirect('/images/deleted.png');
        }
    });
    //
    //
    //
    router.get( '/', function (req, res) {
        var listview    = req.query.listview || false;
        var creator     = req.query.creator;
        var filter      = req.query.filter;
        var offset      = req.query.offset ? parseInt(req.query.offset) : undefined;
        var limit       = req.query.limit ? parseInt(req.query.limit) : undefined;
        //
        // build conditions
        //
        var conditions = [];
        //
        // group
        //
        conditions.push( { group: req.session.group || 'public' } );
        //
        // public / private
        //
        if ( req.user ) {
            conditions.push({ $or: [ { creatorid: req.user._id }, { published: true } ] });
        } else {
            conditions.push({ published: true });
        }
        //
        // specific user
        //
        if ( creator ) {
            conditions.push({ creatorid: creator });
        }
        //
        // text filter
        //
        if ( filter ) {
            var test = new RegExp(filter,'i');
            conditions.push({ $or: [ { name: { $regex: test } }, { creator: { $regex: test } }, { tags: { $regex: test } } ] });
        }
        //
        //
        //
        console.log( 'levels / finding levels : ' + JSON.stringify(conditions) );
        //
        // build query
        //
        var query = {};
        if ( conditions.length === 1 ) {
            query = conditions[ 0 ];
        } else if ( conditions.length > 1 ) {
            query = { $and: conditions };
        }
        //
        // build projection
        //
        var projection = {};
        //
        //
        //
        db.find( 'levels', query, projection, {thumbnail: 0}, offset, limit ).then( function(levels) {
            for ( var i = 0; i < levels.length; i++ ) {
                levels[ i ].candelete = req.user && levels[ i ].creatorid && req.user._id.toString() === levels[ i ].creatorid.toString();
                levels[ i ].canflag = req.user && levels[ i ].creatorid && req.user._id.toString() !== levels[ i ].creatorid.toString();
                levels[ i ].tablename = 'levels';
                levels[ i ].thumbnail = '/levels/thumbnail/' + levels[ i ]._id;
            }
            if ( listview ) {
                db.count( 'levels', query ).then(function(count) {
                    res.json({ status: 'OK', data: {
                        pagecount: limit ? Math.ceil( count / limit ) : 1,
                        pagenumber: limit && offset ? Math.floor( offset / limit ) : 0,
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
        level.group     = req.session.group || 'public';
        db.insert( 'levels',  level ).then( function( response ) {
            res.json({ status: 'OK', data: { _id: response.insertedId, name: level.name }, message: 'Saved level \'' + level.name + '\'' });
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
        level.group     = req.session.group || 'public';
        db.findOne( 'levels', { _id:_id }, { creatorid:1 } ).then( function( existing ) {
            if ( level.creatorid.equals(existing.creatorid)  ) {
                db.updateOne( 'levels',  { _id:_id }, { $set : level } ).then( function( response ) {
                    res.json({ status: 'OK', data: { _id:_id, name: level.name }, message: 'Updated level \'' + level.name + '\'' });
                }).catch( function( error ) {
                    res.json({ status: 'ERROR', error: error});
                });
            } else {
                console.log( 'levels.put : new creator for level : ' + level.name + ' : previous : ' + existing.creatorid + ' : new : ' + level.creatorid );
                level.name += ' copy';
                db.insert( 'levels',  level ).then( function( response ) {
                    res.json({ status: 'OK', data: { _id: response.insertedId, name: level.name }, message: 'Saved a copy of level \'' + level.name + '\'' });
                }).catch( function( error ) {
                    res.json({ status: 'ERROR', error: error});
                });
           }
        }).catch( function( error ) {
            res.json({ status: 'ERROR', error: error});
        });
    });    
    //
    //
    //
    router.delete('/:id', authentication, function (req, res) { // delete level
        //
        // only creator is authorised to delete
        //
        var query = {
            _id: db.ObjectId(req.params.id),
            creatorid: req.user._id
        };
        db.remove('levels', query).then( function( response ) {
            res.json({ status: 'OK', data: response });
        }).catch( function( error ) {
            res.json({ status: 'ERROR', error: error});
        });
    });
    return router;
}