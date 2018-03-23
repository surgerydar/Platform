//
// 
//
var _db;

function Profile() {
}

Profile.prototype.setup = function( wsr, db ) {
    _db = db;
    for ( var key in this ) {
        if ( key !== 'setup' && typeof this[ key ] === 'function' ) {
            console.log( 'Profile connecting : ' + key );
            wsr.json( key, this[ key ] );
        }
    }
}

Profile.prototype.updateprofile = function( wss, ws, command ) {
    console.log( 'Profile.updateprofile : id:' + command.profile.id + ' username:' + command.profile.username + ' email:' + command.profile.email );
    //
    // update user
    //
    process.nextTick(function(){   
        //console.log('updating user : ' + JSON.stringify(command.profile));
        _db.updateUser(command.profile.id,command.profile).then(function( response ) {
            command.status = 'OK';
            command.response = response;
            ws.send(JSON.stringify(command));
        }).catch( function( error ) {
            command.status = 'ERROR';
            command.error = error;
            ws.send(JSON.stringify(command));
        });
    }); 
}

Profile.prototype.getpublicprofiles = function( wss, ws, command ) {
    console.log( 'Profile.getpublicprofiles : exclude:' + command.exclude );
    //
    // update user
    //
    process.nextTick(function() {  
        let query = {};
        if ( command.exclude ) {
            query = {id:{$not:{$eq:command.exclude}}};
        }
        _db.findUsers(query,{password: 0, email: 0},{}).then(function( response ) {
            command.status = 'OK';
            command.response = response;
            ws.send(JSON.stringify(command));
        }).catch( function( error ) {
            command.status = 'ERROR';
            command.error = error;
            ws.send(JSON.stringify(command));
        });
    }); 
}

module.exports = new Profile();

