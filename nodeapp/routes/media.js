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
        var creator     = req.query.creator;
        var filter      = req.query.filter;
        var type        = req.query.type;
        var urlonly     = req.query.urlonly;
        var offset      = req.query.offset ? parseInt(req.query.offset) : undefined;
        var limit       = req.query.limit ? parseInt(req.query.limit) : undefined;
        //
        // build conditions
        //
        var conditions = [];
        //
        // group
        //
        conditions.push( { group: req.session.group || 'public' } );
        //
        // specific user
        //
        if ( creator ) {
            conditions.push({ creatorid: creator });
        }
        //
        // specific type
        //
        if ( type ) {
            conditions.push({ type: type});
        }
        //
        // text filter
        //
        if ( filter ) {
            var test = new RegExp(filter,'i');
            conditions.push({ $or: [ { name: { $regex: test } }, { creator: { $regex: test } }, { tags: { $regex: test } } ] });
        }
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
        // projection
        //
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
                    requestorid: req.user ? req.user._id : "anon",
                    creatorid: entry.creatorid,
                    creator: entry.creator,
                    tags: entry.tags,
                    url: 'media/' + entry._id,
                    thumbnail: 'media/' + entry._id + '?thumbnail=true',
                    candelete: req.user && entry.creatorid && req.user._id.toString() === entry.creatorid.toString(),
                    canflag: req.user && entry.creatorid && req.user._id.toString() !== entry.creatorid.toString(),
                    tablename: 'media'
                });
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
        let _id = db.ObjectId(req.params.id);
        db.findOne( 'media', { _id: _id } ).then( function(media) {
            let path = media.flagged ? './static/images/flagged.png' : './media/' + media.path;
            if ( fs.existsSync(path) ) {
                try {
                    if (!res.getHeader('Cache-Control')) res.setHeader('Cache-Control', 'public, max-age=' + ( 60 * 15 ) );
                    if ( req.query.thumbnail ) {
                        let transform = sharp().resize(256, 256).max();
                        transform.on('error', function( error ) {
                            console.log('media transform error : ' + req.params.id + ' : ' + err);
                        });
                        fs.createReadStream(path).pipe(transform).pipe(res);
                    } else {
                        fs.createReadStream(path).pipe(res);
                    }
                } catch( error ) {
                    res.status(500).send('Invalid image format');
                }
            } else {
                console.log( 'Media.get : unable to find file : ' + path);
                //res.status(404).send('Not Found');
                fs.createReadStream('./static/images/deleted.png').pipe(res);
            }
        }).catch( function( error ) {
            console.log( 'Media.get : unable to find media : ' + req.params.id);
            //res.status(404).send('Not Found');
            fs.createReadStream('./static/images/deleted.png').pipe(res);
        });
    }); 
    //
    //
    //
    router.post('/', authentication, function (req, res) { // new media entry
        var media       = req.body;
        media.creatorid = req.user._id;
        media.creator   = req.user.username;
        media.created   = Date.now();
        media.modified  = media.created;
        media.group     = req.session.group || 'public';
        console.log( 'media.post : saving new media to group : ' + media.group );
        db.insert( 'media',  media ).then( function( response ) {
            res.json({ status: 'OK', data: { _id: response._id, name: media.name } });
        }).catch( function( error ) {
            res.json({ status: 'ERROR', error: error});
        });
    }); 
    //
    //
    //
    router.delete('/:id', authentication, function (req, res) { // delete media entry
        var query = {
            _id: db.ObjectId(req.params.id),
            creatorid: req.user._id
        };
        db.remove('media', query).then( function( response ) {
            res.json({ status: 'OK', data: response });
        }).catch( function( error ) {
            res.json({ status: 'ERROR', error: error});
        });
    });
    /* NOTE: media now immutable
    router.put('/:id', authentication, function (req, res) { // update media entry
        var _id         = db.ObjectId(req.params.id);
        var level       = req.body;
        level.creatorid = req.user._id;
        level.creator   = req.user.username;
        level.modified  = Date.now();
        db.updateOne( 'levels',  { _id:_id }, { $set : level } ).then( function( response ) {
            res.json({ status: 'OK', data: { _id:_id, name: level.name } });
        }).catch( function( error ) {
            res.json({ status: 'ERROR', error: error});
        });
    });  
    */
    //
    //
    //
    return router;
}