var express = require('express')
var router = express.Router()

module.exports = function( authentication, db ) {
    //
    //
    //
    console.log( 'setting arcade routes' );
    router.get( '/:name', function (req, res) {
        var name    = req.params.name;
        var filter  = req.query.filter;
        var offset  = req.query.offset ? parseInt(req.query.offset) : undefined;
        var limit   = req.query.limit ? parseInt(req.query.limit) : undefined;
        var pagecount = 0;
        var pagenumber = 0;
        //
        // build query
        //
        var query = {};
        if ( filter ) {
            var test = new RegExp(filter,'i');
            query = { $or: [ { name: { $regex: test } }, { creator: { $regex: test } }, { tags: { $regex: test } } ] };
        }
        if ( name === 'toppicks' ) {
            query = Object.keys(query).length > 0 ? { $and: [ { toppick: true }, query ] } : { toppick: true };  
            
        } else if ( !( name === 'all' || name === 'latest' ) ) {
            //
            // TODO: 
            //
        }
        //
        // dynamic arcade
        //
        db.find( 'levels', query, {}, { created: -1 }, offset, limit ).then( function(levels) {
            db.count( 'levels', query ).then( function(count) {
                res.json({ status: 'OK', data: {
                    pagecount: limit ? Math.ceil( count / limit ) : 1,
                    pagenumber: limit ? Math.floor( offset / limit ) : 1,
                    rows: levels
                }});
            }).catch( function( error) {
                res.json({ status: 'ERROR', error: error});
            });
        }).catch( function( error ) {
            res.json({ status: 'ERROR', error: error});
        });
    }); 
    
    return router;
}