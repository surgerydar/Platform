var express = require('express')
var router = express.Router()

module.exports = function( authentication, db ) {
    //
    // rating routes
    //
    console.log( 'setting rating routes' );
    
    router.get( '/:category/:collection/:targetid', function (req, res) {
        let query = {
            category: req.params.category,
            collection: req.params.collection,
            targetid: req.params.targetid
        };
        db.findOne( 'ratings', query ).then( function(rating) {
            res.json( { status: 'OK', data: rating } );
        }).catch( function( error ) {
            res.json({ status: 'ERROR', error: error});
        });
    } ); 
    
    router.put('/:category/:collection/:targetid', authentication, function (req, res) { // update user
        let rating = req.body;
        let query = {
            category: req.params.category,
            collection: req.params.collection,
            targetid: req.params.targetid
        };
        db.findAndModify( 'ratings', query, {}, { $set: { score: rating.score } }, { upsert: true } ).then( function( response ) {
            res.json({ status: 'OK' });
        }).catch( function( error ) {
            res.json({ status: 'ERROR', error: error});
        });
    });   
    
    return router;
}