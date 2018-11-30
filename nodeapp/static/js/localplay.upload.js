;
localplay.upload = (function () {
    if ( localplay.upload ) return localplay.upload;
    //
    // TODO: inject progress dialog into document
    //
    var callback = null;
    var progress = null;
    var target = null;
    var uploadWorker = null;
    //
    //
    //
    function startUploadWorker() {
        //
        // start upload worker
        //
        uploadWorker = new Worker('/js/upload.js');
        //
        // hook messages
        //
        uploadWorker.onmessage = function(evt) {
            //console.log( 'upload worker : message : ' + JSON.stringify( evt.data ) );
            switch ( evt.data.command ) {
                case "uploadstart" :
                    if ( progress ) {
                        progress.style.visibility = 'visible';
                        progress.innerHTML = "<h1>0%</h1>";
                    }
                    break;
                case "uploadprogress" :
                    var percent = Math.round( 100. * evt.data.progress );
                    if ( progress ) {
                        if ( isNaN( percent ) ) {
                            console.log( 'invalid progress : ' + evt.data.progress );
                        }
                        progress.innerHTML = "<h1>" + percent + "%</h1>";
                    } else {
                        console.log( 'upload : progress : ' + percent + '%' );
                    }
                    break;
                case "uploaddone" :
                    if ( target ) {
                        target.src = evt.data.destination;
                    }
                    if ( progress ) {
                        progress.innerHTML = "";
                        progress.style.visibility = 'hidden';
                    }
                    if ( callback ) {
                        callback('OK');
                    }
                    break;
                case "log" :
                    console.log( 'from uploadWorker : ' + evt.data.message );
            }
        }
        uploadWorker.onerror = function(evt) { 
            console.log('upload worker : ERROR : line ', evt.lineno, ' in ', evt.filename, ': ', evt.message); 
            if ( callback ) {
                callback('ERROR'); // TODO: return error message
            }
            if ( progress ) {
                progress.innerHTML = "";
                progress.style.visibility = 'hidden';
            }
        }
    }
    return {
        upload: function( files, c ) {
            callback = c;
            if ( uploadWorker === null ) {
                startUploadWorker();
            }
            if ( !progress ) {
                //
                // create UI
                // TODO: template this
                //
                progress = document.createElement('div');
                progress.style.position = 'fixed';
                progress.style.top = '0px';
                progress.style.left = '0px';
                progress.style.right = '0px';
                progress.style.height = '64px';
                progress.style.textAlign = 'center';
                progress.style.backgroundColor = 'black';
                progress.style.opacity = '.5';
                progress.style.visibility = 'hidden';
                document.body.appendChild(progress);
            }
            var message = {
                command: "upload",
                files: files
            };   
            uploadWorker.postMessage(message);
        } 
    };
})();