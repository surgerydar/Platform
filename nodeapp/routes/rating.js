var express = require('express')
var router = express.Router()

module.exports = function( authentication, db ) {
    //
    // rating routes
    //
    console.log( 'setting rating routes' );
    
    router.get( '/:collection/:targetid', function (req, res) {
        let collection = req.params.collection;
        let _id = db.ObjectId(req.params.targetid);
        db.findOne( collection, { _id: _id}, {rating: 1,votes: 1} ).then( function( entry ) {
            res.json({ status: 'OK', data: { score: ( entry.rating || 0 ) / ( entry.votes || 1 ) }});
        }).catch( function(error) {
            
        });
    }); 
    
    router.put('/:collection/:targetid', authentication, function (req, res) { // update user
        let rating = req.body;
        let collection = req.params.collection;
        let _id = db.ObjectId(req.params.targetid);
        db.updateOne( collection, {_id:_id}, { $inc: { rating: parseInt(rating.score), votes: 1 } } ).then( function( response ) {
            res.json({ status: 'OK' });
        }).catch( function( error ) {
            res.json({ status: 'ERROR', error: error});
        });
    });   
    
    return router;
}