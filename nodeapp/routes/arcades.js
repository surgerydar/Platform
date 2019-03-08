/* eslint-env node, mongodb, es6 */
/* eslint-disable no-console */
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
        //
        // TODO: merge this with levels.js version
        //
        let conditions = []
        let order = { modified: -1 };
        //
        // group
        //
        conditions.push( { group: req.session.group || 'public' } );
        //
        // filter
        //
        if ( filter ) {
            var test = new RegExp(filter,'i');
            conditions.push( { $or: [ { name: { $regex: test } }, { creator: { $regex: test } }, { tags: { $regex: test } } ] } );
        }
        //
        // arcade specifics
        //
        switch ( name ) {
            case 'toppicks' :
                conditions.push( { toppick: true } );  
                break;
            case 'mostplayed' :
                order = { played: -1, modified: -1 };
                break;
            case 'highestrated' : // special case 
                conditions.push( { rating: {$gt:0} } ); 
                order = { rating: -1, modified: -1 };
                break;
        }
        //
        //
        //
        console.log( 'arcades / finding levels : ' + JSON.stringify(conditions) );
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
        //
        //
        db.find( 'levels', query, { thumbnail: 0 }, order, offset, limit ).then( function(levels) {
            for ( var i = 0; i < levels.length; i++ ) {
                levels[ i ].candelete = req.user && levels[ i ].creatorid && req.user._id.toString() === levels[ i ].creatorid.toString();
                levels[ i ].canflag = req.user && levels[ i ].creatorid && req.user._id.toString() !== levels[ i ].creatorid.toString();
                levels[ i ].tablename = 'levels';
                levels[ i ].thumbnail = '/levels/thumbnail/' + levels[ i ]._id;
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