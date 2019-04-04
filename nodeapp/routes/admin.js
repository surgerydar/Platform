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
            conditions.push({ $or: [ { name: { $regex: test } }, { username: { $regex: test } }, { creator: { $regex: test } }, { tags: { $regex: test } } ] });
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
        // build conditions
        //
        var conditions = [];
        if ( req.user.groups.indexOf('system') < 0 ) {
            conditions.push( { name: { $in: req.user.groups } } );  
        }
        if ( req.query.filter ) {
            conditions.push({ name: { $regex: new RegExp(req.query.filter,'i') } });    
        }
        //
        //
        //
        let query = {};
        if ( conditions.length === 1 ) {
            query = conditions[ 0 ];   
        } else if ( conditions.length > 1 ) {
            query = { $and: conditions }; 
        }
        db.find( 'groups', query ).then(function(groups) {
            res.render('admin-groups', {groups:groups,filter:req.query.filter});
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
                if ( group ) {
                    res.render('admin-group', {group:group});
                } else {
                    res.render('admin-error', {error: 'unknown group : ' + req.params.id });
                }
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
                        // remove group from user lists
                        //
                        db.update( 'users', {}, { $pull: {group:group.name} } ).then( function() {
                            //
                            //
                            //
                            res.redirect('/admin/groups');
                        });
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
        //
        // check for valid group
        //
        let id = db.ObjectId(req.params.groupid);
        db.findOne( 'groups', {_id: id} ).then(function(group) {
            //
            // extract emails from request body
            //
            let emails = [];
            for ( var key in req.body ) {
                if ( key.indexOf( 'email' ) === 0 ) {
                    emails.push( req.body[key] );
                }
            }
            //
            // find existing users
            //
            db.find( 'users', { email: {$in: emails} }, { username: 1, email: 1 } ).then( function( users ) {
                //
                // merge lists
                //
                function findEmail( email ) {
                    return function( user ) {
                        return user.email === email;    
                    };
                }
                let invites = [];
                emails.forEach( function( email ) {
                    let invite = { group: group.name, email: email, accepted: false, date: Date.now()}
                    let user = users.find(findEmail(email));
                    if( user ) {
                        invite.username = user.username;
                        invite.userid = user._id;
                    } 
                    invites.push(invite);
                });
                //
                // store pending invites
                //
                db.insertMany('invites', invites).then( function(result) {
                    //
                    // send invite emails
                    // TODO: email templates should be stored in database
                    //
                    let title = 'Invite to join Platform group ' + group.name;
                    let pendingEmails = [];
                    invites.forEach( function( invite ) {
                        let link = 'https://platformgame.net/group/join/' + group._id + '?email='  + invite.email;
                        let content = 'Hi ' + ( invite.username ? invite.username : '' ) + ',<br>You have been invited to join platform group ' + group.name + '<br>click on link below to join<br><a href="' + link + '">join' + group.name + '</a>';
                        pendingEmails.push(mailer.send( invite.email, title, content ));
                    });
                    Promise.all(pendingEmails).then( function() {
                        //
                        // redirect to user list
                        //
                        res.redirect('/admin/group/' + group._id + '/users');
                    }).catch( function( error ) {
                        res.render('admin-error', {error:'error : ' + error });    
                    });
                    //
                    //
                    //
                }).catch( function( error ) {
                    res.render('admin-error', {error:'error : ' + error });    
                });
            }).catch( function( error ) {
                res.render('admin-error', {error:'error : ' + error });    
            });
            //
            //
            //
        });
            
    });
    router.put('/group/:groupid/user/:id', authentication, requireRole('admin'), function (req, res) {
        console.log( 'updating user : ' + req.params.id );
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
                res.render('admin-group-imagelist', {group: group, collection: 'media', items:resolution.media, imagetemplate: imageTemplate, selecttemplate: 'https://platformgame.net/media/{_id}', pagination: resolution.pagination});
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
        console.log( 'updating media : ' + req.params.id );
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
                res.render('admin-group-imagelist', {group: group, collection: 'levels', items:resolution.levels, imagetemplate: imageTemplate, selecttemplate: 'https://platformgame.net/play/{_id}', pagination: resolution.pagination});
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
        console.log( 'updating level : ' + req.params.id );
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
    router.get('/group/:groupid/pages', authentication, requireRole('admin'), function (req, res) {
        //
        // find group
        //
        let id = db.ObjectId(req.params.groupid);
        db.findOne( 'groups', {_id: id} ).then(function(group) {
            res.render('admin-group-pages', {group: group});
        }).catch( function( error ) {
            res.render('admin-error', {error:'error : ' + error });
        });
    });
    router.get('/group/:groupid/pages/:page', authentication, requireRole('admin'), function (req, res) {
        //
        // find group
        //
        let id = db.ObjectId(req.params.groupid);
        db.findOne( 'groups', {_id: id} ).then(function(group) {
            //
            // find group page
            //
            db.findOne('pages', {group: group.name, name:req.params.page}).then( function(page) {
                if ( !page ) {
                    page = {
                        name: req.params.page
                    };
                }
                res.render('admin-group-page', {group: group, page:page});
            }).catch(function(error) {
                res.render('admin-error', {error:'error : ' + error });
            });
        }).catch( function( error ) {
            res.render('admin-error', {error:'error : ' + error });
        });
    });
    router.put('/group/:groupid/pages/:page', authentication, requireRole('admin'), function (req, res) {
        console.log( 'updating page : ' +  req.params.page );
        //
        // find group
        //
        let groupid = db.ObjectId(req.params.groupid);
        db.findOne( 'groups', {_id: groupid} ).then(function(group) {
            //
            //
            //
            let page = req.body;
            console.log( 'saving page : ' + page.name + ' to ' + group.name );
            db.findOne( 'pages', {group:group.name,name:page.name} ).then( function(existing) {
                if ( existing ) {
                    db.updateOne( 'pages', {_id: existing._id}, { $set: { content: page.content} } ).then( function() {
                        res.render('admin-group-pages', {group: group});
                    });    
                } else {
                    db.insert( 'pages', {group:group.name,name:page.name,content:page.content} ).then( function() {
                        res.render('admin-group-pages', {group: group});
                    });    
                }
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