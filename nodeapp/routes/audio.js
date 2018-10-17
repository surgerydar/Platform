var express = require('express')
var router  = express.Router()
var fs      = require('fs');

module.exports = function( authentication, db ) {
    //
    //
    //
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
            query = { $or: [ { name: { $regex: test } }, { creator: { $regex: test } }, { tags: { $regex: test } } ] };
        }
        if ( type ) {
            query = Object.keys(query).length > 0 ? { $and: [ { type: type }, query ] } : { type: type };  
        }
        var projection = {};
        if ( urlonly ) {
            projection = { path: 1 };
        }
        db.find( 'audio', query, projection, {created: -1}, offset, limit ).then( function(audio) {
            if ( listview ) {
                db.count( 'media', query ).then(function(count) {
                    res.json({ status: 'OK', data: {
                        pagecount: limit ? Math.ceil( count / limit ) : 1,
                        pagenumber: limit ? Math.floor( offset / limit ) : 1,
                        rows: audio
                    }});
                }).catch( function( error ) {
                    res.json({ status: 'ERROR', error: error});
                });
            } else {
                res.json({ status: 'OK', data: audio});
            }
        }).catch( function( error ) {
            res.json({ status: 'ERROR', error: error});
        });
    }); 
    //
    //
    //
    router.get( '/:id', function (req, res) {
        try {
            let _id = db.ObjectId(req.params.id)
            db.findOne( 'audio', { _id: _id } ).then( function(audio) {
                res.json({ status: 'OK', data: audio});
            }).catch( function( error ) {
                res.json({ status: 'ERROR', error: error});
            });
        } catch( error ) {
            let path = './static/audio/' + req.params.id;
            if ( fs.existsSync(path) ) {
                fs.createReadStream(path).pipe(res);
            } else {
                res.status(404).send('Not Found');
            }
        }
    }); 
    
    return router;
}