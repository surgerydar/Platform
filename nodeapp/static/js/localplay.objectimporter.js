/**
 *
 * @source: https://github.com/LocalPlay/PlayYourPlace/tree/master/htdocs/js/localplay.game.objectimporter.js
 *
 * @licstart  The following is the entire license notice for the 
 *  JavaScript code in this page.
 *
 *  Copyright (C) 2013 Local Play
 *
 *
 * The JavaScript code in this page is free software: you can
 * redistribute it and/or modify it under the terms of the GNU
 * General Public License (GNU GPL) as published by the Free Software
 * Foundation, either version 3 of the License, or (at your option)
 * any later version.  The code is distributed WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE.  See the GNU GPL for more details.
 *
 * As additional permission under GNU GPL version 3 section 7, you
 * may distribute non-source (e.g., minimized or compacted) forms of
 * that code without the copy of the GNU GPL normally required by
 * section 4, provided you include this license notice and a URL
 * through which recipients can access the Corresponding Source.
 *
 * @licend  The above is the entire license notice
 * for the JavaScript code in this page.
 *
 */
;
localplay.objectimporter = (function () {
    var objectimporter = {};
    //
    //
    //
    var editortemplate = '\
        <div id="editor-content"> \
            <canvas id="editor-content-canvas" class="editor-content"></canvas> \
            <canvas id="editor-ui-canvas" class="editor-content"></canvas> \
        </div> \
        <div id="editor-toolbox"> \
            <div id="editor-tools"> \
                <div id="editor-tools-titlebar"> \
                    <b><span id="editor.title"> {{title}} </span></b> \
                </div> \
                <div id="editor-tools-grid"> \
                    <div id="editor.crop" class="editor-tool" style="background-image: url(\'/images/tools/crop.png\');"></div> \
                    <div id="editor.adjust" class="editor-tool" style="background-image: url(\'/images/tools/adjust.png\');"></div> \
                    <div id="editor.draw" class="editor-tool" style="background-image: url(\'/images/tools/pencil.png\');"></div> \
                    <div id="editor.erase" class="editor-tool" style="background-image: url(\'/images/tools/rubber.png\');"></div> \
                    <div id="editor.properties" class="editor-tool" style="background-image: url(\'/images/tools/properties.png\');"></div> \
                </div> \
            </div> \
            <div id="editor-tool-options" content= ""></div> \
        </div> \
        <div id="editor-zoom-control"> \
            <div id="zoom-in" class="editor-tool" style="background-image: url(\'/images/icons/zoom-in.png\');"></div> \
            <div id="zoom-out" class="editor-tool" style="background-image: url(\'/images/icons/zoom-out.png\');"></div> \
            <input id="import-file" type="file" accept="image/*;capture=camera" style="position: absolute; left: -400px; visibility: collapse;" /> \
            <div id="import-button" class="editor-tool" style="background-image: url(\'/images/tools/add-photo.png\');"></div> \
            <div id="upload-button" class="editor-tool" style="display: none; background-image: url(\'/images/tools/upload.png\');"></div> \
        </div> \
    ';
    //
    //
    //
    var croptemplate = ' \
            <p> CROP </p>\
            <p> Drag handles to crop image </p> \
        ';
    var adjusttemplate = ' \
            <p> ADJUST COLOUR </p> \
            <div class="vertical-option-container"> \
                <input class="editor brightness" id="brightness" type= "range" min= "0" max= "1.0" step= "0.01" value=".5" /> \
                <input class="editor contrast" id="contrast" type="range" min="0" max="1.0" step="0.01" value=".5" /> \
                <input class="editor saturation" id="saturation" type="range" min="0" max="1.0" step="0.01" value=".5" /> \
            </div> \
        ';
    var drawtemplate = ' \
            <p> PENCIL </p> \
            <div class="horizontal-option-container"> \
                <div class="pen" data-size="2" style= "width: 5vw; height: 5vw; --size: 0.2;" ></div> \
                <div class="pen" data-size="4" style= "width: 5vw; height: 5vw; --size: 0.4;" ></div> \
                <div class="pen" data-size="8" style= "width: 5vw; height: 5vw; --size: 0.5;" ></div> \
                <div class="pen" data-size="16" style= "width: 5vw; height: 5vw; --size: 0.7;" ></div> \
                <div class="pen" data-size="32" style= "width: 5vw; height: 5vw; --size: 0.9;" ></div> \
            </div> \
        ';
    var erasetemplate =  ' \
            <p> ERASER </p> \
            <div class="horizontal-option-container"> \
                <div class="eraser" data-size="2" style= "width: 5vw; height: 5vw; --size: 0.2;" ></div> \
                <div class="eraser" data-size="4" style= "width: 5vw; height: 5vw; --size: 0.4;" ></div> \
                <div class="eraser" data-size="8" style= "width: 5vw; height: 5vw; --size: 0.5;" ></div> \
                <div class="eraser" data-size="16" style= "width: 5vw; height: 5vw; --size: 0.7;" ></div> \
                <div class="eraser" data-size="32" style= "width: 5vw; height: 5vw; --size: 0.9;" ></div> \
            </div> \
        ';
    var propertiestemplate = ' \
            <p> PROPERTIES </p> \
            <div class="vertical-option-container"> \
                <input class="editor" id="name" type= "text" placeholder= "name"  /> \
                <input class="editor" id="tags" type= "text" placeholder= "tags"  /> \
            </div> \
        ';
    //
    //
    //
    var optiontemplates = {
        crop: croptemplate,
        adjust: adjusttemplate,
        draw: drawtemplate,
        erase: erasetemplate,
        properties: propertiestemplate
    };
    //
    //
    //
    function ObjectImporter( title, type, callback ) {
        var _this = this;
        this.type = type;
        this.callback = callback;
        this.currentTool = "none";
        this.toolFunction = {};
        this.zoom = 1.0;
        //
        // initialise tools
        //
        this.initialiseErase();
        this.initialiseDraw();
        this.initialiseCrop();
        //
        // container
        //
        this.container = document.createElement("div");
        this.container.id = "editor-container";
        this.container.innerHTML = Mustache.render(editortemplate, { title: title });
        //
        //
        //
        window.addEventListener( 'resize', function(e) {
            if ( _this.uicanvas ) {
                _this.uicanvas.width = _this.uicanvas.offsetWidth;
                _this.uicanvas.height = _this.uicanvas.offsetHeight;
                _this.setZoom( _this.zoom );
            }
        }, { passive: true });
        
    }
    //
    //
    //
    ObjectImporter.prototype.initialise = function() {
        var _this = this;
        //
        //
        //
        this.content    = this.container.querySelector('#editor-content');
        this.canvas     = this.content.querySelector('#editor-content-canvas');
        this.uicanvas   = this.content.querySelector('#editor-ui-canvas');
        //
        //
        //
        this.uicanvas.width = _this.uicanvas.offsetWidth;
        this.uicanvas.height = _this.uicanvas.offsetHeight;
        //
        // initialise toolbox
        //
        this.configureTools();
        this.initialiseToolbox();
        //
        // initialise tools
        //
        this.initialiseErase();
        this.initialiseDraw();
        this.createBrush();
        //
        // initialise zoom
        //
        this.zoomControl = this.container.querySelector('#editor-zoom-control');
        if ( this.zoomControl ) {
            var zoomIn = this.zoomControl.querySelector('#zoom-in');
            if( zoomIn ) {
                zoomIn.addEventListener( 'click', function(e) {
                    e.preventDefault();
                    _this.setZoom( _this.zoom * 2.0 );
                     return true;
               });   
            }
            var zoomOut = this.zoomControl.querySelector('#zoom-out');
            if( zoomOut ) {
                zoomOut.addEventListener( 'click', function(e) {
                    e.preventDefault();
                    _this.setZoom( _this.zoom / 2.0 );
                    return true;
                });   
            }
            this.importButton = this.zoomControl.querySelector('#import-button' );  
            if ( this.importButton ) {
                this.importButton.addEventListener( 'click', function(e) {
                    e.preventDefault();
                    if ( _this.importFile ) {
                        _this.importFile.click();
                    }
                    return true;
                });
            }
            this.importFile = this.zoomControl.querySelector('#import-file' ); 
            if ( this.importFile ) {
                this.importFile.addEventListener('change', function(e) {
                    _this.handleFileSelect(e);
                });
            }
            this.uploadButton = this.zoomControl.querySelector('#upload-button');
            if ( this.uploadButton ) {
                this.uploadButton.addEventListener('click', function(e) {
                    //
                    // upload and close
                    //
                    _this.upload();
                });
            }
        }
    }
    //
    //
    //
    ObjectImporter.prototype.handleFileSelect = function (e) {
        var _this = this;
        var files = e.target.files;
        var file = files[0];
        if (file) {
            if (file.type.match('image.*')) {
                var reader = new FileReader();
                reader.addEventListener( 'load', function(e) {
                    var image = new Image();
                    image.addEventListener( 'load', function(e) {
                        var scale = Math.min( 1024/image.naturalWidth, 1024/image.naturalHeight );
                        var canvas = document.createElement('canvas');
                        canvas.width = Math.round( image.naturalWidth * ( scale < 1.0 ? scale : 1.0 ) );   
                        canvas.height = Math.round( image.naturalHeight * ( scale < 1.0 ? scale : 1.0 ) ); 
                        var context = canvas.getContext('2d');
                        context.drawImage(image,0,0,canvas.width,canvas.height);
                        _this.import(canvas);
                    }, { once: true, passive: true } );
                    image.src = e.target.result;
                }, { once: true, passive: true } );
                //
                // read as dataurl
                //
                reader.readAsDataURL(file);
            } else {
                // alert invalid image format
                console.log( 'ObjectImporter.handleFileSelect : unsupported file format : ' + file.type );
            }
        }
    }
    ObjectImporter.prototype.import = function( imageCanvas ) {
        var _this = this;
        //
        // store original data
        //
        this.imageCanvas = imageCanvas;
        //
        // colour adjusted canvas
        //
        var context;
        this.processedImageCanvas = document.createElement('canvas');
        this.processedImageCanvas.width = imageCanvas.width;
        this.processedImageCanvas.height = imageCanvas.height;
        context = this.processedImageCanvas.getContext('2d');
        context.fillRect(0,0,this.processedImageCanvas.width, this.processedImageCanvas.height);
        //
        // mask
        //
        this.mask = document.createElement('canvas');
        this.mask.width = imageCanvas.width;
        this.mask.height = imageCanvas.height;
        context = this.mask.getContext('2d');
        context.fillRect(0,0,this.mask.width,this.mask.height);
        //
        // reset options
        //
        this.options = {
            brightness: 0,
            contrast: 0,
            saturation: 0,
            crop: new Rectangle(0, 0, this.imageCanvas.width, this.imageCanvas.height ),
            mask: localplay.imageprocessor.getAlphaBitMask(this.imageCanvas),
            name: "",
            tags: ""
        };
        //
        // apply colour adjustments
        //
        this.adjustImage();
        //
        // size canvas to fit image
        //
        this.sizeCanvas();
        this.setZoom( 1.0 );
        //
        // hook canvas
        //
        // TODO: shift to UI canvas
        //
        if ( this.canvas || this.uicanvas ) {
            localplay.touch.attach( this.uicanvas || this.canvas, {
                pointerdown : function(p) {
                    if ( _this.toolFunction[ _this.currentTool ] ) {
                        _this.showZoom(false);
                        //p.scale(_this.canvas.width/_this.canvas.offsetWidth);
                        _this.transformToCanvas(p);
                        _this.toolFunction[ _this.currentTool ].pointerdown(p);  
                        return true;
                    }
                    return false;
                },
                pointermove : function(p) {
                    if ( _this.toolFunction[ _this.currentTool ] ) {
                        //p.scale(_this.canvas.width/_this.canvas.offsetWidth);
                        _this.transformToCanvas(p);
                        _this.toolFunction[ _this.currentTool ].pointermove(p);  
                        return true;
                    }
                    return false;
                },
                pointerup : function(p) {
                   if ( _this.toolFunction[ _this.currentTool ] ) {
                        _this.showZoom(true);
                        //p.scale(_this.canvas.width/_this.canvas.offsetWidth);
                        _this.transformToCanvas(p);
                        _this.toolFunction[ _this.currentTool ].pointerup(p);  
                       return true;
                    }
                    return false;
                },
                pointerscroll : function(d) {
                    console.log( 'pointerscroll : ' + d.tostring() );
                    if ( _this.canvas.offsetWidth > _this.content.offsetWidth ) {
                        _this.content.scrollLeft -= d.x;
                    }
                    if ( _this.canvas.offsetHeight > _this.content.offsetHeight ) {
                        _this.content.scrollTop -= d.y;
                    }
                }
            });
            this.draw();
        }
        //
        //
        //
        this.configureTools();
        this.uploadButton.style.display = 'block';
    }
    //
    //
    //
    ObjectImporter.prototype.upload = function () {
        var _this = this;
        //
        // apply crop and mask
        //
        var colourContext = this.processedImageCanvas.getContext('2d');
        var colourPixels = colourContext.getImageData(this.options.crop.x,this.options.crop.y,this.options.crop.width,this.options.crop.height);
        var maskContext = this.mask.getContext('2d');
        var maskPixels = maskContext.getImageData(this.options.crop.x,this.options.crop.y,this.options.crop.width,this.options.crop.height);
        for ( var i = 3; i < colourPixels.data.length; i += 4 ) {
            colourPixels.data[i] = maskPixels.data[i];    
        }
        //
        //
        //
        var uploadCanvas = document.createElement('canvas');
        uploadCanvas.width = this.options.crop.width;
        uploadCanvas.height = this.options.crop.height;
        var uploadContext = uploadCanvas.getContext('2d');
        uploadContext.putImageData(colourPixels,0,0);
        uploadCanvas.toDataURL();
        //
        // upload
        //
        uploadCanvas.toBlob( function(imageBlob) { // convert canvas to blob
            //
            // upload
            //
            var filename = Date.now() + '-' + _this.type + '.png';
            var data = [
                {
                    name: filename,
                    file: imageBlob
                }
            ];
            localplay.upload.upload(data, function(status) {
                if ( status === 'OK' ) {
                    //
                    //
                    //

                    //
                    // create new media entry
                    //
                    var media = {
                        name: _this.options.name,
                        tags: _this.options.tags,
                        type: _this.type,
                        path: 'uploads/' + filename
                    };
                    localplay.datasource.post( '/media', media, {},
                    localplay.datasource.createprogressdialog("Updating database...", 
                            function (e) {
                                _this.close();
                            }));
                } else {
                    // 
                    // TODO: error alert
                    //
                    localplay.dialogbox.alert('Platform','Error uploading');
                }
            } );
        } );
    }
    
    ObjectImporter.prototype.close = function () {
        //
        //
        //
        if ( this.callback ) {
            this.callback();
        }
    }
    //
    //
    //
    ObjectImporter.prototype.configureTools = function () {
        var _this = this;
        var tools = this.container.querySelectorAll('.editor-tool');
        tools.forEach( function( tool ) {
            var selector = tool.id.split('.');
            if ( selector.length >= 2 ) {
                tool.style.visibility = _this.imageCanvas ? 'visible' : 'hidden';   
            }
        });
    }
    //
    //
    //
    ObjectImporter.prototype.sizeCanvas = function () {
        if ( this.canvas && this.imageCanvas && this.content ) {
            //
            //
            //
            if ( this.imageCanvas.width > this.imageCanvas.height ) {
                this.canvas.width = this.imageCanvas.width + 32;
                this.canvas.height = this.canvas.width * ( this.content.offsetHeight / this.content.offsetWidth );
                while ( this.canvas.height < this.imageCanvas.height + 32 ) {
                    this.canvas.width += 8;
                    this.canvas.height += 8;
                }
            } else {
                this.canvas.height = this.imageCanvas.height + 32;
                this.canvas.width = this.canvas.height * ( this.content.offsetWidth / this.content.offsetHeight );
                while ( this.canvas.width < this.imageCanvas.width + 32 ) {
                    this.canvas.width += 8;
                    this.canvas.height += 8;
                }
            }
            //
            //
            //
            this.draw();
        }
    }
    ObjectImporter.prototype.transformToCanvas = function (p) {
        //
        // TODO: add scroll offset
        //
        p.x *= this.canvas.width / this.canvas.offsetWidth;
        p.y *= this.canvas.height / this.canvas.offsetHeight;
    }
    ObjectImporter.prototype.transformFromCanvas = function (p) {
        //
        // TODO: add scroll offset
        //
        p.x /= this.canvas.width / this.canvas.offsetWidth;
        p.y /= this.canvas.height / this.canvas.offsetHeight;
    }
    //
    //
    //
    ObjectImporter.prototype.showZoom = function (show) {
        if ( this.zoomControl ) {
            this.zoomControl.style.visibility = show ? 'visible' : 'hidden';
        }   
    }
    //
    //
    //
    ObjectImporter.prototype.compositeRect = function (x,y,width,height) {
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
        var dstContext = this.canvas.getContext('2d');
        var dstPixels = dstContext.getImageData(targetRect.x, targetRect.y, width, height );
        var imageContext = this.processedImageCanvas.getContext('2d');
        var imagePixels = imageContext.getImageData(Math.round(x),Math.round(y),width,height);
        var maskContext = this.mask.getContext('2d');
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
    
    ObjectImporter.prototype.draw = function () {
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
        // set mask
        //
        /*
        var dstPixels = context.getImageData(Math.round(imageBounds.x),Math.round(imageBounds.y),Math.round(imageBounds.width),Math.round(imageBounds.height));
        var maskPixels = this.mask.getContext('2d').getImageData(0,0,this.mask.width,this.mask.height);
        var imagePixels = this.processedImageCanvas.getContext('2d').getImageData(0,0,this.processedImageCanvas.width,this.processedImageCanvas.height);
        for ( var i = 0; i < dstPixels.data.length; i += 4 ) {
            dstPixels.data[i+0] = imagePixels.data[i+0];
            dstPixels.data[i+1] = imagePixels.data[i+1];
            dstPixels.data[i+2] = imagePixels.data[i+2];
            dstPixels.data[i+3] = maskPixels.data[i+3];
        }
        context.putImageData(dstPixels,Math.round(imageBounds.x),Math.round(imageBounds.y));
        */
        //
        //
        //
        this.compositeRect( 0, 0, imageBounds.width, imageBounds.height );
        //
        // draw ui elements
        //
        this.drawOverlay();

    }
    ObjectImporter.prototype.drawOverlay = function () {
        //
        // draw crop mask
        //
        if ( this.currentTool === 'crop' ) {
            //
            //
            //
            var imageBounds = this.imageBounds();
            //
            // draw handles
            //
            var cropTopLeft = new Point( imageBounds.left() + this.options.crop.left(), imageBounds.top() + this.options.crop.top() );
            var cropBottomRight = new Point( imageBounds.left() + this.options.crop.right(), imageBounds.top() + this.options.crop.bottom() );
            var clearRect = new Rectangle( 0, 0, this.canvas.width, this.canvas.height );
            if ( this.uicanvas ) {
                context = this.uicanvas.getContext('2d');
                context.clearRect(0,0,this.uicanvas.width,this.uicanvas.height);
                this.transformFromCanvas(cropTopLeft);
                this.transformFromCanvas(cropBottomRight);
                clearRect.width = this.uicanvas.width;
                clearRect.height = this.uicanvas.height; 
            }
            var cropHandles = {
                topleft: new Point( cropTopLeft.x - 2, cropTopLeft.y - 2 ),
                topright: new Point( cropBottomRight.x + 2, cropTopLeft.y - 2 ),
                bottomleft: new Point( cropTopLeft.x - 2, cropBottomRight.y + 2 ),
                bottomright: new Point( cropBottomRight.x + 2, cropBottomRight.y + 2 ),
            };
            //
            // mask background
            //
            context.save();
            context.beginPath();
            context.rect( clearRect.x, clearRect.y, clearRect.width, clearRect.height);
            context.rect(cropTopLeft.x, cropTopLeft.y, cropBottomRight.x - cropTopLeft.x, cropBottomRight.y - cropTopLeft.y);
            context.fillStyle = 'rgba(0,0,0,.5)';
            context.fill("evenodd");
            //
            // draw handles
            //
            context.beginPath();
            
            context.moveTo( cropHandles.topleft.x, cropHandles.topleft.y + 8);
            context.lineTo( cropHandles.topleft.x, cropHandles.topleft.y);
            context.lineTo( cropHandles.topleft.x + 8, cropHandles.topleft.y);
            
            context.moveTo( cropHandles.topright.x - 8, cropHandles.topright.y);
            context.lineTo( cropHandles.topright.x, cropHandles.topright.y);
            context.lineTo( cropHandles.topright.x, cropHandles.topright.y + 8);
            
            context.moveTo( cropHandles.bottomright.x, cropHandles. bottomright.y - 8);
            context.lineTo( cropHandles.bottomright.x, cropHandles.bottomright.y);
            context.lineTo( cropHandles.bottomright.x - 8, cropHandles.bottomright.y);
            
            context.moveTo( cropHandles.bottomleft.x + 8, cropHandles. bottomleft.y);
            context.lineTo( cropHandles.bottomleft.x, cropHandles.bottomleft.y);
            context.lineTo( cropHandles.bottomleft.x, cropHandles.bottomleft.y - 8);
            
            context.lineWidth = 2;
            context.strokeStyle = 'white';
            context.stroke();
            context.restore();
        } else {
            context = this.uicanvas.getContext('2d');
            context.clearRect(0,0,this.uicanvas.width,this.uicanvas.height);
        }
    }
    //
    //
    //
    ObjectImporter.prototype.setZoom = function ( factor ) {
        var _this = this;
        if ( factor <= 8.0 && factor >= 1.0 ) {
            this.zoom = factor;
            //
            // 
            //
            var width = ( this.content.offsetWidth * this.zoom );
            var height = ( this.content.offsetHeight * this.zoom );
            this.canvas.style.width = width + 'px';    
            this.canvas.style.height = height + 'px';  
            this.uicanvas.style.width = width + 'px';    
            this.uicanvas.style.height = height + 'px';  
            this.uicanvas.width = Math.round(width);
            this.uicanvas.height = Math.round(height);
            this.uicanvas.addEventListener('transitionend', function(e) {
                _this.content.scrollLeft = ( width - _this.content.offsetWidth ) / 2.0;
                _this.content.scrollTop = ( height - _this.content.offsetHeight ) / 2.0;
                _this.draw();
            });
            /*
            this.content.scrollTop = Math.max( 0, Math.min( this.canvas.offsetHeight - this.content.offsetHeight, scrollTop * this.zoom ) );
            this.content.scrollLeft = Math.max( 0, Math.min( this.canvas.offsetWidth - this.content.offsetWidth, scrollLeft * this.zoom ) );
            */
        }
    }
    //
    //
    //
    ObjectImporter.prototype.imageBounds = function() {
        var size    = new Point( this.imageCanvas.width, this.imageCanvas.height);
        var center  = new Point( this.canvas.width / 2.0, this.canvas.height / 2.0 );
        return new Rectangle( center.x - size.x / 2.0, center.y - size.y / 2.0, size.x, size.y );
    }
    //
    // tools
    //
    ObjectImporter.prototype.createBrush = function() {
        this.eraser = Uint8Array.from({length: this.eraserSize*this.eraserSize}, ()=>0);
        this.pen = Uint8Array.from({length: this.penSize*this.penSize}, ()=>0);
        
        var p = new Point();
        var cp = new Point( this.eraserSize / 2., this.eraserSize / 2. );
        var innerRadius = this.eraserSize / 4.;
        var outerRadius = this.eraserSize / 2.;
        var i;
        for ( p.y = 0, i = 0; p.y < this.eraserSize; p.y++ ) {
            for ( p.x = 0; p.x < this.eraserSize; p.x++, i++ ) {
                var d = cp.distance(p);
                var value = 1.0 - ( ( d - innerRadius ) / ( outerRadius - innerRadius ) );
                this.eraser[i] = Math.max(0,Math.min(255,Math.round(value*255.0)));
            }
        }
        cp = new Point( this.penSize / 2., this.penSize / 2. );
        innerRadius = this.penSize / 4.;
        outerRadius = this.penSize / 2.;
        for ( p.y = 0, i = 0; p.y < this.eraserSize; p.y++ ) {
            for ( p.x = 0; p.x < this.eraserSize; p.x++, i++ ) {
                var d = cp.distance(p);
                var value = 1.0 - ( ( d - innerRadius ) / ( outerRadius - innerRadius ) );
                this.pen[i] = Math.max(0,Math.min(255,Math.round(value*255.0)));
            }
        }
    }
    //
    // erase functions
    //
    ObjectImporter.prototype.initialiseErase = function( ctx, p ) {
        var _this = this;
        this.eraserSize = 32;
        this.eraserPrevious = null;
        this.eraseContext = null;
        this.eraseCurrent = new Point();
        //
        //
        //
        this.toolFunction["erase"] = {
            pointerdown: function(p) {
                var imageBounds = _this.imageBounds();
                _this.eraseCurrent.x = p.x;
                _this.eraseCurrent.y = p.y;
                p.x -= imageBounds.x;
                p.y -= imageBounds.y;
                _this.eraseContext = {
                    source: _this.imageCanvas.getContext('2d'),
                    processed: _this.processedImageCanvas.getContext('2d'),
                    mask: _this.mask.getContext('2d')
                };
                _this.beginErase(_this.eraseContext.mask, p );
                _this.eraserPrevious = p;
                //_this.draw();
                _this.compositeRect(p.x-_this.eraserSize/2, p.y-_this.eraserSize/2,_this.eraserSize,_this.eraserSize);
            },
            pointermove: function(p) {
                _this.eraseCurrent.x = p.x;
                _this.eraseCurrent.y = p.y;
                if ( _this.eraseContext ) {
                    var imageBounds = _this.imageBounds();
                    p.x -= imageBounds.x;
                    p.y -= imageBounds.y;
                    var d = p.subtract(_this.eraserPrevious);
                    if ( false ) {//d > _this.eraserSize / 2 ) {
                           
                    } else {
                        _this.erase(_this.eraseContext.mask, p );
                    }
                    _this.eraserPrevious.set(p.x,p.y);
                }
                //_this.draw();
                _this.compositeRect(p.x-_this.eraserSize/2, p.y-_this.eraserSize/2,_this.eraserSize,_this.eraserSize);
            },
            pointerup: function(p) {
                if ( _this.eraseContext ) {
                    var imageBounds = _this.imageBounds();
                    p.x -= imageBounds.x;
                    p.y -= imageBounds.y;
                    _this.endErase(_this.eraseContext.mask, p );
                    _this.eraseContext = null;
                    _this.eraserPrevious = null;
                    _this.eraserCurrent = null;
                    //_this.draw();
                }
            }
        }
    }
    ObjectImporter.prototype.beginErase = function( ctx, p ) {
        ctx.save();
        this.erase(ctx, p)
    }
    ObjectImporter.prototype.erase = function( ctx, p ) {
        var top = Math.round(p.y - this.eraserSize / 2);
        var left = Math.round(p.x - this.eraserSize / 2);
        var data = ctx.getImageData(left, top, this.eraserSize, this.eraserSize);
        for ( var dst = 3, src = 0; dst < data.data.length; dst += 4, src++ ) {
            data.data[ dst ] = Math.max(0,( data.data[ dst ] - this.eraser[ src ] ));
        }
        ctx.putImageData( data, left, top );
    }
    ObjectImporter.prototype.endErase = function( ctx, p ) {
        ctx.restore();
    }
    //
    // draw functions
    //
    ObjectImporter.prototype.initialiseDraw = function( ctx, p ) {
        var _this = this;
        this.penSize = 32;
        this.drawPrevious = null;
        this.drawContext = null;
        this.penColour = 'rgb(255,255,255)';
        this.drawCurrent = new Point();
        //
        //
        //
        this.toolFunction["draw"] = {
            pointerdown: function(p) {
                var imageBounds = _this.imageBounds();
                _this.drawCurrent.x = p.x;
                _this.drawCurrent.y = p.y;
                p.x -= imageBounds.x;
                p.y -= imageBounds.y;
                _this.drawContext = {
                    source: _this.imageCanvas.getContext('2d'),
                    processed: _this.processedImageCanvas.getContext('2d'),
                    mask: _this.mask.getContext('2d')
                };
                //_this.beginDraw(_this.drawContext.source, p );
                //_this.beginDraw(_this.drawContext.processed, p );
                _this.beginDraw(_this.drawContext.mask, p );
                _this.drawPrevious = p;
                //_this.draw();
                _this.compositeRect(p.x-_this.penSize/2.0, p.y-_this.penSize/2.0, _this.penSize,_this.penSize);
            },
            pointermove: function(p) {
                _this.drawCurrent.x = p.x;
                _this.drawCurrent.y = p.y;
                if ( _this.drawContext ) {
                    var imageBounds = _this.imageBounds();
                    p.x -= imageBounds.x;
                    p.y -= imageBounds.y;
                    //_this.drawPoint(_this.drawContext.source, p );
                    //_this.drawPoint(_this.drawContext.processed, p );
                    _this.drawPoint(_this.drawContext.mask, p );
                    _this.drawPrevious.set(p.x,p.y);
                }
                //_this.draw();
                _this.compositeRect(p.x-_this.penSize/2.0, p.y-_this.penSize/2.0, _this.penSize,_this.penSize);
            },
            pointerup: function(p) {
                if ( _this.drawContext ) {
                    var imageBounds = _this.imageBounds();
                    p.x -= imageBounds.x;
                    p.y -= imageBounds.y;
                    //_this.endDraw(_this.drawContext.source, p );
                    //_this.endDraw(_this.drawContext.processed, p );
                    _this.endDraw(_this.drawContext.mask, p );
                    _this.drawContext = null;
                    _this.drawPrevious = null;
                    //_this.draw();
                }
            }
        }
    }
    ObjectImporter.prototype.beginDraw = function( ctx, p ) {
        ctx.save();
        this.drawPoint(ctx, p)
    }
    ObjectImporter.prototype.drawPoint = function( ctx, p ) {
        var top = Math.round(p.y - this.penSize / 2);
        var left = Math.round(p.x - this.penSize / 2);
        var data = ctx.getImageData(left, top, this.penSize, this.penSize);
        for ( var dst = 3, src = 0; dst < data.data.length; dst += 4, src++ ) {
            data.data[ dst ] = Math.min(255,( data.data[ dst ] + this.pen[ src ] ));
        }
        ctx.putImageData( data, left, top );
        
    }
    ObjectImporter.prototype.endDraw = function( ctx, p ) {
        ctx.restore();
    }
    //
    // crop functions
    //
    ObjectImporter.prototype.initialiseCrop = function( ctx, p ) {
        var _this = this;
        //
        //
        //
        var cropHandle = {
            left   : "left",  
            right  : "right",  
            top    : "top",  
            bottom : "bottom"
            
        };
        var hTrack = "none";
        var vTrack = "none";
        var trackingCrop = false;
        //
        //
        //
        this.toolFunction["crop"] = {
            pointerdown: function(p) {
                var imageBounds = _this.imageBounds();
                var cropBounds = new Rectangle( imageBounds.x + _this.options.crop.x, imageBounds.y + _this.options.crop.y, _this.options.crop.width, _this.options.crop.height );
                var dLeft = Math.abs( cropBounds.left() - p.x );
                var dRight = Math.abs( cropBounds.right() - p.x );
                var hSafe = cropBounds.width / 3;
                hTrack = dLeft > hSafe && dRight > hSafe ? "none" : dLeft < dRight ? "left" : "right";
                var dTop = Math.abs( cropBounds.top() - p.y );
                var dBottom = Math.abs( cropBounds.bottom() - p.y );
                var vSafe = imageBounds.height / 4;
                vTrack = dTop > vSafe && dBottom > vSafe ? "none" : dTop < dBottom ? "top" : "bottom";
                trackingCrop = true;
                _this.toolFunction["crop"].pointermove(p);
            },
            pointermove: function(p) {
                if ( !trackingCrop ) return;
                //var pixelAspect = new Point( _this.canvas.offsetWidth / _this.canvas.width, _this.canvas.offsetHeight / _this.canvas.height );
                //console.log( 'pixel aspect : ' + pixelAspect.tostring() );
                var imageBounds = _this.imageBounds();
                console.log( 'p.x= ' + p.x + ' imageBounds.width=' + imageBounds.width );
                p.x -= imageBounds.x;
                p.y -= imageBounds.y;
                if ( hTrack === "none" && vTrack === "none" && _this.options.crop.contains(p) ) {
                    _this.options.crop.x = Math.max( 0, Math.min( imageBounds.width - _this.options.crop.width, p.x - _this.options.crop.width / 2 ) );
                    _this.options.crop.y = Math.max( 0, Math.min( imageBounds.height - _this.options.crop.height, p.y - _this.options.crop.height / 2 ) );
                } else {
                    switch( hTrack ) {
                        case "left" :
                            var left = Math.max( 0, Math.min( imageBounds.right(), p.x ) );
                            _this.options.crop.width = _this.options.crop.right() - left;
                            _this.options.crop.x = left;
                            break;
                        case "right" :
                            _this.options.crop.width = Math.max( 0, Math.min( imageBounds.width - _this.options.crop.x, p.x - _this.options.crop.x ) );
                            break;
                    } 
                    switch( vTrack ) {
                        case "top" :
                            var top = Math.max( 0, Math.min( _this.options.crop.bottom(), p.y ) );
                            _this.options.crop.height = _this.options.crop.bottom() - top;
                            _this.options.crop.y = top;
                            break;
                        case "bottom" :
                            _this.options.crop.height = Math.max( 0, Math.min( imageBounds.height - _this.options.crop.y, p.y - _this.options.crop.y ) );
                            break;
                    } 
                }
                //_this.draw();
                _this.drawOverlay();
            },
            pointerup: function(p) {
                hTrack = "none";
                vTrack = "none";
                trackingCrop = false;
            }
        };
    }
    //
    // toolbox functions
    //
    ObjectImporter.prototype.initialiseToolbox = function() {
        var _this = this;
        //
        // 
        //
        var toolbox = this.container.querySelector('#editor-tools-grid');
        var tooloptions = this.container.querySelector('#editor-tool-options');
        //
        // hook tools UI
        //
        if ( toolbox && tooloptions ) {
            toolbox.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                var selector = e.target.id;
                var command = selector.split('.');
                if ( command.length >= 2 ) {
                    //
                    // render tool options
                    //
                    if ( optiontemplates[ command[ 1 ] ] ) {
                        tooloptions.innerHTML = Mustache.render(optiontemplates[ command[ 1 ] ], { options: _this.options || {} } );
                    } else {
                        tooloptions.innerHTML = "";
                    }
                    //
                    // initialise tool
                    //
                    _this.selectTool( tooloptions, command[ 1 ] );
                }
                return true;
            });
         }
    }
    ObjectImporter.prototype.selectTool = function( tooloptions, tool ) {
        var _this = this;
        //
        // clean up
        //

        //
        //
        //
        this.currentTool = tool;
        switch( tool ) {
            case 'crop' :
                break;
            case 'adjust' :
                console.log( 'hooking sliders');
                var adjustments = tooloptions.querySelectorAll('input[type=range]');
                adjustments.forEach( function( adjustment ) {
                    var value = ( _this.options[ adjustment.id ] + 255.0 ) / 512.0;
                    adjustment.value = value;
                    console.log( 'hooking slider : ' + adjustment.id);
                    function updateIndicator(e) {
                        console.log( 'setting slider adjustment : ' + adjustment.id + '=' + adjustment.value);
                        adjustment.style.setProperty('--adjustment',adjustment.value);
                        //
                        // apply to edit target item
                        //
                        //adjustment.style.setProperty('--' + adjustment.id, adjustment.value );
                    }
                    adjustment.addEventListener('input', function(e) {
                        updateIndicator(e);
                    });
                    adjustment.addEventListener('change', function(e) {
                        updateIndicator(e);
                        _this.options[e.target.id] = -255 + ( 512 * e.target.value );
                        _this.adjustImage();
                        _this.draw();
                    });                                
                });
                break;
            case 'draw' :
                console.log( 'hooking pens');
                var pens = tooloptions.querySelectorAll('.pen');
                pens.forEach( function(pen) {
                    if ( parseFloat( pen.getAttribute('data-size') ) === _this.penSize ) {
                        pen.classList.add('selected');
                    } else {
                        pen.classList.remove('selected');
                    }
                    function selectPen(e) {
                        var penSize = e.target.getAttribute('data-size');
                        if ( penSize ) {
                            _this.penSize = parseFloat(penSize);
                            _this.createBrush();
                            pens.forEach( function(other) {
                                if ( pen === other ) {
                                    other.classList.add('selected');    
                                } else {
                                    other.classList.remove('selected');    
                                }
                            });
                        }
                    }
                    pen.addEventListener("click", selectPen);
                });
                break
            case 'erase' :
                console.log( 'hooking erasers');
                var erasers = tooloptions.querySelectorAll('.eraser');
                erasers.forEach( function(eraser) {
                    if ( parseFloat( eraser.getAttribute('data-size') ) === _this.eraserSize ) {
                        eraser.classList.add('selected');
                    } else {
                        eraser.classList.remove('selected');
                    }
                    function selectEraser(e) {
                        var eraserSize = e.target.getAttribute('data-size');
                        if ( eraserSize ) {
                            _this.eraserSize = parseFloat(eraserSize);
                            _this.createBrush();
                            erasers.forEach( function(other) {
                                if ( eraser === other ) {
                                    other.classList.add('selected');    
                                } else {
                                    other.classList.remove('selected');    
                                }
                            });
                        }
                    }
                    eraser.addEventListener("click", selectEraser);
                });
                
                var autoErase = tooloptions.querySelector('#auto-erase');
                if ( autoErase ) {
                    autoErase.addEventListener( 'click', function(e) {
                        var processedContext = _this.processedImageCanvas.getContext('2d');
                        var processedData = processedContext.getImageData(0,0,_this.processedImageCanvas.width,_this.processedImageCanvas.height);
                        var maskContext = _this.mask.getContext('2d');
                        var maskData = maskContext.getImageData(0,0,_this.mask.width,_this.mask.height);
                        _this.createMask(processedData,maskData);
                        maskContext.putImageData(maskData,0,0);
                        _this.draw();
                    });
                }
                
                break;
            case 'properties' :
                console.log( 'hooking properties');
                var fields = tooloptions.querySelectorAll('input[type=text]');
                fields.forEach( function(field) {
                     field.addEventListener("change", function(e) {
                         _this.options[e.target.id] = e.target.value;
                     });
                });
                break;
        }
        this.draw();
    }
    ObjectImporter.prototype.createMask = function (colour,mask) {
        //
        // TODO: move this to worker
        //
        var threshold = 32;
        var bpp = 4;
        var rowbytes = bpp * colour.width;
        var pixels = colour.data;
        var alpha = mask.data;
        var seed = [0,0,0];
        var index = 0;
        //
        //
        //
        var test = function (x, y) {
            index = (y * rowbytes) + (x * bpp);
            return ( alpha[index+3] !== 0 && 
                    Math.abs( pixels[index] - seed[ 0 ] ) <= threshold && 
                    Math.abs( pixels[index + 1] - seed[ 1 ] ) <= threshold && 
                    Math.abs( pixels[index + 2] - seed[ 2 ] ) <= threshold);
        }
        var fill = function (x, y) {
            var stack = [];
            stack.push({ x: x, y: y });
            while (stack.length > 0) {
                var p = stack.pop();
                if (!(p.x < 0 || p.x >= colour.width || p.y < 0 || p.y >= colour.height)) {
                    if (test(p.x, p.y)) {
                        index = (p.y * rowbytes) + (p.x * bpp);
                        alpha[index + 3] = 0;
                        stack.push({ x: p.x - 1, y: p.y });
                        stack.push({ x: p.x + 1, y: p.y });
                        stack.push({ x: p.x, y: p.y - 1 });
                        stack.push({ x: p.x, y: p.y + 1 });
                    }
                }
            }
        };
        //
        // scan edges for seed colour
        //
        var x = 0;
        var y = 0;
        //
        // top
        //
        for (x = 0; x < colour.width - 1; x++) {
            index = (y * rowbytes) + (x * bpp);
            seed[ 0 ] = pixels[index];
            seed[ 1 ] = pixels[index+1];
            seed[ 2 ] = pixels[index+2];
            if (test(x, y)) {
                fill(x, y);
            }
        }
        //
        // right
        //
        x = colour.width - 1;
        for (y = 0; y < colour.height - 1; y++) {
            index = (y * rowbytes) + (x * bpp);
            seed[ 0 ] = pixels[index];
            seed[ 1 ] = pixels[index+1];
            seed[ 2 ] = pixels[index+2];
            if (test(x, y)) {
                fill(x, y);
            }
        }
        //
        // bottom
        //
        y = colour.height - 1;
        for (x = 1; x < colour.width; x++) {
            index = (y * rowbytes) + (x * bpp);
            seed[ 0 ] = pixels[index];
            seed[ 1 ] = pixels[index+1];
            seed[ 2 ] = pixels[index+2];
            if (test(x, y)) {
                fill(x, y);
            }
        }
        //
        // left
        //
        x = 0;
        for (y = 1; y < colour.height; y++) {
            index = (y * rowbytes) + (x * bpp);
            seed[ 0 ] = pixels[index];
            seed[ 1 ] = pixels[index+1];
            seed[ 2 ] = pixels[index+2];
            if (test(x, y)) {
                fill(x, y);
            }
        }

    }
    //
    //
    //
    ObjectImporter.prototype.adjustImage = function () {
        //
        // start the worker
        //
        if ( this.options.brightness !== 0 || this.options.contrast !== 0 || this.options.saturation !== 0 ) {
            this.spawnWorker();
            if (this.worker) {
                var b = this.options.brightness;
                var c = this.options.contrast;
                var s = this.options.saturation;
                var blockwidth = this.imageCanvas.width >> 2;
                var blockheight = this.imageCanvas.height >> 2;
                var data = {
                    command: 'block',
                    brightness: b,
                    contrast: c,
                    saturation: s,
                    x: 0,
                    y: 0,
                    width: blockwidth > 0 ? blockwidth : this.imageCanvas.width,
                    height: blockheight > 0 ? blockheight : this.imageCanvas.height
                };
                this.sendBlock(data);
            }
        } else {
            var context = this.processedImageCanvas.getContext('2d');
            context.drawImage( this.imageCanvas, 0, 0 );
        }
    }
    ObjectImporter.prototype.sendBlock = function (data) {
        var context = this.imageCanvas.getContext('2d');
        data.imagedata = context.getImageData(data.x, data.y, data.width, data.height);
        this.worker.postMessage(data);
    }
    ObjectImporter.prototype.spawnWorker = function () {
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
    ObjectImporter.prototype.terminateWorker = function () {
        if (this.worker) {
            this.worker.terminate();
            this.worker = null;
        }
    }
    //
    //
    //
    objectimporter.createobjectimporter = function (title,type,callback) {
        return new ObjectImporter(title,type,callback);
    }
    objectimporter.createobjectimporterdialog = function (title,type,callback) {
        var importer = objectimporter.createobjectimporter(title, type, callback);
        var dialog = localplay.dialogbox.createfullscreendialogbox( title, importer.container, [], [], function() {
            importer.close();   
        });
        importer.initialise();
        dialog.show();
    }
    return objectimporter;
})();
