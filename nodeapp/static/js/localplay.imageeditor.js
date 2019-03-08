/*eslint-env browser,es6*/
/*global localplay*/
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
        //
        // 
        //
        this.adjustImage();
    }
    transformToCanvas(p) {
        //
        // TODO: add scroll offset
        //
        p.x *= this.drawCanvas.width / this.drawCanvas.offsetWidth;
        p.y *= this.drawCanvas.height / this.drawCanvas.offsetHeight;
    }
    transformFromCanvas(p) {
        //
        // TODO: add scroll offset
        //
        p.x /= this.drawCanvas.width / this.drawCanvas.offsetWidth;
        p.y /= this.drawCanvas.height / this.drawCanvas.offsetHeight;
    }
   //
    //
    //
    setAdjustments(brightness,contrast,saturation) {
        if ( this.brightness !== brightness || this.contrast !== contrast || this.saturation !== saturation ) {
            this.brightness = brightness;
            this.contrast   = contrast;
            this.saturation = saturation;
            this.adjustImage();
        }
    }
    //
    //
    //
    imageBounds() {
        var size    = new Point( this.sourceCanvas.width, this.sourceCanvas.height);
        var center  = new Point( this.drawCanvas.width / 2.0, this.drawCanvas.height / 2.0 );
        return new Rectangle( center.x - size.x / 2.0, center.y - size.y / 2.0, size.x, size.y );
    }
    //
    // drawing methods
    //
    compositeRect(x,y,width,height) {
        //console.log( 'ImageEditor.compositeRect( ' + x + ',' + y + ',' + width + ',' + height + ')' );
        //
        //
        //
        var targetRect = this.imageBounds();
        targetRect.x = Math.round(targetRect.x+x);
        targetRect.y = Math.round(targetRect.y+y);
        targetRect.width = Math.round(width);
        targetRect.height = Math.round(height);
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
        var context = this.drawCanvas.getContext('2d');
        context.save();
        context.clearRect(0,0,this.drawCanvas.width,this.drawCanvas.height);
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
        for ( p.y = 0, i = 0; p.y < dim; p.y++ ) {
            for ( p.x = 0; p.x < dim; p.x++, i++ ) {
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
            pixels: this.createBrush(radius),
            value: function( dst, src ) { return mask ? Math.max(0,dst-src) : Math.min( 255, dst+src); }
        }; 
        this.penMove(x,y);
    }
    penMove(x,y) {
        if ( this.brush ) {
            var _this = this;
            //
            //
            //
            var dirtyRect = new Rectangle(x-this.brush.radius,y-this.brush.radius,this.brush.radius*2,this.brush.radius*2);
            var drawPoint = function( p0, p1 ) {
                let d = p0.distance(p1);
                if ( d > _this.brush.radius ) {
                    let p2 = new Point((p0.x+p1.x)/2.0,(p0.y+p1.y)/2.0);
                    drawPoint(p0,p2);
                    drawPoint(p2,p1);
                } else {
                    let top     = Math.round(p1.y - _this.brush.radius);
                    let left    = Math.round(p1.x - _this.brush.radius);
                    let dim     = Math.round(_this.brush.radius*2);
                    let data    = _this.brush.context.getImageData(left, top, dim, dim);
                    for ( var dst = 3, src = 0; dst < data.data.length; dst += 4, src++ ) {
                        data.data[ dst ] = _this.brush.value(data.data[ dst ],_this.brush.pixels[ src ]);
                    }
                    _this.brush.context.putImageData( data, left, top );
                    if ( top < dirtyRect.top() ) dirtyRect.setTop(top);
                    if ( left < dirtyRect.left() ) dirtyRect.setLeft(left);
                    if ( top + dim > dirtyRect.bottom() ) dirtyRect.setBottom(top + dim);
                    if ( left + dim > dirtyRect.right() ) dirtyRect.setRight(left + dim);
                }
           }
            let current = new Point(x,y);
            drawPoint(this.brush.previous,current);
            this.compositeRect(dirtyRect.x,dirtyRect.y,dirtyRect.width,dirtyRect.height);
            this.brush.previous.set(x,y);
            /*
            let top     = Math.round(y - this.brush.radius);
            let left    = Math.round(x - this.brush.radius);
            let dim     = Math.round(this.brush.radius*2);
            let data    = this.brush.context.getImageData(left, top, dim, dim);
            for ( var dst = 3, src = 0; dst < data.data.length; dst += 4, src++ ) {
                data.data[ dst ] = this.brush.value(data.data[ dst ],this.brush.pixels[ src ]);
            }
            this.brush.context.putImageData( data, left, top );
            this.brush.previous.x = x;
            this.brush.previous.y = y;
            this.compositeRect(left,top,dim,dim);
            */
        }
    }
    penUp(x,y) {
        delete this.brush;
    }
    //
    //
    //
    autoMask(threshold) {
        var _this = this;
        this.spawnWorker('/js/automaskworker.js');
        if (this.worker) {
            var colourContext = this.processedCanvas.getContext('2d');
            var colour = colourContext.getImageData(0,0,this.processedCanvas.width,this.processedCanvas.height);
            var maskContext = this.maskCanvas.getContext('2d');
            var mask = maskContext.getImageData(0,0,this.maskCanvas.width,this.maskCanvas.height);
            var drawContext = this.drawCanvas.getContext('2d');
            drawContext.fillStyle = localplay.colours.lightgrey;
            var imageBounds = this.imageBounds();
            //
            //
            //
            this.worker.addEventListener('message', function (e) {
                //localplay.log("automask worker command: " + e.data.command);
                switch (e.data.command) {
                    case 'automask' :
                        //
                        // display processed data
                        //
                        maskContext.putImageData(e.data.mask, 0, 0);
                        _this.compositeRect( 0, 0, _this.maskCanvas.width, _this.maskCanvas.height );
                        break;
                    case 'progress' :
                        //
                        // show progress
                        //
                        drawContext.fillRect(imageBounds.x+e.data.x,imageBounds.y+e.data.y,1,1);
                        break;
                } 
            });
            this.worker.addEventListener('error', function (e) {
                localplay.log("automask worker error line:" + e.lineno + " file:" + e.filename + " message:" + e.message);
            });
            //
            //
            //
            var data = {
                command: 'automask',
                colour: colour,
                mask: mask,
                threshold: threshold        
            };
            this.worker.postMessage(data);
        }
    }
    //
    // image andjustment worker
    //
    adjustImage() {
        var _this = this;
        if ( this.brightness !== 0.0 || this.contrast !== 0.0 || this.saturation !== 0.0 ) {
            this.spawnWorker('/js/brightnesscontrastsaturationworker.js');
            if (this.worker) {
                //
                //
                //
                var sendBlock = function(data) {
                    var context = _this.sourceCanvas.getContext('2d');
                    data.imagedata = context.getImageData(data.x, data.y, data.width, data.height);
                    _this.worker.postMessage(data);
                }
                //
                // attach event listeners
                //
                this.worker.addEventListener('message', function (e) {
                    //localplay.log("worker command: " + e.data.command);
                    if (e.data.command == 'block') {
                        //
                        // display processed data
                        //
                        var context = _this.processedCanvas.getContext('2d');
                        context.putImageData(e.data.imagedata, e.data.x, e.data.y);
                        _this.compositeRect( e.data.x, e.data.y, e.data.width, e.data.height );
                        //
                        // send next block
                        //
                        e.data.x += e.data.width;
                        if (e.data.x >= _this.sourceCanvas.width) {
                            e.data.x = 0;
                            e.data.y += e.data.height;
                            if (e.data.y >= _this.sourceCanvas.height) {
                                return;
                            }
                        }
                        sendBlock(e.data);
                    }
                });
                this.worker.addEventListener('error', function (e) {
                    localplay.log("worker error line:" + e.lineno + " file:" + e.filename + " message:" + e.message);
                });
                //
                // send first block
                //
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
                sendBlock(data);
            }
        } else {
            var context = this.processedCanvas.getContext('2d');
            context.drawImage( this.sourceCanvas, 0, 0 );
            this.compositeRect(0,0,this.processedCanvas.width,this.processedCanvas.height);
        }
    }
    //
    // generic worker methods
    //
    spawnWorker( file ) {
        this.terminateWorker();
        this.worker = new Worker(file);
    }
    terminateWorker() {
        if ( this.worker ) {
            this.worker.terminate();
            this.worker = null;
        }
    }
}
