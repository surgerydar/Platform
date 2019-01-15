/**
 *
 * @source: https://github.com/LocalPlay/PlayYourPlace/tree/master/htdocs/js/localplay.game.thingpropertyeditor.js
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
localplay.game.thingpropertyeditor = (function () {
    var thingpropertyeditor = {};
    //
    //
    //
    var editortemplate = '\
        <div id="editor-content"> \
            <canvas class="editor-content">\
                Your browser doesn\'t support HTML canvas ! \
            </canvas> \
        </div> \
        <div id="editor-toolbox"> \
            <div id="editor-tools"> \
                <div id="editor-tools-titlbar"> \
                    <b> {{title}} </b> \
                </div> \
                <div id="editor-tools-grid"> \
                    <div id="editor.crop" class="editor-tool" style="background-image: url(\'/images/tools/crop.png\');"></div> \
                    <div id="editor.adjust" class="editor-tool" style="background-image: url(\'/images/tools/adjust.png\');"></div> \
                    <div id="editor.draw" class="editor-tool" style="background-image: url(\'/images/tools/pencil.png\');"></div> \
                    <div id="editor.erase" class="editor-tool" style="background-image: url(\'/images/tools/rubber.png\');"></div> \
                </div> \
            </div> \
            <div id="editor-tool-options" content= ""></div> \
        </div> \
    ';
        /* TODO : zoom interface
        <div id="editor-zoom-control" style="position: absolute; left: 0px; bottom: 0px; display: flex; flex-direction: row; background-color: rgba(0,0,0,.5);"> \
            <div id="editor.zoomin" class="editor-tool" style="background-image: url(\'/images/icons/zoom-in.png\');"></div> \
            <div id="editor.zoomout" class="editor-tool" style="background-image: url(\'/images/icons/zoom-out.png\');"></div> \
        </div> \
            */
    //
    //
    //
    var croptemplate = ' \
            <b> CROP </b>\
            <p> Drag handles to crop image </p> \
        ';
    var adjusttemplate = ' \
            <b> ADJUST COLOUR </b> \
            <div class="vertical-option-container"> \
                <input class="editor brightness" id="brightness" type= "range" min= "0" max= "1.0" step= "0.01" value=".5" /> \
                <input class="editor contrast" id="contrast" type="range" min="0" max="1.0" step="0.01" value=".5" /> \
                <input class="editor saturation" id="saturation" type="range" min="0" max="1.0" step="0.01" value=".5" /> \
            </div> \
        ';
    var drawtemplate = ' \
            <b> PENCIL </b> \
            <div class="horizontal-option-container"> \
                <div class="pen" data-size="2" style= "width: calc( 5vw / 16.0 ); height: calc( 5vw / 16.0 ); border-radius: calc( 5vw / 32.0 );" ></div> \
                <div class="pen" data-size="4" style= "width: calc( 5vw / 8.0 ); height: calc( 5vw / 8.0 ); border-radius: calc( 5vw / 16.0 );" ></div> \
                <div class="pen" data-size="8" style= "width: calc( 5vw / 4.0 ); height: calc( 5vw / 4.0 ); border-radius: calc( 5vw / 8.0 );" ></div> \
                <div class="pen" data-size="16" style= "width: calc( 5vw / 2.0 ); height: calc( 5vw / 2.0 ); border-radius: calc( 5vw / 4.0 );" ></div> \
                <div class="pen" data-size="32" style= "width: 5vw; height: 5vw; border-radius: calc( 5vw / 2.0 );" ></div> \
            </div> \
        ';
    var erasetemplate =  ' \
            <b> ERASER </b> \
            <div class="horizontal-option-container"> \
                <div class="eraser" data-size="2" style= "width: calc( 5vw / 16.0 ); height: calc( 5vw / 16.0 ); border-radius: calc( 5vw / 32.0 );" ></div> \
                <div class="eraser" data-size="4" style= "width: calc( 5vw / 8.0 ); height: calc( 5vw / 8.0 ); border-radius: calc( 5vw / 16.0 );" ></div> \
                <div class="eraser" data-size="8" style= "width: calc( 5vw / 4.0 ); height: calc( 5vw / 4.0 ); border-radius: calc( 5vw / 8.0 );" ></div> \
                <div class="eraser" data-size="16" style= "width: calc( 5vw / 2.0 ); height: calc( 5vw / 2.0 ); border-radius: calc( 5vw / 4.0 );" ></div> \
                <div class="eraser" data-size="32" style= "width: calc( 5vw ); height: calc( 5vw ); border-radius: calc( ( 5vw / 2.0 ) - 2px );" ></div> \
            </div> \
        ';
    
    var optiontemplates = {
        crop: croptemplate,
        adjust: adjusttemplate,
        draw: drawtemplate,
        erase: erasetemplate
    };
    //
    //
    //
    function ThingPropertyEditor(item,callback) {
        var _this = this;
        this.item = item;
        if ( !this.item.options ) {
            this.item.options = {
                brightness: 0,
                contrast: 0,
                saturation: 0,
                crop: { x: 0, y: 0, width: item.sprite.image.naturalWidth, height: item.sprite.image.naturalHeight }
            };
        }
        this.callback = callback;
        this.currentTool = "none";
        this.toolFunction = {};
        this.zoom = 1.0;
        //
        //
        //
        var titleBar = document.querySelector('#title-bar');
        var vOffset = 0;
        if ( titleBar ) {
            vOffset = titleBar.offsetTop + titleBar.offsetHeight;
            window.addEventListener('resize', function(e) {
                _this.container.style.paddingTop = ( titleBar.offsetHeight + 16 ) + 'px';
                _this.sizeCanvas();
            });
        }
        //
        // container
        //
        this.container = document.createElement("div");
        this.container.id = "editor-container";
        this.container.style.paddingTop = vOffset + 'px';
        this.container.innerHTML = Mustache.render(editortemplate, { title: "editing " + this.item.type });
    }
    ThingPropertyEditor.prototype.initialise = function() {
        var _this = this;
        this.content = this.container.querySelector('#editor-content');
        this.canvas = this.container.querySelector('canvas');
        //
        // load image into canvas
        //
        var image = this.item.sprite.image;
        this.imageCanvas = document.createElement("canvas");
        this.imageCanvas.width = image.naturalWidth;
        this.imageCanvas.height = image.naturalHeight;
        var context = this.imageCanvas.getContext("2d");
        context.drawImage(image, 0, 0);
        //
        // apply colour adjustments
        //
        this.adjustImage();
        //
        // size canvas to fit image
        //
        this.sizeCanvas();
        //
        // hook canvas
        //
        if ( this.canvas ) {
            localplay.touch.attach( this.canvas, {
                pointerdown : function(p) {
                    if ( _this.toolFunction[ _this.currentTool ] ) {
                        p.scale(_this.canvas.width/_this.canvas.offsetWidth);
                        _this.toolFunction[ _this.currentTool ].pointerdown(p);   
                    }
                },
                pointermove : function(p) {
                    if ( _this.toolFunction[ _this.currentTool ] ) {
                        p.scale(_this.canvas.width/_this.canvas.offsetWidth);
                        _this.toolFunction[ _this.currentTool ].pointermove(p);   
                    }
                },
                pointerup : function(p) {
                   if ( _this.toolFunction[ _this.currentTool ] ) {
                        p.scale(_this.canvas.width/_this.canvas.offsetWidth);
                        _this.toolFunction[ _this.currentTool ].pointerup(p);   
                    }
                },
            });
            this.draw();
        }
        //
        // initialise tools
        //
        this.initialiseErase();
        this.initialiseDraw();
        //
        //
        //
        var toolbox = this.container.querySelector('#editor-tools-grid');
        var tooloptions = this.container.querySelector('#editor-tool-options');
        //
        // hook tools UI
        //
        if ( toolbox && tooloptions ) {
            toolbox.addEventListener(localplay.touchsupport() ? 'touchstart' : 'click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                var selector = e.target.id;
                var command = selector.split('.');
                if ( command.length >= 2 ) {
                    //
                    // render tool options
                    //
                    if ( optiontemplates[ command[ 1 ] ] ) {
                        tooloptions.innerHTML = Mustache.render(optiontemplates[ command[ 1 ] ], { options: _this.item.options || {} } );
                    }
                    //
                    // initialise tool
                    //
                    _this.currentTool = command[ 1 ];
                    switch( _this.currentTool ) {
                        case 'crop' :
                            break;
                        case 'adjust' :
                            console.log( 'hooking sliders');
                            var adjustments = tooloptions.querySelectorAll('input[type=range]');
                            adjustments.forEach( function( adjustment ) {
                                var value = ( _this.item.options[ adjustment.id ] + 255.0 ) / 512.0;
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
                                    _this.item.options[e.target.id] = -255 + ( 512 * e.target.value );
                                    _this.adjustImage();
                                    _this.draw();
                                });                                
                            });
                            break;
                        case 'draw' :
                            console.log( 'hooking pens');
                            var pens = tooloptions.querySelectorAll('.pen');
                            pens.forEach( function(pen) {
                                if ( parseFloat( pen.getAttribute('data-size') ) === _this.penRadius ) {
                                    pen.classList.add('selected');
                                } else {
                                    pen.classList.remove('selected');
                                }
                                function selectPen(e) {
                                    var penSize = e.target.getAttribute('data-size');
                                    if ( penSize ) {
                                        _this.penRadius = parseFloat(penSize);
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
                                if ( parseFloat( eraser.getAttribute('data-size') ) === _this.eraserRadius ) {
                                    eraser.classList.add('selected');
                                } else {
                                    eraser.classList.remove('selected');
                                }
                                function selectEraser(e) {
                                    var eraserSize = e.target.getAttribute('data-size');
                                    if ( eraserSize ) {
                                        _this.eraserRadius = parseFloat(eraserSize);
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
                            break;
                    }
                }
                return true;
            });
         }
        //
        // initialise zoom
        //
        var zoomIn = this.container.querySelector('#editor\\.zoomin');
        if( zoomIn ) {
            zoomIn.addEventListener( localplay.touchsupport() ? "touchstart" : "mousedown", function(e) {
                e.preventDefault();
                _this.setZoom( _this.zoom * 1.5 );
            });   
        }
        var zoomOut = this.container.querySelector('#editor\\.zoomout');
        if( zoomOut ) {
            zoomOut.addEventListener( localplay.touchsupport() ? "touchstart" : "mousedown", function(e) {
                e.preventDefault();
                _this.setZoom( _this.zoom / 1.5 );
            });   
        }
        //
        //
        //
        
    }
    //
    //
    //
    ThingPropertyEditor.prototype.close = function () {
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
    ThingPropertyEditor.prototype.update = function () {
    }
    //
    //
    //
    ThingPropertyEditor.prototype.sizeCanvas = function () {
        if ( this.canvas && this.imageCanvas && this.content ) {
            /*
            var dWidth = this.imageCanvas.width - this.content.offsetWidth;
            var dHeight = this.imageCanvas.height - this.content.offsetHeight;
            if ( dWidth > dHeight ) {
                this.canvas.width = this.imageCanvas.width + 32;
                this.canvas.height = this.canvas.width * ( this.content.offsetHeight / this.content.offsetWidth );
            } else {
                this.canvas.height = this.imageCanvas.height + 32;
                this.canvas.width = this.canvas.height * ( this.content.offsetWidth / this.content.offsetHeight );
            }
            */
            if ( this.imageCanvas.width > this.imageCanvas.height ) {
                this.canvas.width = this.imageCanvas.width + 32;
                this.canvas.height = this.canvas.width * ( this.content.offsetHeight / this.content.offsetWidth );
            } else {
                this.canvas.height = this.imageCanvas.height + 32;
                this.canvas.width = this.canvas.height * ( this.content.offsetWidth / this.content.offsetHeight );
            }
            //
            //
            //
            this.draw();
        }
    }
    ThingPropertyEditor.prototype.adjustImage = function () {
        if ( !this.processedImageCanvas ) {
            this.processedImageCanvas = document.createElement("canvas");
            this.processedImageCanvas.width = this.imageCanvas.width;
            this.processedImageCanvas.height = this.imageCanvas.height;
        }   
        if ( this.item.options.brightness !== 0 || this.item.options.contrast !== 0 || this.item.options.saturation !== 0 ) {
            /*
            localplay.imageprocessor.adjust(this.imageCanvas,this.processedImageCanvas, this.item.options.brightness, this.item.options.contrast, this.item.options.saturation );
            */
            console.log( 'adjusting image : b=' + this.item.options.brightness + ' : c=' + this.item.options.contrast );
            localplay.imageprocessor.adjust(this.imageCanvas,this.processedImageCanvas, this.item.options.brightness, this.item.options.contrast, this.item.options.saturation );
        } else {
            var context = this.processedImageCanvas.getContext("2d");
            context.drawImage(this.imageCanvas,0,0);
        }
    }
    //
    //
    //
    ThingPropertyEditor.prototype.draw = function () {
        if ( !this.canvas ) return;
        //
        //
        //
        var imageBounds = this.imageBounds();
        //
        //
        //
        var context = this.canvas.getContext("2d");
        context.clearRect(0,0,this.canvas.width,this.canvas.height);
        //
        // draw image
        //
        context.drawImage(this.processedImageCanvas, imageBounds.x, imageBounds.y, imageBounds.width, imageBounds.height);
        //
        // draw crop mask
        //
        context.save();
        context.beginPath();
        context.rect( 0, 0, this.canvas.width,this.canvas.height);
        context.rect(imageBounds.x, imageBounds.y, imageBounds.width, imageBounds.height);
        context.fillStyle = 'rgba(0,0,0,.5)';
        context.fill("evenodd");
        context.restore();
    }
    //
    //
    //
    ThingPropertyEditor.prototype.setZoom = function ( factor ) {
        if ( factor < 4.0 && factor > 0.25 ) {
            this.zoom = factor;
            this.canvas.style.width = ( this.canvas.width * this.zoom ) + 'px';    
            this.canvas.style.height = ( this.canvas.height * this.zoom ) + 'px';    
        }
    }
    //
    //
    //
    ThingPropertyEditor.prototype.imageBounds = function() {
        var size            = new Point( this.imageCanvas.width, this.imageCanvas.height);
        //var position        = new Point( this.canvas.offsetWidth / 2.0, this.canvas.offsetHeight / 2.0 );
        var position        = new Point( this.canvas.width / 2.0, this.canvas.height / 2.0 );
        return new Rectangle( position.x - size.x / 2.0, position.y - size.y / 2.0, size.x, size.y );
    }
    //
    // erase functions
    //
    ThingPropertyEditor.prototype.initialiseErase = function( ctx, p ) {
        var _this = this;
        this.eraserRadius = 4.;
        this.eraserPrevious = null;
        this.eraseContext = null;
        //
        //
        //
        this.toolFunction["erase"] = {
            pointerdown: function(p) {
                var imageBounds = _this.imageBounds();
                p.x -= imageBounds.x;
                p.y -= imageBounds.y;
                _this.eraseContext = {
                    source: _this.imageCanvas.getContext("2d"),
                    processed: _this.processedImageCanvas.getContext("2d"),
                };
                _this.beginErase(_this.eraseContext.source, p );
                _this.beginErase(_this.eraseContext.processed, p );
                _this.eraserPrevious = p;
            },
            pointermove: function(p) {
                if ( _this.eraseContext ) {
                    var imageBounds = _this.imageBounds();
                    p.x -= imageBounds.x;
                    p.y -= imageBounds.y;
                    
                    console.log( 'canvas scale : ' + ( _this.canvas.width / _this.canvas.offsetWidth ) );
                    _this.erase(_this.eraseContext.source, p );
                    _this.erase(_this.eraseContext.processed, p );
                    _this.eraserPrevious.set(p.x,p.y);
                }
            },
            pointerup: function(p) {
                if ( _this.eraseContext ) {
                    var imageBounds = _this.imageBounds();
                    p.x -= imageBounds.x;
                    p.y -= imageBounds.y;
                    _this.endErase(_this.eraseContext.source, p );
                    _this.endErase(_this.eraseContext.processed, p );
                    _this.eraseContext = null;
                    _this.eraserPrevious = null;
                }
            }
        }
    }
    ThingPropertyEditor.prototype.beginErase = function( ctx, p ) {
        ctx.save();
        this.erase(ctx, p)
    }
    ThingPropertyEditor.prototype.erase = function( ctx, p ) {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(p.x, p.y, this.eraserRadius / 2, 0, 2 * Math.PI);
        ctx.fill();
        if ( this.eraserPrevious ) {
            ctx.lineWidth = this.eraserRadius;
            ctx.beginPath();
            ctx.moveTo(this.eraserPrevious.x,this.eraserPrevious.y);
            ctx.lineTo(p.x, p.y);
            ctx.stroke();
        } 
        this.draw();
    }
    ThingPropertyEditor.prototype.endErase = function( ctx, p ) {
        ctx.restore();
    }
    //
    // draw functions
    //
    ThingPropertyEditor.prototype.initialiseDraw = function( ctx, p ) {
        var _this = this;
        this.eraserRadius = 4.;
        this.eraserPrevious = null;
        this.eraseContext = null;
        //
        //
        //
        this.toolFunction["draw"] = {
            pointerdown: function(p) {
                var imageBounds = _this.imageBounds();
                p.x -= imageBounds.x;
                p.y -= imageBounds.y;
                _this.drawContext = {
                    source: _this.imageCanvas.getContext("2d"),
                    processed: _this.processedImageCanvas.getContext("2d"),
                };
                _this.beginDraw(_this.drawContext.source, p );
                _this.beginDraw(_this.drawContext.processed, p );
                _this.drawPrevious = p;
            },
            pointermove: function(p) {
                if ( _this.eraseContext ) {
                    var imageBounds = _this.imageBounds();
                    p.x -= imageBounds.x;
                    p.y -= imageBounds.y;
                    _this.drawPoint(_this.drawContext.source, p );
                    _this.drawPoint(_this.drawContext.processed, p );
                    _this.drawPrevious.set(p.x,p.y);
                }
            },
            pointerup: function(p) {
                if ( _this.eraseContext ) {
                    var imageBounds = _this.imageBounds();
                    p.x -= imageBounds.x;
                    p.y -= imageBounds.y;
                    _this.endDraw(_this.eraseContext.source, p );
                    _this.endDraw(_this.eraseContext.processed, p );
                    _this.drawContext = null;
                    _this.drawPrevious = null;
                }
            }
        }
    }
    ThingPropertyEditor.prototype.beginDraw = function( ctx, p ) {
        ctx.save();
        this.drawPoint(ctx, p)
    }
    ThingPropertyEditor.prototype.drawPoint = function( ctx, p ) {
        //ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(p.x, p.y, this.eraserRadius / 2, 0, 2 * Math.PI);
        ctx.fill();
        if ( this.drawPrevious ) {
            ctx.lineWidth = this.eraserRadius;
            ctx.beginPath();
            ctx.moveTo(this.eraserPrevious.x,this.eraserPrevious.y);
            ctx.lineTo(p.x, p.y);
            ctx.stroke();
        } 
        this.draw();
    }
    ThingPropertyEditor.prototype.endDraw = function( ctx, p ) {
        ctx.restore();
    }
    //
    //
    //
    thingpropertyeditor.createthingpropertyeditor = function (item,callback) {
        return new ThingPropertyEditor(item,callback);
    }
    return thingpropertyeditor;
})();
