/* eslint-env node, mongodb, es6 */
/* eslint-disable no-console */
//
// database
//
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
//var bcrypt = require('bcryptjs');

function Db() {
}

Db.prototype.connect = function( host, port, database, username, password ) {
	host 		= host || '127.0.0.1';
	port 		= port || '27017';
	database 	= database || 'platform';
	var authentication = username && password ? username + ':' + password + '@' : '';
	var url = host + ':' + port + '/' + database;
	console.log( 'connecting to mongodb://' + authentication + url );
	var self = this;
	return new Promise( function( resolve, reject ) {
		try {
			MongoClient.connect('mongodb://'+ authentication + url, function(err, db) {
				if ( !err ) {
					console.log("Connected to database server");
					self.db = db;
                    //
                    //
                    //
					resolve( db );
				} else {
					console.log("Unable to connect to database : " + err);
					reject( err );
				}
			});
		} catch( err ) {
			reject( err );
		}
	});
}
//
// generic function
//
Db.prototype.drop = function( collection ) {
	var db = this.db;
	return new Promise( function( resolve, reject ) {
		try {
			db.collection( collection ).drop(function(err,result) {
				if ( err ) {
                    console.log( 'drop : ' + collection + ' : error : ' + err );
					reject( err );
				} else {
					resolve( result );
				}
			});
		} catch( err ) {
            console.log( 'drop : ' + collection + ' : error : ' + err );
			reject( err );
		}
	});
}

Db.prototype.count = function( collection, query ) {
	var db = this.db;
	return new Promise( function( resolve, reject ) {
		try {
			db.collection( collection ).count(query, function(err,result) {
				if ( err ) {
                    console.log( 'count : ' + collection + ' : error : ' + err );
					reject( err );
				} else {
					resolve( result );
				}
			});
		} catch( err ) {
            console.log( 'drop : ' + collection + ' : error : ' + err );
			reject( err );
		}
	});
}

Db.prototype.insert = function( collection, document ) {
    var db = this.db;
    return new Promise( function( resolve, reject ) {
        try {
            db.collection( collection ).insertOne( document,function(err,result) {
               if ( err ) {
                   console.log( 'insert : ' + collection + ' : error : ' + err );
                   reject( err );
               } else {
                   resolve( result );
               }
            });
        } catch( err ) {
            console.log( 'insert : ' + collection + ' : error : ' + err );
            reject( err );
        }
    });
}

Db.prototype.insertMany = function( collection, documents ) {
    var db = this.db;
    return new Promise( function( resolve, reject ) {
        try {
            db.collection( collection ).insertMany( documents, function(err,result) {
               if ( err ) {
                   console.log( 'insertMany : ' + collection + ' : error : ' + err );
                   reject( err );
               } else {
                   resolve( result );
               }
            });
        } catch( err ) {
            console.log( 'insert : ' + collection + ' : error : ' + err );
            reject( err );
        }
    });
}

Db.prototype.remove = function( collection, query ) {
    var db = this.db;
    return new Promise( function( resolve, reject ) {
        try {
            db.collection( collection ).remove( query, function(err,result) {
               if ( err ) {
                   console.log( 'remove : ' + collection + ' : error : ' + err );
                   reject( err );
               } else {
                   resolve( result );
               }
            });
        } catch( err ) {
            console.log( 'remove : ' + collection + ' : error : ' + err );
            reject( err );
        }
    });
}

Db.prototype.updateOne = function( collection, query, update ) {
    var db = this.db;
    return new Promise( function( resolve, reject ) {
         try {
             db.collection( collection ).findOneAndUpdate( query, update, function( err, result ) {
                if ( err ) {
                    console.log( 'update : ' + collection + ' : error : ' + err );
                    reject( err );
                } else {
                    resolve( result );
                }
             });
        } catch( err ) {
            console.log( 'update : ' + collection + ' : error : ' + err );
            reject( err );
        }
    });
}

Db.prototype.find = function( collection, query, projection, order, offset, limit ) {
    var db = this.db;
    return new Promise( function( resolve, reject ) {
        try {
            db.collection( collection ).find(query||{},projection||{}).sort(order||{}).skip(offset||0).limit(limit||0).toArray( function( err, result ) {
                if ( err ) {
                    console.log( 'find : ' + collection + ' : error : ' + err );
                    reject( err );
                } else {
                     resolve( result );
                }
            });  
        } catch( err ) {
            console.log( 'find : ' + collection + ' : error : ' + err );
            reject( err );
        }
    });
}

Db.prototype.findOne = function( collection, query, projection ) {
    var db = this.db;
    return new Promise( function( resolve, reject ) {
        try {
            db.collection(collection).findOne(query,projection||{}, function( err, result ) {
                if ( err ) {
                    console.log( 'findOne : ' + collection + ' : error : ' + err );
                    reject( err );
                } else {
                    resolve( result );
                }
            });
        } catch( err ) {
            console.log( err );
            reject( err );
        }
    });
}

Db.prototype.findAndModify = function( collection, query, sort, update, options ) {
    var db = this.db;
    return new Promise( function( resolve, reject ) {
        try {
            db.collection(collection).findAndModify( query, sort, update, options, function( err, result ) {
                if ( err ) {
                    console.log( 'findAndModify : ' + collection + ' : error : ' + err );  
                    reject( err );
                } else {
                    resolve( result );
                }
            });
        } catch( err ) {
            console.log( err );
            reject( err );
        }
    });
}

Db.prototype.ObjectId = function( hex ) {
    return new ObjectId.createFromHexString(hex);
}

module.exports = new Db();

