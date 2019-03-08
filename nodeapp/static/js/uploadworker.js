/* eslint-env worker, es6 */
/* global FileReader */
var files = [];
var processing = false;
//
// utility functions
//
function pad(n, width=3, z=0) {
    return (String(z).repeat(width) + String(n)).slice(String(n).length);
}
function toASCII( str ) { 
    var ascii = new Uint8Array(str.length); 
    for ( var i = 0; i < str.length; ++i ) ascii[i] = str.charCodeAt(i); 
    return ascii;
}
function makeCommandHeader( selector, guid, size ) {
    var header  = new ArrayBuffer(size);
    var dv      = new DataView(header);
    var offset = 0;
    toASCII(selector).forEach( function(c) {
        dv.setUint8( offset, c );
        offset++;
    });
    toASCII(guid).forEach( function(c) {
        dv.setUint8( offset, c );
        offset++;
    });
    return header;
}
//
//
//
function upload( data ) {
    //
    //
    //
    var guid = pad(Date.now(),16,'0');
    var file = data.name ? data.file : data;
    var filename = data.name;
    var filesize = file.size;
    var ws = new WebSocket('wss://platformgame.net');
    ws.binaryType = 'arraybuffer';
    ws.pendingCommands = [];
	ws.waiting = false;
    //
    //
    //
    ws.onmessage = function(evt) {
        //console.log( 'upload worker : message from server : ' + JSON.stringify(evt.data) );
        if ( typeof evt.data === 'string' ) {
            var response = JSON.parse(evt.data);
            if ( response.status === "DONE" ) {
                self.postMessage({ command: "uploaddone", guid: guid, destination: response.destination });
            } else if ( response.status === "READY" ) {
                self.postMessage({ command: "uploadprogress", guid: guid, progress: response.progress });
                if ( ws.pendingCommands.length > 0 ) {
                    ws.send(ws.pendingCommands.shift());
                } else {
					ws.waiting = true;
                    //console.log( 'upload worker : ran out of blocks before upload end' );
                    self.postMessage({ command: "uploaderror", guid: guid, error: "ran out of blocks before upload end" });
                }
            }
        }
    }
    ws.onopen = function() {
        //
        // write header
        // command : 0-3 = selector, 4-19 = uuid, 20-23 = stage ( 'head' | 'chnk' )
        //
        var header = makeCommandHeader( 'upld', guid, 20 + 4 + 2 + 4 + filename.length );
        var dv = new DataView(header);
        var offset = 20;
        toASCII('head').forEach( function(c) {
            dv.setUint8( offset, c );
            offset++;
        }); 
        dv.setUint16(offset,filename.length);
        offset += 2;
        toASCII(filename).forEach( function(c) {
            dv.setUint8( offset, c );
            offset++;
        }); 
        dv.setUint32(offset,filesize);
        ws.send(header);
        //
        //
        //
        self.postMessage({ command: "uploadstart", guid: guid, filename: filename });
        //
        //
        //
        var remaining = filesize;
        var chunkSize = 2048;
        var fileOffset = 0;
        var sent = 0;
        while( remaining > 0 ) {
            var reader = new FileReader();
            reader.onloadend = function(evt) {
                if (evt.target.readyState == FileReader.DONE) { // DONE == 2
                    //
                    // write chunk
                    //
                    var buffer = evt.target.result;
                    //console.log( 'read ' + buffer.byteLength + ' bytes' );
                    var command = makeCommandHeader( 'upld', guid, 24 + buffer.byteLength );
                    dv = new DataView(command);
                    offset = 20;
                    toASCII('chnk').forEach( function(c) {
                        dv.setUint8( offset, c );
                        offset++;
                    }); 
                    var source = new Int8Array(buffer);
                    var destination = new Int8Array(command);
                    for ( var i = 0; i < buffer.byteLength; ++i) {
                        destination[ offset + i ] = source[ i ];
                    }
                    //destination.set( source, offset );
                    //ws.send(command);
                    ws.pendingCommands.push( command );
                    sent += buffer.byteLength;
                    if ( sent >= filesize ) {
                        //console.log('done');
                    }
					//
					// wake up transaction
					//
					if ( ws.waiting ) {
						ws.waiting = false;
						ws.send(ws.pendingCommands.shift());
					}
               }
            }; 
            reader.readAsArrayBuffer(file.slice(fileOffset,fileOffset+chunkSize));
            fileOffset += chunkSize;
            remaining -= chunkSize;
        }
    }
    ws.onerror = function() {
        self.postMessage({ command: "uploaderror", guid: guid, error: "websocket error" });
    }
}

function process() {
    processing = true;
    while ( files.length > 0 ) {
        upload(files.shift());
    }
    processing = false;
}

self.onmessage = function(evt) {
    switch ( evt.data.command ) {
        case "upload" : {
            //
            // store files
            //
            for (var i = 0; i < evt.data.files.length; i++) {
                files.push(evt.data.files[i]);
            }
            //
            // start processing
            //
            if ( !processing ) process();
            break;
        }
        case "cancel" : {
            //
            // TODO: add websocket to array with guid
            //
            break;
        }
        default :
            //console.log( "upload worker : unknown command : " + evt.data.command );  
    }
};
