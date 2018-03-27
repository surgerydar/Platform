var express = require('express')
var router  = express.Router()
var fs      = require('fs');
var sharp   = require('sharp');

module.exports = function( authentication, db ) {
    //
    //
    //
    console.log( 'setting media routes')
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
        db.find( 'media', query, projection, {created: -1}, offset, limit ).then( function(media) {
            var rows = [];
            media.forEach( function(entry) {
                rows.push({
                    _id: entry._id,
                    name: entry.name,
                    creator: entry.creator,
                    tags: entry.tags,
                    url: 'media/' + entry._id,
                    thumbnail: 'media/' + entry._id + '?thumbnail=true'
                })
            });
            if ( listview ) {
                db.count( 'media', query ).then(function(count) {
                    res.json({ status: 'OK', data: {
                        pagecount: limit ? Math.ceil( count / limit ) : 1,
                        pagenumber: limit ? Math.floor( offset / limit ) : 1,
                        rows: rows
                    }});
                }).catch( function( error ) {
                    res.json({ status: 'ERROR', error: error});
                });
            } else {
                res.json({ status: 'OK', data: rows});
            }
        }).catch( function( error ) {
            res.json({ status: 'ERROR', error: error});
        });
    }); 
    //
    //
    //
    router.get( '/:id', function (req, res) {
        let _id = db.ObjectId(req.params.id)
        db.findOne( 'media', { _id: _id } ).then( function(media) {
            let path = './static/media/' + media.path;
            if ( req.query.thumbnail ) {
				let transform = sharp().resize(256, 256).max();
				fs.createReadStream(path).pipe(transform).pipe(res);
            } else {
				fs.createReadStream(path).pipe(res);
            }
        }).catch( function( error ) {
            res.status(404).send('Not Found');
        });
    }); 
    
    return router;
}