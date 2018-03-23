//
// TODO: domains or scopes for routes eg chat.sendmessage so routes would look something like
// {
//    chat: {
//        sendmessage: function() {},
//    }
// }
//
var WebSocket = require('ws');

function WebSocketRouter() {
    this.jsonRoutes = {};
    this.binaryRoutes = {};
    this.clientId = 0;
}

WebSocketRouter.prototype.connection = function(wss,ws) {
    let self = this;
    //
    //
    //
    let clientId = ++this.clientId;
    console.log( 'connection from : ' + clientId );
    ws.on('message', (message) => {
        self.message(wss,ws,message);
    });
    ws.on('ping', (data) => {
        ws.pong(data);
    });
    ws.on('pong', (data) => {
        
    });
    ws.on('error', (error) => {
        console.log('WebSocketRouter.socketError: ' + error);
    });
    ws.on('close', (code,reason) => {
        console.log( 'connection closed : ' + clientId );
    });
    //
    //
    //
    let response = { command: 'welcome' };
    ws.send(JSON.stringify(response));
}

WebSocketRouter.prototype.message = function( wss, ws, message ) {
    //
    // TODO: return error for unknown commands
    //
    try {
        if ( typeof message === 'string' ) {
            //
            // JSON command
            // { command: 'name', guid: 'guid', param: .... }
            //
            let command = JSON.parse( message );
            if ( command && this.jsonRoutes[ command.command ] ) {
                console.log( 'processing command : ' + command.command );
                this.jsonRoutes[ command.command ]( wss, ws, command );
            } else {
                console.log( 'WebSocketRouter.message : unable to process message ' + message  );
                let response = {
                    command: command.command,
                    status: 'ERROR',
                    error: 'Unknown command'
                };
                ws.send(JSON.stringify(response));
            }
        } else {
            //
            // binary command
            // [ 4 byte selector ][ data ]
            //
            let selector = message.toString('ascii',0,4);
            if ( this.binaryRoutes[ selector ] ) {
                this.binaryRoutes[ selector ]( wss, ws, message );
            } else {
                console.log( 'WebSocketRouter.message : unable to process binary message ' + selector  );
                //
                // TODO: binary 'unknown command' error response
                //
            }
        }
    } catch( error ) {
        console.log( 'WebSocketRouter.message : ' + error + ' : unable to process message ' + typeof message === 'string' ? message : '' );
        let response = {
            command: 'error',
            message: error + ' : unable to process message ' + typeof message === 'string' ? message : message.toString('ascii',0,4)
        }
        ws.send(JSON.stringify(response));
    }
}

WebSocketRouter.prototype.json = function( command, handler ) {
    if ( this.jsonRoutes[ command ] ) throw 'WebSocketRouter : error : duplicate JSON command : ' + command;
    this.jsonRoutes[ command ] = handler;
}

WebSocketRouter.prototype.binary = function( selector, handler ) {
    if ( this.jsonRoutes[ selector ] ) throw 'WebSocketRouter : error : duplicate binary command : ' + selector;
    this.binaryRoutes[ selector ] = handler;
}

module.exports = new WebSocketRouter();