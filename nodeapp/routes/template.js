var express = require('express')
var router = express.Router()


module.exports = function() {
    //
    // routes
    //
    console.log( 'setting template routes' );
    router.get('/:name', function (req, res) {
        res.render(req.params.name);
    });
    //
    //
    //
    return router;
}