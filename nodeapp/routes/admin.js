var express = require('express')
var router = express.Router()


module.exports = function( authentication, db ) {
    //
    // utility functions
    //
    function capitalise( word ) {
        return word && word.charAt(0).toUpperCase() + word.slice(1);
    }
    function formatResponse( data, status, message ) {
        var response = {};
        if ( message ) response[ 'message' ] = message;
        if ( status ) response[ 'status' ] = status;
        if ( data ) response[ 'data' ] = data;
        return response;
    }
	/*
    //
    // routes
    //
    console.log( 'setting content routes' );
    router.get('/contents', function (req, res) { // return all documents
         db.find('document', {} ).then( function( documents ) {
             res.json({ status: 'OK', response: documents});
        }).catch( function( error ) {
             res.json({ status: 'ERROR', error: error});
        });
    });
    router.get('/documents/:date/:format', function (req, res) {
        let date = req.params.date > 0 ? req.params.date : Date.now();
        let format = req.params.format;
        let query = { date: { $lt: date } };
        db.find('document', query ).then( function( documents ) {
            if ( format === 'html' ) {
                res.render('documents', {documents:documents}); 
            } else {
                res.json({ status: 'OK', response: documents});
            }
        }).catch( function( error ) {
            if ( format === 'html' ) {
                res.render('error', {title:'AfterTrauma Admin', error: error}); 
            } else {
                res.json({ status: 'ERROR', error: error});
            }
        });
    });
    router.get('/manifest/:date', function (req, res) {
        delta.getManifest( parseInt(req.params.date) ).then( function( response ) {
            res.json({ status: 'OK', response: response});
        }).catch( function( error ) {
            res.json({ status: 'ERROR', error: error});
        });
    });
    //
    //
    //
    console.log( 'setting admin routes' );
    router.get('/', authentication, function (req, res) {
        res.render('admin', {title:'AfterTrauma Admin'});
    });
    router.get('/users', authentication, function (req, res) {
        db.find( 'users', {}, { username: 1 } ).then( function( response ) {
            res.render( 'users', { users: response } );
        }).catch( function( error ) {
            res.render('error', {title:'AfterTrauma Admin', error: error});
        });
    });
    //
    // categories
    //
    router.get('/:section', authentication, function (req, res) { // get section categories
        var section = req.params.section;
        db.find( 'category', { section: section }, { title: 1 } ).then( function( response ) {
            res.render('section', {title:'AfterTrauma > ' + capitalise( section ), section: section, categories: response });
        }).catch( function( error ) {
            //
            // TODO: error
            //
            res.render('error', {title:'AfterTrauma Admin', error: error});
        });

    });
    router.post('/:section', authentication, function (req, res) { // new category
        var section         = req.params.section;
        var category        = req.body;
        category.date       = Date.now();
        category.section    = section;
        db.insert( 'category',  category ).then( function( response ) {
            res.json({ status: 'OK', response: response, category: category });
        }).catch( function( error ) {
            res.json({ status: 'ERROR', error: error});
        });
    });
    router.put('/:section/:category', authentication, function (req, res) { // update category
        var category    = req.body;
        item.date       = Date.now();
        var _id         = db.ObjectId(req.params.category);
        db.updateOne( 'category',  { _id: _id }, category ).then( function( response ) {
            res.json({ status: 'OK', response: response});
        }).catch( function( error ) {
            res.json({ status: 'ERROR', error: error});
        });
    });
    router.delete('/:section/:category', authentication, function (req, res) {
        var _id = db.ObjectId(req.params.category);
        db.remove( 'category', { _id: _id } ).then( function( response ) {
            res.json({ status: 'OK', response: response});
        }).catch( function( error ) {
            res.json({ status: 'ERROR', error: error});
        });

    });
    //
    // category documents
    //
    router.get('/:section/:category', authentication, function (req, res) {
        var section = req.params.section;
        var _id = db.ObjectId(req.params.category);
        db.findOne( 'category', { _id: _id } ).then( function( category ) {
            db.find( 'document', { category: req.params.category } ).then( function( documents ) {
                res.render('category', {title:'AfterTrauma > ' + capitalise( section ) + ' > ' + category.title, section: category.section, category: category._id, documents: documents });
            }).catch( function( error ) {
                //
                // TODO: error
                //
                res.render('error', {title:'AfterTrauma Admin', error: error});
            });
        }).catch( function( error ) {
            res.render('error', {title:'AfterTrauma Admin', error: error});
        });

    });
    router.post('/:section/:category', authentication, function (req, res) { // new document
        var section         = req.params.section;
        var category        = req.params.category;
        var document        = req.body;
        document.date       = Date.now();
        document.category   = category;
        document.blocks     = [];
        db.insert( 'document',  document ).then( function( response ) {
            //
            // record delta
            //
            console.log( 'inserted document : ' + document._id );
            //let idType = typeof document._id;
            //let idValueOf = document._id.valueOf();
            //let idToString = document._id.toString();
            //let idStr = document._id.str;
            //console.log( 'idType=' + idType + ' idValueOf:' + idValueOf + ' idToString:' + idToString + ' idStr:' + idStr );
            delta.addDocument( section, category, document._id.toString(), document.title ).then( function( response ) {
            }).catch( function( error ) {
                console.log( 'delta.addDocument : error : ' + error );
            });
            //
            //
            //
            res.json({ status: 'OK', response: response, document: document });
        }).catch( function( error ) {
            res.json({ status: 'ERROR', error: error});
        });
    });
    
    router.put('/:section/:category/:document', authentication, function (req, res) { // update document
        var _id = db.ObjectId(req.params.document);
        var document        = req.body;
        document.date       = Date.now();
        db.updateOne( 'document',  { _id:_id }, document ).then( function( response ) {
            //
            // record delta
            //
            console.log( 'updated document : ' + req.params.document );
            delta.updateDocument( req.params.section, req.params.category, req.params.document, document.title ).then( function( response ) {
            }).catch( function( error ) {
                console.log( 'delta.updateDocument : error : ' + error );
            });
            //
            //
            //
            res.json({ status: 'OK', response: response, document: document });
        }).catch( function( error ) {
            console.log( 'update document : error : ' + error );
            res.json({ status: 'ERROR', error: error});
        });
    });
    router.delete('/:section/:category/:document', authentication, function (req, res) { // delete document
        var _id = db.ObjectId(req.params.document);
        db.remove( 'document',  { _id:_id } ).then( function( response ) {
            //
            // record delta
            //
            console.log( 'delted document : ' + req.params.document );
            delta.removeDocument( req.params.section, req.params.category, req.params.document ).then( function( response ) {
            }).catch( function( error ) {
                console.log( 'delta.removeDocument : error : ' + error );
            });
            //
            //
            //
            res.json({ status: 'OK', response: response });
        }).catch( function( error ) {
            console.log( 'delete document : error : ' + error );
            res.json({ status: 'ERROR', error: error});
        });
    });
    //
    // doument blocks
    //
    router.get('/:section/:category/:document', authentication, function (req, res) {
        var section     = req.params.section;
        var categoryId  = db.ObjectId(req.params.category);
        var documentId  = db.ObjectId(req.params.document);
        db.findOne('category', { _id: categoryId } ).then( function( category ) {
            db.findOne('document', { _id: documentId } ).then( function( document ) {
                res.render('document', {title:'AfterTrauma > ' + capitalise( section ) + ' > ' + category.title + ' > ' + document.title, section: category.section, document: document } );
            }).catch( function( error ) {
                //
                // TODO: error
                //
                res.render('error', {title:'AfterTrauma Admin', error: error});
            });
        }).catch( function( error ) {
            res.render('error', {title:'AfterTrauma Admin', error: error});
        });
    });
    router.get('/:section/:category/:document/:block', authentication, function (req, res) { // get block
        var section     = req.params.section;
        var categoryId  = req.params.category;
        var documentId  = req.params.document;
        var blockIndex  = parseInt(req.params.block);
        var type        = req.query.type;
        db.findOne('category', { _id: db.ObjectId(categoryId) } ).then( function( category ) {
            db.findOne('document', { _id: db.ObjectId(documentId) } ).then( function( document ) {
                var block = blockIndex >= 0 && blockIndex < document.blocks.length ? document.blocks[ blockIndex ] : {type: type, title:"", content:"", tags:[]};
                res.render('block', {title:'AfterTrauma > ' + capitalise( section ) + ' > ' + category.title + ' > ' + document.title + ' > block ' + blockIndex, section: section, document: document, index: blockIndex, block: block} );
            }).catch( function( error ) {
                //
                // TODO: error
                //
                res.render('error', {title:'AfterTrauma Admin', error: error});
            });
        }).catch( function( error ) {
            res.render('error', {title:'AfterTrauma Admin', error: error});
        });
    });
    
    router.put('/:section/:category/:document/:block', authentication, function (req, res) { // update block
        var section     = req.params.section;
        var category    = req.params.category;
        var document    = db.ObjectId(req.params.document);
        var blockIndex  = parseInt(req.params.block);
        var block       = req.body; 
        var operation;
        if ( blockIndex < 0 ) {
            operation = {
                $push: {
                    blocks : block
                },
                $set: {
                    date : Date.now()
                }
            };
        } else {
            operation = { 
                $set: {
                    date : Date.now()
                } 
            };
            operation[ '$set' ][ 'blocks.' + blockIndex ] = block;
        }
        db.updateOne( 'document',  { _id: document }, operation ).then( function( response ) {
            //
            // record delta
            //
            delta.updateDocument( section, category, req.params.document, undefined ).then( function( response ) {
            }).catch( function( error ) {
                console.log( 'delta.updateDocument : error : ' + error );
            });
            //
            //
            //
            res.json({ status: 'OK', response: response});
        }).catch( function( error ) {
            res.json({ status: 'ERROR', error: error});
        });
    });
    router.delete('/:section/:category/:document/:block', authentication, function (req, res) { // delete block
        var section     = req.params.section;
        var category    = req.params.category;
        var document    = db.ObjectId(req.params.document);
        var blockIndex  = parseInt(req.params.block);
        var operation   = { $unset: { } };
        operation['$unset'][ 'blocks.' + blockIndex ] = null;
        db.updateOne( 'document',  { _id: document }, operation ).then( function( response ) {
            db.updateOne( 'document',  { _id: document }, { $pull: { blocks: null }, $set: { date: Date.now() } } ).then( function( response ) {
                //
                // record delta
                //
                delta.updateDocument( section, category, req.params.document, undefined ).then( function( response ) {
                }).catch( function( error ) {
                    console.log( 'delta.updateDocument : error : ' + error );
                });
                //
                //
                //
                res.json({ status: 'OK', response: response});
            }).catch( function( error ) {
                res.json({ status: 'ERROR', error: error});
            });
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