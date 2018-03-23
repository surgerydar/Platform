//
// 
//
var _db;

function Authentication() {
}

Authentication.prototype.setup = function( wsr, db ) {
    _db = db;
    for ( var key in this ) {
        if ( key !== 'setup' && typeof this[ key ] === 'function' ) {
            console.log( 'Authentication connecting : ' + key );
            wsr.json( key, this[ key ] );
        }
    }
}

Authentication.prototype.register = function( wss, ws, command ) {
    console.log( 'Authentication.register : username:' + command.username + ' email:' + command.email + ' password:' + command.password );
    //
    // create new user
    //
    var user = {
        id: command.id,
        username: command.username,
        email: command.email,
        password: command.password,
        avatar: "",
        profile: "",
        tags: []
    };
    process.nextTick(function(){   
        console.log('registering user : ' + JSON.stringify(user));
        _db.insert('users', user ).then(function( response ) {
            console.log( 'inserted: ' + JSON.stringify(user) + ' : response:' + JSON.stringify(response) );
            command.status = 'OK';
            command.response = { 
                id: command.id,
                username: user.username,
                email: user.email,
                password: user.password,
                avatar: user.avatar,
                profile: user.profile,
                tags: user.tags
            };
            ws.send(JSON.stringify(command));
        }).catch(function(error){
            command.status = 'ERROR';
            command.error = error;
            ws.send(JSON.stringify(command));
        });
    }); 
}
Authentication.prototype.login = function( wss, ws, command ) {
    console.log( 'Authentication.login : username:' + command.username + ' password:' + command.password );
    //
    // find user
    //
    process.nextTick(function(){   
        _db.findOne('users', {$and: [ { username:command.username }, { password:command.password } ]}, { password: 0, _id: 0 } ).then(function( response ) {
            if ( response === null ) {
                command.status = 'ERROR';
                command.error = 'username or password incorrect';
            } else {
                //
                // filter response
                //
                command.status = 'OK';
                command.response = response;
            }
            //console.log('authentications response : ' + JSON.stringify( command ) );
            ws.send(JSON.stringify(command));
        }).catch( function( error ) {
            command.status = 'ERROR';
            command.error = error;
            ws.send(JSON.stringify(command));
        });
    });
}

module.exports = new Authentication();

