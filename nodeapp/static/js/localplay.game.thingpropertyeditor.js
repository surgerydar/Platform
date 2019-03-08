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
/*eslint-env browser*/
/*global localplay*/
localplay.game.thingpropertyeditor = (function () {
    var thingpropertyeditor = {};
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
                    <h1 id="editor.title" style="font-size: 3vw;">{{title}}</h1> \
                    <img id="editor-tools-close" src="/images/close.png" style="height: 4vw;" /> \
                </div> \
                <div id="editor-tools-grid"> \
                    <div id="editor.crop" class="editor-tool" style="background-image: url(\'/images/tools/crop.png\');"></div> \
                    <div id="editor.adjust" class="editor-tool" style="background-image: url(\'/images/tools/adjust.png\');"></div> \
                    <div id="editor.erase" class="editor-tool" style="background-image: url(\'/images/tools/erase.png\');"></div> \
                    <div id="editor.restore" class="editor-tool" style="background-image: url(\'/images/tools/unerase.png\');"></div> \
                    <div id="editor.behaviour" class="editor-tool" style="background-image: url(\'/images/tools/movement.png\');"></div> \
                    <div id="editor.audio" class="editor-tool" style="background-image: url(\'/images/tools/sound.png\');"></div> \
                    <div id="editor.properties" class="editor-tool" style="background-image: url(\'/images/tools/properties.png\');"></div> \
                    <div id="editor.avatar" class="editor-tool" style="background-image: url(\'/images/tools/properties.png\');"></div> \
                </div> \
            </div> \
            <div id="editor-tool-options" content= ""></div> \
        </div> \
        <div id="editor-zoom-control"> \
            <div id="zoomin" class="editor-tool" style="background-image: url(\'/images/tools/zoom-in.png\');"></div> \
            <div id="zoomout" class="editor-tool" style="background-image: url(\'/images/tools/zoom-out.png\');"></div> \
        </div> \
    ';
    //
    //
    //
    var croptemplate = ' \
            <h1 style="font-size: 2vw;">CROP</h1> \
            <p> Drag handles to crop image </p> \
        ';
    var adjusttemplate = ' \
            <h1 style="font-size: 2vw;">ADJUST COLOUR</h1> \
            <div class="vertical-option-container"> \
                <input class="editor brightness" id="brightness" type= "range" min= "0" max= "1.0" step= "0.01" value=".5" /> \
                <input class="editor contrast" id="contrast" type="range" min="0" max="1.0" step="0.01" value=".5" /> \
                <input class="editor saturation" id="saturation" type="range" min="0" max="1.0" step="0.01" value=".5" /> \
            </div> \
        ';
    var restoretemplate = ' \
            <h1 style="font-size: 2vw;">RESTORE</h1> \
            <div class="horizontal-option-container"> \
                <div class="pen" data-size="2" style= "width: 5vw; height: 5vw; --size: 0.2;" ></div> \
                <div class="pen" data-size="4" style= "width: 5vw; height: 5vw; --size: 0.4;" ></div> \
                <div class="pen" data-size="8" style= "width: 5vw; height: 5vw; --size: 0.5;" ></div> \
                <div class="pen" data-size="16" style= "width: 5vw; height: 5vw; --size: 0.7;" ></div> \
                <div class="pen" data-size="32" style= "width: 5vw; height: 5vw; --size: 0.9;" ></div> \
            </div> \
        ';
    var erasetemplate =  ' \
            <h1 style="font-size: 2vw;">MASK</h1> \
            <div class="horizontal-option-container"> \
                <div class="eraser" data-size="2" style= "width: 5vw; height: 5vw; --size: 0.2;" ></div> \
                <div class="eraser" data-size="4" style= "width: 5vw; height: 5vw; --size: 0.4;" ></div> \
                <div class="eraser" data-size="8" style= "width: 5vw; height: 5vw; --size: 0.5;" ></div> \
                <div class="eraser" data-size="16" style= "width: 5vw; height: 5vw; --size: 0.7;" ></div> \
                <div class="eraser" data-size="32" style= "width: 5vw; height: 5vw; --size: 0.9;" ></div> \
            </div> \
            <input class="editor" id="auto-threshold" type="range" min="0" max="80" step="1" value="0" /> \
        ';
    var behaviourtemplate = ' \
            <h1 style="font-size: 2vw;">MOVEMENT</h1> \
            <div class="vertical-option-container" style="padding-right: 5vw">  \
                <h1 style="font-size: 1vw;">LEFT/RIGHT</h1> \
                <div> \
                    <input id="leftright.onedirection" class="editor" type="checkbox" name="item.property.behaviour.leftright.onedirection"/> \
                    <label for="leftright.onedirection"></label>&nbsp;one direction<p/> \
                </div> \
                <input id="leftright.extent" type="range" class="editor horizontal-movement" min= "0" max= "1.0" step= "0.01" value="0"/> \
                <input id="leftright.duration" type="range" class="editor duration" min= "0" max= "1.0" step= "0.01" value="0"/> \
                <input id="leftright.starttime" type="range" class="editor starttime" min= "0" max= "1.0" step= "0.01" value="0"/> \
                <h1 style="font-size: 1vw;">UP/DOWN</h1> \
                <div> \
                    <input id="updown.onedirection" class="editor" type="checkbox" name="item.property.behaviour.updown.onedirection"/> \
                    <label for="onedirection"></label>&nbsp;one direction<p/> \
                </div> \
                <input id="updown.extent" type="range"  class="editor vertical-movement" min= "0" max= "1.0" step= "0.01" value="0" /> \
                <input id="updown.duration" type="range"  class="editor duration" min= "0" max= "1.0" step= "0.01" value="0" /> \
                <input id="updown.starttime" type="range" class="editor starttime" min= "0" max= "1.0" step= "0.01" value="0" /> \
            </div> \
    ';
    var audiotemplate = ' \
            <h1 style="font-size: 2vw;">COLLISION SOUND</h1> \
            <audio id="collision-audio" editable="true"></audio> \
    ';
    var avatartemplate = ' \
            <h1 style="font-size: 2vw;">PROPERTIES</h1> \
            <div class="vertical-option-container">  \
                <div id="avatar.image" class="horizontal-option-container" style="margin-left: 0px; align-self: stretch;"> \
                    <img class="editor-button" src="/images/tools/change-image.png" />&nbsp;Change image \
                </div> \
                <input id="avatar.weight" type="range" class="editor weight" min= "0" max= "1.0" step= "0.01" value="0.5"/> \
                <div id="image.resetweight" class="horizontal-option-container" style="margin-left: 0px; align-self: stretch;"> \
                    <img class="editor-button" src="/images/tools/reset-weight.png" />&nbsp;Reset weight \
                </div> \
           </div> \
    ';
    var propertiestemplate = ' \
            <h1 style="font-size: 2vw;">TYPE</h1> \
            <div class="vertical-option-container">  \
                <div> \
                    <input type="radio" id="layout.goal" class="editor" name="layout.type" value="goal"><label for="layout.goal"></label>Goal<br/> \
                </div> \
                <div> \
                    <input type="radio" id="layout.obstacle" class="editor" name="layout.type" value="obstacle"><label for="layout.obstacle"></label>Obstacle<br/> \
                </div> \
                <div> \
                    <input type="radio" id="layout.pickup" class="editor" name="layout.type" value="pickup"><label for="layout.pickup"></label>Pickup<br/> \
                </div> \
                <div> \
                    <input type="radio" id="layout.platform" class="editor" name="layout.type"  value="platform" checked="true"><label for="layout.platform"></label>Platform<br/> \
                </div> \
                <div> \
                    <input type="radio" id="layout.prop" class="editor" value="prop" name="layout.type"><label for="layout.prop"></label>Prop<br/> \
                </div> \
            </div> \
    ';
    //
    //
    //
    var optiontemplates = {
        crop: croptemplate,
        adjust: adjusttemplate,
        restore: restoretemplate,
        erase: erasetemplate,
        behaviour: behaviourtemplate,
        audio: audiotemplate,
        properties: propertiestemplate,
        avatar: avatartemplate
    };
    //
    //
    //
    function ThingPropertyEditor(item,callback) {
        var _this = this;
        this.item = item;
        if ( item.options ) {
            this.options = {
                brightness: item.options.brightness,
                contrast: item.options.contrast,
                saturation: item.options.saturation,
                crop: new Rectangle(item.options.crop.x, item.options.crop.y, item.options.crop.width, item.options.crop.height ),
                mask: item.options.mask
            };
        } else {
            this.options = {
                brightness: 0,
                contrast: 0,
                saturation: 0,
                crop: new Rectangle(0, 0, item.sprite.image.naturalWidth, item.sprite.image.naturalHeight )
            };
        }
        this.callback = callback;
        this.currentTool = "none";
        this.toolFunction = {};
        this.zoom = 1.0;
        this.title = "edit " + this.item.type;
        //
        //
        //
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
        this.container.innerHTML = Mustache.render(editortemplate, { title: this.title });
        //
        //
        //
        window.addEventListener( 'resize', function(e) {
            if ( _this.uicanvas ) {
                _this.uicanvas.width    = _this.uicanvas.offsetWidth;
                _this.uicanvas.height   = _this.uicanvas.offsetHeight;
                _this.sizeCanvas();
                _this.setZoom( _this.zoom );
            }
        }, { passive: true });
    }
    //
    //
    //
    ThingPropertyEditor.prototype.initialise = function() {
        var _this = this;
        //
        //
        //
        this.configureTools();
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
        localplay.touch.attach( this.uicanvas, {
            pointerdown : function(p) {
                if ( _this.toolFunction[ _this.currentTool ] ) {
                    _this.showZoom(false);
                    //p.scale(_this.canvas.width/_this.canvas.offsetWidth);
                    _this.imageEditor.transformToCanvas(p);
                    _this.toolFunction[ _this.currentTool ].pointerdown(p);  
                    return true;
                }
                return false;
            },
            pointermove : function(p) {
                if ( _this.toolFunction[ _this.currentTool ] ) {
                    //p.scale(_this.canvas.width/_this.canvas.offsetWidth);
                    _this.imageEditor.transformToCanvas(p);
                    _this.toolFunction[ _this.currentTool ].pointermove(p);  
                    return true;
                }
                return false;
            },
            pointerup : function(p) {
               if ( _this.toolFunction[ _this.currentTool ] ) {
                    _this.showZoom(true);
                    //p.scale(_this.canvas.width/_this.canvas.offsetWidth);
                    _this.imageEditor.transformToCanvas(p);
                    _this.toolFunction[ _this.currentTool ].pointerup(p);  
                   return true;
                }
                return false;
            },
            pointerscroll : function(d) {
                //console.log( 'pointerscroll : ' + d.tostring() );
                if ( _this.canvas.offsetWidth > _this.content.offsetWidth ) {
                    _this.content.scrollLeft -= d.x;
                }
                if ( _this.canvas.offsetHeight > _this.content.offsetHeight ) {
                    _this.content.scrollTop -= d.y;
                }
            }
        });
        //
        // load image into canvas
        //
        var image = this.item.sprite.image;
        //
        // colour image
        //
        this.imageCanvas = document.createElement("canvas");
        this.imageCanvas.width = image.naturalWidth;
        this.imageCanvas.height = image.naturalHeight;
        context = this.imageCanvas.getContext("2d");
        context.drawImage(image, 0, 0);
        //
        // processed image
        //
        this.processedImageCanvas = document.createElement("canvas");
        this.processedImageCanvas.width = image.naturalWidth;
        this.processedImageCanvas.height = image.naturalHeight;
        context = this.processedImageCanvas.getContext("2d");
        context.drawImage(image, 0, 0);
        //
        // mask
        //
        if ( !this.options.mask ) {
            this.options.mask = localplay.imageprocessor.getAlphaBitMask(this.imageCanvas);
        }
        this.maskCanvas = document.createElement("canvas");
        this.maskCanvas.width = image.naturalWidth;
        this.maskCanvas.height = image.naturalHeight;
        context = this.maskCanvas.getContext("2d");
        context.fillRect(0,0,this.maskCanvas.width,this.maskCanvas.height);
        localplay.imageprocessor.applyAlphaBitMask( this.maskCanvas, this.maskCanvas, this.options.mask );
        //
        // create image editor
        //
        if ( this.imageEditor ) {
            this.imageEditor.terminateWorker();
            delete this.imageEditor;
        }
        this.imageEditor = new ImageEditor(this.imageCanvas,this.processedImageCanvas,this.maskCanvas,this.canvas);
        //
        // adjust image
        //
        this.adjustImage();
        //
        // size canvas to fit image
        //
        this.sizeCanvas();
        this.setZoom( 1.0 );
        //
        // initialise toolbox
        //
        this.initialiseToolbox();
        //
        // initialise zoom
        //
        this.zoomControl = this.container.querySelector('#editor-zoom-control');
        if ( this.zoomControl ) {
            var zoomIn = this.zoomControl.querySelector('#zoomin');
            if( zoomIn ) {
                zoomIn.addEventListener( localplay.touchsupport() ? "touchstart" : "mousedown", function(e) {
                    e.preventDefault();
                    _this.setZoom( _this.zoom * 2.0 );
                });   
            }
            var zoomOut = this.zoomControl.querySelector('#zoomout');
            if( zoomOut ) {
                zoomOut.addEventListener( localplay.touchsupport() ? "touchstart" : "mousedown", function(e) {
                    e.preventDefault();
                    _this.setZoom( _this.zoom / 2.0 );
                });   
            }
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
        // create image mask
        //
        this.options.mask = localplay.imageprocessor.getAlphaBitMask( this.maskCanvas );
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
    ThingPropertyEditor.prototype.configureTools = function () {
        //
        // hide invalid tools
        //
        var hide = [];
        switch( this.item.type ) {
            case 'avatar' :
                hide = ['behaviour','audio','properties'];
                break;
            case 'prop' :
                hide = ['behaviour','audio','avatar'];
                break;
            default:
                hide = ['avatar'];
                break;
        }
        //
        //
        //
        var tools = this.container.querySelectorAll('.editor-tool');
        tools.forEach( function( tool ) {
            var selector = tool.id.split('.');
            if ( selector.length >= 2 ) {
                tool.style.visibility = hide.indexOf(selector[1]) >= 0 ? 'hidden' : 'visible';   
            }
        });
    }
    //
    //
    //
    ThingPropertyEditor.prototype.sizeCanvas = function () {
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
            this.imageEditor.draw();
        }
    }

    ThingPropertyEditor.prototype.adjustImage = function () {
        this.imageEditor.setAdjustments(
            this.options.brightness,
            this.options.contrast,
            this.options.saturation);
    }
    ThingPropertyEditor.prototype.showZoom = function (show) {
        if ( this.zoomControl ) {
            this.zoomControl.style.visibility = show ? 'visible' : 'hidden';
        }   
    }
    
    ThingPropertyEditor.prototype.drawOverlay = function () {
        //
        // draw crop mask
        //
        if ( this.currentTool === 'crop' ) {
            //
            //
            //
            var imageBounds = this.imageEditor.imageBounds();
            //
            // draw handles
            //
            var cropTopLeft = new Point( imageBounds.left() + this.options.crop.left(), imageBounds.top() + this.options.crop.top() );
            var cropBottomRight = new Point( imageBounds.left() + this.options.crop.right(), imageBounds.top() + this.options.crop.bottom() );
            var clearRect = new Rectangle( 0, 0, this.canvas.width, this.canvas.height );
            if ( this.uicanvas ) {
                context = this.uicanvas.getContext('2d');
                context.clearRect(0,0,this.uicanvas.width,this.uicanvas.height);
                this.imageEditor.transformFromCanvas(cropTopLeft);
                this.imageEditor.transformFromCanvas(cropBottomRight);
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
    ThingPropertyEditor.prototype.setZoom = function ( factor ) {
        var _this = this;
        if ( factor <= 8.0 && factor >= 1.0 ) {
            this.zoom = factor;
            //
            //
            //
            this.uicanvas.addEventListener('transitionend', function(e) {
                _this.content.scrollLeft = ( _this.canvas.offsetWidth - _this.content.offsetWidth ) / 2 + _this.canvas.offsetWidth * offset.x;
                _this.content.scrollTop = ( _this.canvas.offsetHeight - _this.content.offsetHeight ) / 2 + _this.canvas.offsetHeight * offset.y;
                if ( _this.imageEditor ) _this.imageEditor.draw();
                _this.drawOverlay();
            }, { once: true } );
            //
            // 
            //
            var offset = new Point( 
                ( this.content.offsetWidth / 2 - ( this.canvas.offsetWidth / 2 - this.content.scrollLeft ) ) / this.canvas.offsetWidth, 
                ( this.content.offsetHeight / 2 - ( this.canvas.offsetHeight / 2 - this.content.scrollTop ) ) / this.canvas.offsetHeight 
            );
            var width = ( this.content.offsetWidth * this.zoom );
            var height = ( this.content.offsetHeight * this.zoom );
            this.canvas.style.width = width + 'px';    
            this.canvas.style.height = height + 'px';  
            this.uicanvas.style.width = width + 'px';    
            this.uicanvas.style.height = height + 'px';  
            this.uicanvas.width = Math.round(width);
            this.uicanvas.height = Math.round(height);
        }
    }
    //
    //
    //
    ThingPropertyEditor.prototype.imageBounds = function() {
        var size    = new Point( this.imageCanvas.width, this.imageCanvas.height);
        var center  = new Point( this.canvas.width / 2.0, this.canvas.height / 2.0 );
        return new Rectangle( center.x - size.x / 2.0, center.y - size.y / 2.0, size.x, size.y );
    }
    //
    // erase
    //
    ThingPropertyEditor.prototype.initialiseErase = function() {
        var _this = this;
        this.eraserSize = 32;
        //
        //
        //
        this.toolFunction['erase'] = {
            pointerdown: function(p) {
                var imageBounds = _this.imageEditor.imageBounds();
                p.x -= imageBounds.x;
                p.y -= imageBounds.y;
                _this.imageEditor.penDown(p.x,p.y,_this.eraserSize/2,true);
            },
            pointermove: function(p) {
                var imageBounds = _this.imageEditor.imageBounds();
                p.x -= imageBounds.x;
                p.y -= imageBounds.y;
                _this.imageEditor.penMove(p.x,p.y);
            },
            pointerup: function(p) {
                var imageBounds = _this.imageEditor.imageBounds();
                p.x -= imageBounds.x;
                p.y -= imageBounds.y;
                _this.imageEditor.penUp(p.x,p.y);
            }
        }
    }
    //
    // restore functions
    //
    ThingPropertyEditor.prototype.initialiseDraw = function() {
        var _this = this;
        this.penSize = 32;
        //
        //
        //
        this.toolFunction['restore'] = {
            pointerdown: function(p) {
                var imageBounds = _this.imageEditor.imageBounds();
                p.x -= imageBounds.x;
                p.y -= imageBounds.y;
                _this.imageEditor.penDown(p.x,p.y,_this.penSize/2,false);
            },
            pointermove: function(p) {
                var imageBounds = _this.imageEditor.imageBounds();
                p.x -= imageBounds.x;
                p.y -= imageBounds.y;
                _this.imageEditor.penMove(p.x,p.y);
            },
            pointerup: function(p) {
                var imageBounds = _this.imageEditor.imageBounds();
                p.x -= imageBounds.x;
                p.y -= imageBounds.y;
                _this.imageEditor.penUp(p.x,p.y);
            }
        }
    }
    //
    // crop functions
    //
    ThingPropertyEditor.prototype.initialiseCrop = function() {
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
        this.toolFunction['crop'] = {
            pointerdown: function(p) {
                var imageBounds = _this.imageEditor.imageBounds();
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
                var imageBounds = _this.imageEditor.imageBounds();
                //console.log( 'p.x= ' + p.x + ' imageBounds.width=' + imageBounds.width );
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
                //_this.imageEditor.draw();
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
    ThingPropertyEditor.prototype.initialiseToolbox = function() {
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
                    // update selected indicator
                    //
                    var tools = toolbox.querySelectorAll('.editor-tool');
                    tools.forEach( function(tool) {
                        if ( tool.id === selector ) {
                            tool.classList.add('selected');
                        } else {
                            tool.classList.remove('selected');
                        }
                    });
                    //
                    // render tool options
                    //
                    if ( optiontemplates[ command[ 1 ] ] ) {
                        tooloptions.innerHTML = Mustache.render(optiontemplates[ command[ 1 ] ], { options: _this.options || {} } );
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
    ThingPropertyEditor.prototype.selectTool = function( tooloptions, tool ) {
        var _this = this;
        //
        // clean up
        //
        if ( this.behaviourPreview ) {
            this.behaviourPreview.destroy();
            this.behaviourPreview = null;
            this.canvas.style.visibility = 'visible';
            this.drawOverlay();
        }
        //
        //
        //
        this.currentTool = tool;
        switch( tool ) {
            case 'crop' :
                this.setZoom(1.0);
                this.drawOverlay();
                break;
            case 'adjust' :
                //console.log( 'hooking sliders');
                var adjustments = tooloptions.querySelectorAll('input[type=range]');
                adjustments.forEach( function( adjustment ) {
                    var value = ( _this.options[ adjustment.id ] + 255.0 ) / 512.0;
                    adjustment.value = value;
                    //console.log( 'hooking slider : ' + adjustment.id);
                    function updateIndicator(e) {
                        //console.log( 'setting slider adjustment : ' + adjustment.id + '=' + adjustment.value);
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
                    });                                
                });
                break;
            case 'restore' :
                //console.log( 'hooking pens');
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
                //console.log( 'hooking erasers');
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
                //
                //
                //
                var autoThreshold = tooloptions.querySelector('#auto-threshold');
                if ( autoThreshold ) {
                    autoThreshold.addEventListener('change', function(e) {
                        var context = _this.maskCanvas.getContext('2d');
                        context.fillRect(0,0,_this.maskCanvas.width,_this.maskCanvas.height);
                        if ( autoThreshold.value > 0 ) {
                            //console.log( 'autoThreshold=' + autoThreshold.value);
                            _this.imageEditor.autoMask(parseInt(autoThreshold.value));
                        } else {
                            _this.imageEditor.compositeRect(0,0,_this.maskCanvas.width,_this.maskCanvas.height)
                        } 
                    });
                }
                break;
            case 'behaviour' :
                //console.log( 'hooking behaviours' ) ;
                //
                // hook parameter sliders
                //
                var behaviourValues = tooloptions.querySelectorAll('input[type=range]');
                behaviourValues.forEach( function( behaviourVaue ) {
                    var selector = behaviourVaue.id.split('.');
                    if ( selector.length == 2 ) {
                        var direction = selector[ 0 ];
                        var parameter = selector[ 1 ];
                        var behaviourIndex = direction == "leftright" ? 0 : 1;
                        behaviourVaue.value = ( _this.item.behaviour[ behaviourIndex ][ parameter ] - localplay.game.behaviour.ranges[ parameter ].min ) / ( localplay.game.behaviour.ranges[ parameter ].max - localplay.game.behaviour.ranges[ parameter ].min );
                        behaviourVaue.addEventListener('change', function(e){
                                var value = localplay.game.behaviour.ranges[ parameter ].min + ( localplay.game.behaviour.ranges[ parameter ].max - localplay.game.behaviour.ranges[ parameter ].min ) * e.target.value;
                                _this.item.behaviour[ behaviourIndex ][ parameter ] = value; 
                                //console.log( 'item.behaviour[' + behaviourIndex + '][' + parameter + '] = ' + value );
                        });
                    }
                });
                //
                // hook onedirection checkboxs
                //
                var oneDirections = tooloptions.querySelectorAll('input[type=checkbox]');
                oneDirections.forEach( function( oneDirection ) {
                    var selector = oneDirection.id.split('.');
                    if ( selector.length == 2 ) {
                        var direction = selector[ 0 ];
                        var parameter = selector[ 1 ];
                        var behaviourIndex = direction == "leftright" ? 0 : 1;
                        oneDirection.checked = _this.item.behaviour[ behaviourIndex ].isonedirection();
                        oneDirection.addEventListener( 'change', function(e) {
                                _this.item.behaviour[ behaviourIndex ].setonedirection(e.target.checked);
                                if ( _this.item.behaviour[ behaviourIndex ].isonedirection() ) {

                                } else {

                                }
                        });
                    }
                });
                //
                // create preview
                //
                this.setZoom(1.0);
                this.drawOverlay();
                this.canvas.style.visibility = 'hidden';
                this.behaviourPreview = localplay.game.behaviour.creatbehaviourpreviewanimator(this.uicanvas, this.item);
                this.behaviourPreview.start();   
                break;
            case 'audio' :
                //
                // initialise player
                //
                var player = tooloptions.querySelector('audio');
                if ( player ) {
                    //player.src = _this.item.audio ? _this.item.audio[localplay.domutils.getTypeForAudio()] : "";
                    player.setAttribute('data-audio', JSON.stringify(_this.item.audio ? _this.item.audio : {
                        name: '',
                        duration: '0',
                        mp3: '',
                        ogg: ''
                    }));
                    localplay.audioplayer.attach(player,function(selector,control) {
                        var edit = tooloptions.querySelector('#' + selector + '\\.edit');
                        player = tooloptions.querySelector('#' + selector + '\\.audio');
                        if ( control === 'volume' ) {
                            _this.item.audio.volume = player.volume;
                        } else {
                            var dialog = localplay.game.soundeditor.createaudiodialog("Select collison sound", "effect", _this.item.audio);
                            dialog.addEventListener("save", function () {
                                if (!_this.item.audio) _this.item.audio = {};
                                _this.item.audio.id = dialog.selection.id;
                                _this.item.audio.type = dialog.selection.type;
                                _this.item.audio.duration = dialog.selection.duration;
                                _this.item.audio.name = dialog.selection.name;
                                _this.item.audio.mp3 = dialog.selection.mp3;
                                _this.item.audio.ogg = dialog.selection.ogg;
                                _this.item.audio.volume = 1.0;
                                player.setAttribute('data-audio', JSON.stringify(_this.item.audio));
                            });
                            dialog.show();
                        }
                    });
                }
                break;
            case 'properties' :
                var typeOptions = tooloptions.querySelectorAll('input[type=radio]');
                typeOptions.forEach(function(typeOption) {
                    var selector = typeOption.id.split('.');
                    if ( selector.length >= 2 ) {
                        var type = selector[ 1 ];
                        typeOption.checked = type === _this.item.type;
                        typeOption.addEventListener('change', function(e) {
                            if ( typeOption.checked ) {
                              if (localplay.game.item.isitemtype(type) && type !== _this.item.type) {
                                var instances = _this.item.level.getInstancesOfMediaForObjectOfType(_this.item.type, _this.item.image);
                                localplay.dialogbox.confirm("Platform", "This will change all things using this image to " + type + "<br/>Are you sure you want to continue?",
                                    function (confirm) {
                                        if (confirm) {
                                            //
                                            // remove from gameplay 
                                            // 
                                            _this.item.level.gameplay.removeSentencesWithItem(_this);
                                            //
                                            // change all things using this media to new type
                                            //
                                            instances.forEach( function(instance) {
                                                _this.item.level.changeitemtype(instance, type);
                                            });
                                            //
                                            // TODO: add default rule for this type
                                            //
                                            
                                            //
                                            // adjust UI
                                            //
                                            _this.title = 'edit ' + type;
                                            var title = _this.container.querySelector('#editor\\.title');
                                            if ( title ) {
                                                title.innerHTML = _this.title;
                                            }
                                            _this.configureTools();  
                                        } else {
                                            //
                                            // reset buttons
                                            //
                                            typeOptions.forEach( function( typeOption ) {
                                                typeOption.checked = typeOption.value === _this.item.type;
                                            });
                                          }
                                    }, instances.length <= 1);
                                }
                            }
                        });
                    } 
                });
                break;
            case 'avatar' :
                var changeImage = tooloptions.querySelector('#avatar\\.image');
                if ( changeImage ) {
                    changeImage.addEventListener('click', function(e) {
                        //
                        // show media library
                        //
                        var contents = "/media?type=object&listview=true";
                        var libraryContainer = localplay.listview.createlibrarydialog("Choose your Avatar", contents, function (item) {
                            //
                            //
                            //
                            var cacheImage = localplay.objectcache.get(localplay.mediaurl(item.data.url));
                            //
                            // reset ui
                            //
                            var resetUI = function() {
                               _this.options = {
                                    brightness: 0,
                                    contrast: 0,
                                    saturation: 0,
                                    crop: new Rectangle(0, 0, cacheImage.naturalWidth, cacheImage.naturalHeight )
                                };
                                _this.initialise();
                            };
                            //
                            // reset avatar
                            //
                            _this.item.options = null;
                            _this.item.replacesprite(localplay.mediaurl(item.data.url));
                            
                            if ( cacheImage.complete && cacheImage.src.length > 0 ) {
                                resetUI();
                            } else {
                                cacheImage.addEventListener('load', function(e) {
                                    resetUI();
                                }, { once: true, passive: true } );                                
                            }
                        }, 20, "",
                        function (controller) {
                            /*
                            var objecteditor = localplay.objecteditor.createobjecteditor("Add", function () {
                                controller.refresh();
                            });
                            //
                            // fudge to shift above dialog
                            //
                            objecteditor.container.style.zIndex = libraryContainer.style.zIndex ? parseInt(libraryContainer.style.zIndex) + 1 : 13;
                            */
                            localplay.objectimporter.createobjectimporterdialog('Add Avatar','object', function() {
                                controller.refresh();  
                            });
                        }, "New");
                    });
                }
                var weight = tooloptions.querySelector('#avatar\\.weight');
                if ( weight ) {
                    weight.value = ( _this.item.gravityscale + 0.25 ) / 2.25;
                    weight.addEventListener('change', function(e) {
                       _this.item.gravityscale = -0.25 + 2.25 * weight.value;
                        if (_this.item.sprite) {
                            _this.item.sprite.setgravityscale(_this.gravityscale);
                        }
                    });
                }
                var resetWeight = tooloptions.querySelector('#avatar\\.resetweight');
                if ( resetWeight ) {
                    resetWeight.addEventListener('click', function(e) {
                        _this.item.gravityscale = 1.0;
                        weight.value = ( _this.item.gravityscale + 0.25 ) / 2.25;
                        if (_this.item.sprite) {
                            _this.item.sprite.setgravityscale(_this.gravityscale);
                        }
                   });
                }
                break;
        }
        this.imageEditor.draw();
    }
    //
    //
    //
    thingpropertyeditor.createthingpropertyeditor = function (item,callback) {
        return new ThingPropertyEditor(item,callback);
    }
    thingpropertyeditor.createthingpropertyeditordialog = function (item,callback) {
        /*
        var editor = thingpropertyeditor.createthingpropertyeditor(item,callback);
        var dialog = localplay.dialogbox.createfullscreendialogbox( editor.title, editor.container, [], [], function() {
            editor.close();   
        });
        dialog.show();
        editor.initialise();
        return editor;
        */
        var editor = thingpropertyeditor.createthingpropertyeditor(item,callback);
        var dialog = localplay.dialogbox.createfullscreendialogbox( undefined, editor.container, [], [] );
        dialog.show();
        editor.initialise();
        //
        //
        //
        var closeButton = dialog.dialog.querySelector('#editor-tools-close');
        if ( closeButton ) {
            closeButton.addEventListener('click', function(e) {
                editor.close();
                dialog.close();
            });
        }
        return editor;
    }
    return thingpropertyeditor;
})();
