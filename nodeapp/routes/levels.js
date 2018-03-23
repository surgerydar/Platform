var express = require('express')
var router = express.Router()

module.exports = function( authentication, db ) {
    //
    // levels routes
    //
    console.log( 'setting levels routes' );
    router.get( '/:id', function (req, res) {
        let _id = db.ObjectId(req.params.id);
        db.findOne( 'levels', {_id:_id} ).then( function(level) {
            res.json( { status: 'OK', level: level} );
        }).catch( function( error ) {
            res.json({ status: 'ERROR', error: error});
        });
    }); 
    router.post('/', authentication, function (req, res) { // new level
        var level       = req.body;
        level.creator   = req.user._id;
        level.created   = Date.now();
        db.insert( 'levels',  level ).then( function( response ) {
            res.json({ status: 'OK', response: response, level: level });
        }).catch( function( error ) {
            res.json({ status: 'ERROR', error: error});
        });
    });    
    router.put('/', authentication, function (req, res) { // update level
        var level       = req.body;
        level.modified  = Date.now();
        let _id = db.ObjectId(level._id);
        level._id = undefined;
        db.updateOne( 'levels',  { _id:_id }, { $set : level } ).then( function( response ) {
            res.json({ status: 'OK', response: response, level: level });
        }).catch( function( error ) {
            res.json({ status: 'ERROR', error: error});
        });
    });    
    return router;
}