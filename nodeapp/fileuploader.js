'use strict';
const fs = require('fs');
let uploads = [];
//
//
//
function FileWriter( guid, filename, fileSize ) {
    this.guid       = guid;
    this.fileSize   = fileSize;
    this.processed  = 0;
    this.filename   = filename;
    this.file       = fs.createWriteStream('./upload/' + filename);
    if ( !this.file ) {
        console.log( 'unable to open file : ' + './upload/' + filename );
    }
}
FileWriter.prototype.writeChunk = function( ws, data ) {
    let self = this;
    if ( this.file ) {
        this.file.write( data );
    } else {
        console.log( 'file is closed' );
        return true;
    }
    this.processed += data.length;
    //console.log( this.fileSize + ' bytes remaining' );
    if ( this.processed >= this.fileSize ) {
        console.log( 'closing file');
        this.file.end();
        
        let source = './upload/' + this.filename;
        let destination = './media/uploads/' + this.filename;
        this.file.once('close', function() {
            if ( !fs.copyFile ) {
                function copyFile( source, destination ) {
                    return new Promise( function( resolve, reject ) {
                        var rd = fs.createReadStream(source);
                        rd.on('error', rejectCleanup);
                        var wr = fs.createWriteStream(destination);
                        wr.on('error', rejectCleanup);
                        function rejectCleanup(err) {
                            rd.destroy();
                            wr.end();
                            reject(err);
                        }
                        wr.on('finish', resolve);
                        rd.pipe(wr);                    
                    });
                }
                copyFile( source, destination ).then( function() {
                    console.log(source + ' was copied to ' + destination);
                    ws.send( JSON.stringify({status:"DONE", guid: self.guid, destination:'/media/uploads/' + self.filename}) );
                }).catch( function( error ) {
                    console.log('error copying ' + source + ' to ' + destination + ' : ' + error );
                });
            } else {
                fs.copyFile(source, destination, (error) => {
                    if (error) {
                        console.log('error copying ' + source + ' to ' + destination + ' : ' + error );
                    } else {
                        console.log(source + ' was copied to ' + destination);
                        ws.send( JSON.stringify({status:"DONE", guid: self.guid, destination:'/media/uploads/' + self.filename}) );
                    }
                });
            }
        });
        return true;
    } else {
        //
        // request next chunk
        //
        ws.send( JSON.stringify({status:"READY", guid: self.guid, progress: ( self.processed / self.fileSize) }) );
    }
    return false;
}
//
//
//
function FileUploader() {
    
}

FileUploader.prototype.setup = function( wsr ) {
    for ( var key in this ) {
        if ( key !== 'setup' && typeof this[ key ] === 'function' ) {
            console.log( 'FileUploader connecting : ' + key );
            wsr.binary( key, this[ key ] );
        }
    }
}

FileUploader.prototype.upld = function( wss, ws, command ) {
    // command : 0-3 = selector, 4-19 = uuid, 20-23 = stage ( 'head' | 'chnk' )
    process.nextTick(function(){
        
        try {
            let guid    = command.toString('ascii',4,4+16);
            let stage   = command.toString('ascii',20,20+4);
            switch( stage ) {
                case 'head' :
                    //
                    // read header
                    // NN|AAAAA ...|NNNN
                    //
                    let filenameLength  = command.readInt16BE(24);
                    let filename        = command.toString('ascii',26,26+filenameLength);
                    let filesize        = command.readUInt32BE(26+filenameLength);
                    //
                    //
                    //
                    console.log('processing file : ' + filename + ' : size : ' + filesize );
                    uploads.push( new FileWriter(guid,filename,filesize) );
                    //respond('ok  ');
                    //
                    // request first chunk
                    //
                    ws.send( JSON.stringify({status:"READY", guid: guid, progress:0.}) );
                    break;
                case 'chnk' :
                    //
                    // write chunk
                    //
                    for ( var i = 0; i < uploads.length; i++ ) {
                        if ( uploads[ i ].guid === guid ) {
                            let data = command.slice(24);
                            //console.log('writing chunk ' + data.length + ' bytes');
                            if ( uploads[ i ].writeChunk( ws, data ) ) {
                                uploads.splice(i,1);
                            }
                            break;
                        }
                    }
                    //respond('ok  ');
                    break;
                default :
                    console.log( 'unknown stage : ' + stage );
                    //respond('unkn');
            }
        } catch( error ) {
            console.log( 'fileupload : error : ' + error );
            respond('err ');
        }
        function respond( status ) {
            //
            // TODO: change to JSON based status reporting
            //
            let response = Buffer.alloc(20+status.length);
            command.copy(response,0,0,20);
            response.write(status, 20);
            try {
                ws.send(response);
            } catch( error ) {
                console.log('websocket error : ' + error);
            }
        }
    });
}
//
//
//
module.exports = new FileUploader();
