/* eslint-env node, mongodb, es6 */
/* eslint-disable no-console */
var express = require('express')
var router = express.Router()


module.exports = function( authentication, db, mailer ) {
    //
    // utility functions
    //
    function requireRole(role) {
        return function(req, res, next) {
            if (req.user && req.user.role === role) {
                next();
            } else {
                res.send(403, 'Unauthorized');
            }
        };
    }
    //
    //
    //
    function findContent( collection, group, req ) {
        var filter      = req.query.filter;
        var offset      = req.query.offset ? parseInt(req.query.offset) : 0;
        var limit       = req.query.limit ? parseInt(req.query.limit) : 24;
        //
        // build conditions
        //
        var conditions = [];
        //
        // group
        //
        if ( collection === 'users' ) { // users can belong to multiple groups
            conditions.push( { groups: group || 'public' } );
        } else {
            conditions.push( { group: group || 'public' } );
        }
        //
        // text filter
        //
        if ( filter ) {
            var test = new RegExp(filter,'i');
            conditions.push({ $or: [ { name: { $regex: test } }, { creator: { $regex: test } }, { tags: { $regex: test } } ] });
        } else {
            filter = '';
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
        //
        //
        console.log( 'searching collection ' + collection + ' for ' + JSON.stringify(query))
        //
        //
        //
        return new Promise( function( resolve, reject ) {
            db.count( collection, query ).then( function(count) {
                db.find( collection, query, {}, {created: -1}, offset, limit ).then( function( result ) {
                    var resolution = {
                        pagination: {
                            pagecount: Math.ceil( count / limit ),
                            pagenumber: Math.floor( offset / limit ),
                            offset: offset,
                            limit: limit,
                            previousoffset: offset - limit,
                            nextoffset: offset + limit,
                            filter: filter
                        }
                    };
                    resolution[ collection ] = result;
                    resolve( resolution );
                });
            }).catch( function(error) {
                reject( error );
            });
        });
    }
    //
    // routes
    //
    console.log( 'setting admin routes' );
    router.get('/', authentication, requireRole('admin'), function (req, res) {
        res.render('admin');
    });
    //
    //
    //
    router.get('/groups', authentication, requireRole('admin'), function (req, res) {
        //
        // build group list
        //
        var query = {};
        if ( req.user.groups.indexOf('system') < 0 ) {
            query = { name: { $in: req.user.groups } };  
        }
        db.find( 'groups', query ).then(function(groups) {
            res.render('admin-groups', {groups:groups});
        }).catch( function( error ) {
            res.render('admin-error', {error:'error : ' + error });
        });
    });
    //
    //
    //
    router.get('/group/:id', authentication, requireRole('admin'), function (req, res) {
        if ( req.params.id === 'add' ) {
            res.render('admin-group-add');    
        } else {
            //
            // find group
            //
            let id = db.ObjectId(req.params.id);
            db.findOne( 'groups', {_id: id} ).then(function(group) {
                res.render('admin-group', {group:group});
            }).catch( function( error ) {
                res.render('admin-error', {error:'error : ' + error });
            });
        }
    });
    router.delete('/group/:id', authentication, requireRole('admin'), function (req, res) {
        //
        // find group
        //
        let id = db.ObjectId(req.params.id);
        db.findOne( 'groups', {_id: id} ).then(function(group) {
            //
            // delete group
            //
            db.remove( 'groups', {_id: id} ).then( function() {
                //
                // delete levels
                //
                db.remove( 'levels', {group:group.name} ).then( function() {
                    //
                    // delete media
                    //
                    db.remove( 'media', {group:group.name} ).then( function() {
                        //
                        //
                        //
                        res.redirect('/admin/groups');
                    });
                });
            });
        }).catch( function( error ) {
            res.render('admin-error', {error:'error : ' + error });
        });
    });
    router.post('/group', authentication, requireRole('admin'), function (req, res) {
        //
        // insert group
        //
        db.findOne( 'groups', {name: req.body.name} ).then(function(group) {
            if ( !group ) {
                db.insert( 'groups', req.body ).then(function(result) {
                    res.redirect('/admin/group/' + result.insertedId );
                    /*
                    let insertedGroup = {
                        _id:result.insertedId,
                        name:req.body.name,
                        description:req.body.description
                    };
                    res.render('admin-group', {group:insertedGroup});
                    */
                }).catch( function( error ) {
                    res.render('admin-group-add', {error:'error : ' + error, name: req.body.name });
                });
            } else {
                res.render('admin-group-add', {error:'group with name \'' + req.body.name + '\' already exists', name: req.body.name });
            }
        });
    });
    //
    //
    //
    router.get('/group/:groupid/users', authentication, requireRole('admin'), function (req, res) {
        //
        // find group
        //
        let id = db.ObjectId(req.params.groupid);
        db.findOne( 'groups', {_id: id} ).then(function(group) {
            //
            // find group users
            //
            findContent('users', group.name, req).then( function(resolution) {
                res.render('admin-group-users', {group: group, users:resolution.users, pagination: resolution.pagination, currentuser: req.user._id});
            });
        }).catch( function( error ) {
            res.render('admin-error', {error:'error : ' + error });
        });
    });
    router.get('/group/:groupid/user/:id', authentication, requireRole('admin'), function (req, res) {
        
        let groupid = db.ObjectId(req.params.groupid);
        db.findOne( 'groups', {_id: groupid} ).then(function(group) {
            if ( group ) {
                if ( req.params.id === 'add' ) {
                    res.render('admin-group-user-add', {group:group});    
                } else {
                    let query = {
                        $and : [
                            { _id: db.ObjectId(req.params.id) },
                            { groups: group.name }
                        ]  
                    };
                    db.findOne('users', query ).then( function(user) {
                        if ( user ) {
                            res.render('admin-user', {group: group, user: user});    
                        } else {
                            throw 'unknown user';
                        } 
                    });
                }
            } else {
                throw 'unknown group';
            }    
        }).catch( function( error ) {
            res.render('admin-error', {error:'error : ' + error });
        });
    });
   router.delete('/group/:groupid/user/:id', authentication, requireRole('admin'), function (req, res) {
        //
        // find group
        //
        let id = db.ObjectId(req.params.id);
        db.remove( 'users', {_id:id} ).then( function() {
            let groupid = db.ObjectId(req.params.groupid);
            db.findOne( 'groups', {_id: groupid} ).then(function(group) {
                //
                // find group users
                //
                findContent('users', group.name, req).then( function(resolution) {
                    res.render('admin-group-users', {group: group, users:resolution.users, pagination: resolution.pagination});
                });
            });
        }).catch( function(error) {
            res.render('admin-error', {error:'error : ' + error });    
        });
    });
    router.post('/group/:groupid/inviteusers', authentication, requireRole('admin'), function (req, res) {
        let id = db.ObjectId(req.params.groupid);
        db.findOne( 'groups', {_id: id} ).then(function(group) {
            //
            // store pending invites 
            //
            console.log( 'inviting users: ' + JSON.stringify(req.body) );
            let invites = [];
            let emails = [];
            for ( var key in req.body ) {
                if ( key.indexOf( 'email' ) === 0 ) {
                    emails.push( req.body[key] );
                    invites.push( { group: group.name, email: req.body[key], accepted: false} );
                }
            }
            db.insertMany('invites', invites).then( function(result) {
                //
                // send mail invite
                //
                mailer.send( emails.join(','), 'Invite to platform game', 'Hi, you have been invited to join platform').then( function() {
                    res.redirect('/admin/group/' + req.params.groupid + '/users');
                }).catch( function( error ) {
                    res.render('admin-error', {error:'error : ' + error });    
                });
                //
                //
                //
            }).catch( function( error ) {
                res.render('admin-error', {error:'error : ' + error });    
            });
            //
            //
            //
        });
            
    });
    router.put('/group/:groupid/user/:id', authentication, requireRole('admin'), function (req, res) {
        //
        // update user
        //
        let id = db.ObjectId(req.params.id);
        db.updateOne( 'users', {_id:id}, {$set:req.body} ).then( function() {
            //
            // redirect back to user list
            //
            res.redirect('/admin/group/' + req.params.groupid + '/users');
        }).catch( function(error) {
            res.render('admin-error', {error:'error : ' + error });    
        });
    });
    //
    //
    //
    router.get('/group/:groupid/media', authentication, requireRole('admin'), function (req, res) {
        //
        // find group
        //
        let id = db.ObjectId(req.params.groupid);
        db.findOne( 'groups', {_id: id} ).then(function(group) {
            //
            // find group media
            //
            findContent('media', group.name, req).then( function(resolution) {
                var imageTemplate = '/media/{_id}?thumbnail=true';
                res.render('admin-group-imagelist', {group: group, collection: 'media', items:resolution.media, imagetemplate: imageTemplate, pagination: resolution.pagination});
            });
        }).catch( function( error ) {
            res.render('admin-error', {error:'error : ' + error });
        });
    });
    router.delete('/group/:groupid/media/:id', authentication, requireRole('admin'), function (req, res) {
        //
        // find group
        //
        let id = db.ObjectId(req.params.id);
        db.remove( 'media', {_id:id} ).then( function() {
            let groupid = db.ObjectId(req.params.groupid);
            db.findOne( 'groups', {_id: groupid} ).then(function(group) {
                //
                // find group media
                //
                findContent('media', group.name, req).then( function(resolution) {
                    var imageTemplate = '/media/{_id}?thumbnail=true';
                    res.render('admin-group-imagelist', {group: group, collection: 'media', items:resolution.media, imagetemplate: imageTemplate, pagination: resolution.pagination});
                });
            });
        }).catch( function(error) {
            res.render('admin-error', {error:'error : ' + error });    
        });
    });
    router.put('/group/:groupid/media/:id', authentication, requireRole('admin'), function (req, res) {
        //
        // find group
        //
        let id = db.ObjectId(req.params.id);
        db.updateOne( 'media', {_id:id}, {$set:req.body} ).then( function() {
            let groupid = db.ObjectId(req.params.groupid);
            db.findOne( 'groups', {_id: groupid} ).then(function(group) {
                //
                // find group media
                //
                findContent('media', group.name, req).then( function(resolution) {
                    var imageTemplate = '/media/{_id}?thumbnail=true';
                    res.render('admin-group-imagelist', {group: group, collection: 'media', items:resolution.media, imagetemplate: imageTemplate, pagination: resolution.pagination});
                });
            });
        }).catch( function(error) {
            res.render('admin-error', {error:'error : ' + error });    
        });
    });
    //
    //
    //
    router.get('/group/:groupid/levels', authentication, requireRole('admin'), function (req, res) {
        //
        // find group
        //
        let id = db.ObjectId(req.params.groupid);
        db.findOne( 'groups', {_id: id} ).then(function(group) {
            //
            // find group levels
            //
            findContent('levels', group.name, req).then( function(resolution) {
                const imageTemplate = '/levels/thumbnail/{_id}';          
                res.render('admin-group-imagelist', {group: group, collection: 'levels', items:resolution.levels, imagetemplate: imageTemplate, pagination: resolution.pagination});
            });
        }).catch( function( error ) {
            res.render('admin-error', {error:'error : ' + error });
        });
    });
    router.delete('/group/:groupid/levels/:id', authentication, requireRole('admin'), function (req, res) {
        //
        // find group
        //
        let id = db.ObjectId(req.params.id);
        db.remove( 'levels', {_id:id} ).then( function() {
            let groupid = db.ObjectId(req.params.groupid);
            db.findOne( 'groups', {_id: groupid} ).then(function(group) {
                //
                // find group media
                //
                findContent('levels', group.name, req).then( function(resolution) {
                    const imageTemplate = '/levels/thumbnail/{_id}';          
                    res.render('admin-group-imagelist', {group: group, collection: 'levels', items:resolution.levels, imagetemplate: imageTemplate, pagination: resolution.pagination});
                });
            });
        }).catch( function(error) {
            res.render('admin-error', {error:'error : ' + error });    
        });
    });
    router.put('/group/:groupid/levels/:id', authentication, requireRole('admin'), function (req, res) {
        //
        // find group
        //
        let id = db.ObjectId(req.params.id);
        db.updateOne( 'levels', {_id:id}, {$set:req.body} ).then( function() {
            let groupid = db.ObjectId(req.params.groupid);
            db.findOne( 'groups', {_id: groupid} ).then(function(group) {
                //
                // find group media
                //
                findContent('levels', group.name, req).then( function(resolution) {
                    const imageTemplate = '/levels/thumbnail/{_id}';          
                    res.render('admin-group-imagelist', {group: group, collection: 'levels', items:resolution.levels, imagetemplate: imageTemplate, pagination: resolution.pagination});
                });
            });
        }).catch( function(error) {
            res.render('admin-error', {error:'error : ' + error });    
        });
    });
    //
    //
    //
    return router;
}