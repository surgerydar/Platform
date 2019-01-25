;
localplay.imageeditor = (function () {
    var imageeditor = {};
    //
    //
    //
    class ImageEditor {
        constructor(sourceCanvas,processedCanvas,maskCanvas,drawCanvas) {
            //
            //
            //
            this.sourceCanvas       = sourceCanvas;
            this.processedCanvas    = processedCanvas;
            this.maskCanvas         = maskCanvas;
            this.drawCanvas         = drawCanvas;
            //
            //
            //
            this.brightness = 0.0;
            this.contrast   = 0.0;
            this.saturation = 0.0;
        }
        //
        //
        //
        setAdjustments(brightness,contrast,saturation) {
            if ( this.brightness !== brightness || this.contrast !== contrast || this.saturation !== saturation ) {
                this.brightness = brightness;
                this.contrast   = contrast;
                this.saturation = saturation;
                adjustImage();
            }
        }
        //
        //
        //
        adjustImage() {
            if ( this.brightness !== 0.0 || this.contrast !== 0.0 || this.saturation !== 0.0 ) {
                this.spawnWorker();
                if (this.worker) {
                    var b = this.brightness;
                    var c = this.contrast;
                    var s = this.saturation;
                    var blockwidth = this.sourceCanvas.width >> 2;
                    var blockheight = this.sourceCanvas.height >> 2;
                    var data = {
                        command: 'block',
                        brightness: b,
                        contrast: c,
                        saturation: s,
                        x: 0,
                        y: 0,
                        width: blockwidth > 0 ? blockwidth : this.sourceCanvas.width,
                        height: blockheight > 0 ? blockheight : this.sourceCanvas.height
                    };
                    this.sendBlock(data);
                }
            } else {
                var context = this.processedImageCanvas.getContext('2d');
                context.drawImage( this.sourceCanvas, 0, 0 );
            }
        }
        //
        // image andjustment worker
        //
        sendBlock(data) {
            var context = this.sourceCanvas.getContext('2d');
            data.imagedata = context.getImageData(data.x, data.y, data.width, data.height);
            this.worker.postMessage(data);
        }
        spawnWorker() {
            var _this = this;
            this.terminateWorker();
            this.worker = new Worker('/js/brightnesscontrastsaturationworker.js');
            this.worker.addEventListener('message', function (e) {
                localplay.log("worker command: " + e.data.command);
                if (e.data.command == 'block') {
                    //
                    // display processed data
                    //
                    var context = _this.processedImageCanvas.getContext('2d');
                    context.putImageData(e.data.imagedata, e.data.x, e.data.y);
                    //_this.draw();
                    _this.compositeRect( e.data.x, e.data.y, e.data.width, e.data.height );
                    //
                    // send next block
                    //
                    e.data.x += e.data.width;
                    if (e.data.x >= _this.imageCanvas.width) {
                        e.data.x = 0;
                        e.data.y += e.data.height;
                        if (e.data.y >= _this.imageCanvas.height) {
                            return;
                        }
                    }
                    _this.sendBlock(e.data);
                }
            });
            this.worker.addEventListener('error', function (e) {
                localplay.log("worker error line:" + e.lineno + " file:" + e.filename + " message:" + e.message);
            });
        }
        terminateWorker() {
            if (this.worker) {
                this.worker.terminate();
                this.worker = null;
            }
        }
        //
        // drawing methods
        //
        compositeRect(x,y,width,height) {
            //
            //
            //
            var targetRect = this.imageBounds();
            targetRect.x = Math.round(targetRect.x+x);
            targetRect.y = Math.round(targetRect.y+y);
            targetRect.width = Math.round(targetRect.width);
            targetRect.height = Math.round(targetRect.height);
            //
            //
            //
            var dstContext = this.drawCanvas.getContext('2d');
            var dstPixels = dstContext.getImageData(targetRect.x, targetRect.y, width, height );
            var imageContext = this.processedCanvas.getContext('2d');
            var imagePixels = imageContext.getImageData(Math.round(x),Math.round(y),width,height);
            var maskContext = this.maskCanvas.getContext('2d');
            var maskPixels = maskContext.getImageData(Math.round(x),Math.round(y),width,height);
            //
            //
            //
            for ( var i = 0; i < dstPixels.data.length; i += 4 ) {
                dstPixels.data[i+0] = imagePixels.data[i+0];
                dstPixels.data[i+1] = imagePixels.data[i+1];
                dstPixels.data[i+2] = imagePixels.data[i+2];
                dstPixels.data[i+3] = maskPixels.data[i+3];
            }
            dstContext.putImageData(dstPixels, targetRect.x, targetRect.y);
        }
        //
        //
        //
        draw() {
            //
            //
            //
            var imageBounds = this.imageBounds();
            //
            // clear
            //
            var context = this.canvas.getContext('2d');
            context.save();
            context.clearRect(0,0,this.canvas.width,this.canvas.height);
            //
            // coposite
            //
            this.compositeRect( 0, 0, imageBounds.width, imageBounds.height );
        }
        //
        //
        //
        createBrush(radius) {
            let dim = Math.round(radius * 2);
            let pixels = Uint8Array.from({length: dim*dim}, ()=>0);
            let p = new Point();
            let cp = new Point( radius, radius );
            let innerRadius = radius / 2.;
            let outerRadius = radius;
            var i;
            for ( p.y = 0, i = 0; p.y < this.eraserSize; p.y++ ) {
                for ( p.x = 0; p.x < this.eraserSize; p.x++, i++ ) {
                    let d = cp.distance(p);
                    let value = 1.0 - ( ( d - innerRadius ) / ( outerRadius - innerRadius ) );
                    pixels[i] = Math.max(0,Math.min(255,Math.round(value*255.0)));
                }
            }
            return pixels;
        }
        //
        //
        //
        penDown(x,y,radius,mask) {
            this.brush = {
                context: this.maskCanvas.getContext('2d'),
                previous: new Point(x,y),
                radius: radius,
                pixels: this.creatBrush(radius),
                value: mask ? function( dst, src ) { return Math.max(0,dst-src); } : function( dst, src ) { return Math.min( 255, dst+src); }
            }; 
            
        }
        penMove(x,y) {
            if ( this.brush ) {
                let top     = Math.round(p.y - this.brush.radius);
                let left    = Math.round(p.x - this.brush.radius);
                let dim     = Math.round(this.brush.radius*2);
                let data    = this.brush.context.getImageData(left, top, dim, dim);
                for ( var dst = 3, src = 0; dst < data.data.length; dst += 4, src++ ) {
                    data.data[ dst ] = this.brush.value(data.data[ dst ],this.brush.pixels[ src ]);
                }
                this.brush.context.putImageData( data, left, top );
                this.brush.previous.x = x;
                this.brush.previous.y = y;
            }
        }
        penUp(x,y) {
            delete this.brush;
        }
    }
    //
    //
    //
    imageeditor.createimageeditor = function (sourceCanvas,processedCanvas,maskCanvas,drawCanvas) {
        return new ImageEditor(sourceCanvas,processedCanvas,maskCanvas,drawCanvas);
    }
    return imageeditor;
})();
