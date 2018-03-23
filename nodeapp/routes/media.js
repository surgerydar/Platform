var express = require('express')
var router = express.Router()

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
        var test = filter ? new RegExp( filter, 'i' ) : undefined;
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
            if ( listview ) {
                db.count( 'media', query, function(count) {
                    res.json({ status: 'OK', data: {
                        pagecount: limit ? Math.ceil( count / limit ) : 1,
                        pagenumber: limit ? Math.floor( offset / limit ) : 1,
                        rows: levels
                    }});
                });
            } else {
                res.json({ status: 'OK', media: media});
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
            res.redirect(media.path);
        }).catch( function( error ) {
            res.json({ status: 'ERROR', error: error});
        });
    }); 
    
    return router;
}