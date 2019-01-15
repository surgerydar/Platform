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
        var order = { modified: -1 };
        if ( filter ) {
            var test = new RegExp(filter,'i');
            query = { $or: [ { name: { $regex: test } }, { creator: { $regex: test } }, { tags: { $regex: test } } ] };
        }
        switch ( name ) {
            case 'toppicks' :
                query = Object.keys(query).length > 0 ? { $and: [ { toppick: true }, query ] } : { toppick: true };  
                break;
            case 'mostplayed' :
                order = { played: -1, modified: -1 };
                break;
            case 'highestrated' : // special case 
                query = Object.keys(query).length > 0 ? { $and: [ { rating: {$gt:0} }, query ] } : { rating: {$gt:0} }; 
                order = { rating: -1, modified: -1 };
                break;
        }
        //
        // 
        //
        db.find( 'levels', query, {}, order, offset, limit ).then( function(levels) {
            for ( var i = 0; i < levels.length; i++ ) {
                levels[ i ].candelete = req.user && levels[ i ].creatorid && req.user._id.toString() === levels[ i ].creatorid.toString();
                levels[ i ].canflag = req.user && levels[ i ].creatorid && req.user._id.toString() !== levels[ i ].creatorid.toString();
                levels[ i ].tablename = 'levels';
            }
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