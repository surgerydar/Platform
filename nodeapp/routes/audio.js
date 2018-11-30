var express = require('express')
var router  = express.Router()
var fs      = require('fs');
var request = require('request');

module.exports = function( authentication, db ) {
    //
    //
    //
    console.log( 'setting audio routes' );
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
                db.count( 'audio', query ).then(function(count) {
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
    router.get( '/install', function (req, res) {
        try {
            let audioPath = './static/audio/';
            fs.readdir(testFolder, (err, files) => {
              files.forEach(file => {
                  if ( file.endsWith('.mp3') ) {
                      
                  }
              });
            });
        } catch( error ) {
            res.json({ status: 'ERROR', error: error});
        }
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
    //
    //
    //
    router.get( '/search/:term', function (req, res) {
        try {
            let url = 'https://freesound.org/apiv2/search/text/?token=kKVkzONrJQCpynFL6SPM7UnRVC9tjeQ9r5915UV9&filter=type:(wav%20OR%20mp3)&fields=name,username,tags,download,type,previews&query=' + req.params.term;
            request.get(url).pipe(res);
        } catch( error ) {
            res.status(500).send('Error : ' + error );
        }
    }); 
    //
    //
    //
    
    //
    //
    //
    return router;
}