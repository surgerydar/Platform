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
                    <div id="editor.behaviour" class="editor-tool" style="background-image: url(\'/images/tools/resize.png\');"></div> \
                    <div id="editor.audio" class="editor-tool" style="background-image: url(\'/images/tools/audio.png\');"></div> \
                    <div id="editor.properties" class="editor-tool" style="background-image: url(\'/images/tools/properties.png\');"></div> \
                    <div id="editor.avatar" class="editor-tool" style="background-image: url(\'/images/tools/properties.png\');"></div> \
                </div> \
            </div> \
            <div id="editor-tool-options" content= ""></div> \
        </div> \
        <div id="editor-zoom-control"> \
            <div id="zoomin" class="editor-tool" style="background-image: url(\'/images/icons/zoom-in.png\');"></div> \
            <div id="zoomout" class="editor-tool" style="background-image: url(\'/images/icons/zoom-out.png\');"></div> \
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
    var behaviourtemplate = ' \
            <p> MOVEMENT </p> \
            <div class="vertical-option-container">  \
                <span><b>Left / Right</b></span> \
                <div> \
                    <input id="leftright.onedirection" type="checkbox" name="item.property.behaviour.leftright.onedirection"/> \
                    <label for="leftright.onedirection"></label>&nbsp;one direction<p/> \
                </div> \
                <span>starttime</span>\
                <input id="leftright.starttime" type="range" class="editor time" min= "0" max= "1.0" step= "0.01" value="0"/> \
                <span>duration</span>\
                <input id="leftright.duration" type="range" class="editor time" min= "0" max= "1.0" step= "0.01" value="0"/> \
                <span>extent</span>\
                <input id="leftright.extent" type="range" class="editor horizontal-movement" min= "0" max= "1.0" step= "0.01" value="0"/> \
                <span>Up / Down</span> \
                <div> \
                    <input id="updown.onedirection" type="checkbox" name="item.property.behaviour.updown.onedirection"/> \
                    <label for="onedirection"></label>&nbsp;one direction<p/> \
                </div> \
                <span>starttime</span> \
                <input id="updown.starttime" type="range" class="editor time" min= "0" max= "1.0" step= "0.01" value="0" /> \
                <span>duration</span>\
                <input id="updown.duration" type="range"  class="editor time" min= "0" max= "1.0" step= "0.01" value="0" /> \
                <span>extent</span> \
                <input id="updown.extent" type="range"  class="editor vertical-movement" min= "0" max= "1.0" step= "0.01" value="0" /> \
            </div> \
    ';
    var audiotemplate = ' \
            <p> COLLISION SOUND </p> \
            <div class="vertical-option-container">  \
                <audio id="collision-audio" class="editor" controls="true"></audio> \
                <div id="audio.change" class="menubaritem" style="margin-left: 0px; align-self: stretch;"> \
                    <img class="menubaritem" src="/images/icons/edit-01.png" />&nbsp;Change collision sound \
                </div> \
            </div> \
    ';
    var avatartemplate = ' \
            <p> PROPERTIES </p> \
            <div class="vertical-option-container">  \
                <div id="avatar.image" class="menubaritem" style="margin-left: 0px; align-self: stretch;"> \
                    <img class="menubaritem" src="/images/icons/edit-01.png" />&nbsp;Change image \
                </div> \
                <input id="avatar.weight" type="range" class="editor weight" min= "0" max= "1.0" step= "0.01" value="0.5"/> \
                <div id="image.resetweight" class="menubaritem" style="margin-left: 0px; align-self: stretch;"> \
                    <img class="menubaritem" src="/images/icons/edit-01.png" />&nbsp;Reset weight \
                </div> \
           </div> \
    ';
    var propertiestemplate = ' \
            <p> TYPE </p> \
            <div class="vertical-option-container">  \
                <div> \
                    <input type="radio" id="layout.goal" name="layout.type" value="goal"><label for="layout.goal"></label>Goal<br/> \
                </div> \
                <div> \
                    <input type="radio" id="layout.obstacle" name="layout.type" value="obstacle"><label for="layout.obstacle"></label>Obstacle<br/> \
                </div> \
                <div> \
                    <input type="radio" id="layout.pickup" name="layout.type" value="pickup"><label for="layout.pickup"></label>Pickup<br/> \
                </div> \
                <div> \
                    <input type="radio" id="layout.platform" name="layout.type"  value="platform" checked="true"><label for="layout.platform"></label>Platform<br/> \
                </div> \
                <div> \
                    <input type="radio" id="layout.prop"  value="prop" name="layout.type"><label for="layout.prop"></label>Prop<br/> \
                </div> \
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
        this.container.style.paddingTop = vOffset + 'px';
        this.container.innerHTML = Mustache.render(editortemplate, { title: "editing " + this.item.type });
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
        this.content = this.container.querySelector('#editor-content');
        //
        // create new canvas ( to deal with redraw issue )
        //
        var canvas = document.createElement('canvas');
        canvas.className = 'editor-content';
        if ( this.canvas ) {
            this.content.replaceChild(canvas,this.canvas);   
        } else {
            this.content.appendChild(canvas);    
        }
        this.canvas = canvas;
        //
        // load image into canvas
        //
        var image = this.item.sprite.image;
        //
        // original copy preserve colour data
        //
        this.baseImageCanvas = document.createElement("canvas");
        this.baseImageCanvas.width = image.naturalWidth;
        this.baseImageCanvas.height = image.naturalHeight;
        var context = this.baseImageCanvas.getContext("2d");
        context.drawImage(image, 0, 0);
        //
        // working copy ( with alpha mask )
        //
        this.imageCanvas = document.createElement("canvas");
        this.imageCanvas.width = image.naturalWidth;
        this.imageCanvas.height = image.naturalHeight;
        context = this.imageCanvas.getContext("2d");
        context.drawImage(image, 0, 0);
        //
        //
        //
        if ( this.options.mask ) {
            localplay.imageprocessor.applyAlphaBitMask( this.imageCanvas, this.imageCanvas, this.options.mask );
        } else {
            this.options.mask = localplay.imageprocessor.getAlphaBitMask(this.imageCanvas);
        }
        //
        // apply colour adjustments
        //
        if ( this.processedImageCanvas ) {
            delete this.processedImageCanvas;
            //this.processedImageCanvas = null;
        }
        this.adjustImage();
        //
        // size canvas to fit image
        //
        this.sizeCanvas();
        this.setZoom( 1.0 );
        //
        // hook canvas
        //
        if ( this.canvas ) {
            localplay.touch.attach( this.canvas, {
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
        this.createBrush();
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
        this.options.mask = localplay.imageprocessor.getAlphaBitMask( this.imageCanvas );
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
        var tools = document.querySelectorAll('.editor-tool');
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
            this.draw();
        }
    }
    ThingPropertyEditor.prototype.transformToCanvas = function (p) {
        //
        // TODO: add scroll offset to this
        //
        p.x *= this.canvas.width / this.canvas.offsetWidth;
        p.y *= this.canvas.height / this.canvas.offsetHeight;
    }
    ThingPropertyEditor.prototype.adjustImage = function () {
        if ( !this.processedImageCanvas ) {
            this.processedImageCanvas = document.createElement("canvas");
            this.processedImageCanvas.width = this.imageCanvas.width;
            this.processedImageCanvas.height = this.imageCanvas.height;
        }   
        var baseContext = this.baseImageCanvas.getContext("2d");
        baseContext.drawImage(this.item.sprite.image, 0, 0);
        if ( this.options.brightness !== 0 || this.options.contrast !== 0 || this.options.saturation !== 0 ) {
            /*
            localplay.imageprocessor.adjust(this.imageCanvas,this.processedImageCanvas, this.options.brightness, this.options.contrast, this.options.saturation );
            */
            console.log( 'adjusting image : b=' + this.options.brightness + ' : c=' + this.options.contrast );
            localplay.imageprocessor.adjust(this.baseImageCanvas,this.baseImageCanvas, this.options.brightness, this.options.contrast, this.options.saturation );
            localplay.imageprocessor.adjust(this.imageCanvas,this.processedImageCanvas, this.options.brightness, this.options.contrast, this.options.saturation );
        } else {
            var sourceContext = this.imageCanvas.getContext("2d");
            var destContext = this.processedImageCanvas.getContext("2d");
            destContext.putImageData( sourceContext.getImageData(0,0,this.imageCanvas.width,this.imageCanvas.height), 0, 0 );
            //context.drawImage(this.imageCanvas,0,0);
        }
    }
    ThingPropertyEditor.prototype.showZoom = function (show) {
        if ( this.zoomControl ) {
            this.zoomControl.style.visibility = show ? 'visible' : 'hidden';
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
        //context.drawImage(this.imageCanvas, imageBounds.x, imageBounds.y, imageBounds.width, imageBounds.height);
        //
        // draw tool
        //
        /*
        switch( this.currentTool ) {
            case "draw" :
                if ( this.drawCurrent ) {
                    context.save();
                    context.beginPath();
                    context.arc(this.drawCurrent.x,this.drawCurrent.y,this.penSize,0,2 * Math.PI);
                    context.strokeStyle = 'rgb(0,0,0,.75)';
                    context.stroke();
                    context.restore();
                }
                break;
            case "erase" : 
                if ( this.eraseCurrent ) {
                    context.save();
                    context.beginPath();
                    context.arc(this.eraseCurrent.x,this.eraseCurrent.y,this.penSize,0,2 * Math.PI);
                    context.strokeStyle = 'rgb(0,0,0,.75)';
                    context.stroke();
                    context.restore();
                }
                break;
        }
        */
        //
        // draw ui elements
        //
        //
        // draw crop mask
        //
        context.save();
        context.beginPath();
        context.rect( 0, 0, this.canvas.width,this.canvas.height);
        context.rect(imageBounds.x + this.options.crop.x, imageBounds.y + this.options.crop.y, this.options.crop.width, this.options.crop.height);
        context.fillStyle = 'rgba(0,0,0,.5)';
        context.fill("evenodd");
        if ( this.currentTool === "crop" ) {
            var cropHandles = {
                topleft: new Point( imageBounds.left() + this.options.crop.left() - 2, imageBounds.top() + this.options.crop.top() - 2 ),
                topright: new Point( imageBounds.left() + this.options.crop.right() + 2, imageBounds.top() + this.options.crop.top() - 2 ),
                bottomleft: new Point( imageBounds.left() + this.options.crop.left() - 2, imageBounds.top() + this.options.crop.bottom() + 2 ),
                bottomright: new Point( imageBounds.left() + this.options.crop.right() + 2, imageBounds.top() + this.options.crop.bottom() + 2 ),
            };
            context.beginPath();
            //
            //
            //
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
        }
        context.restore();
        
    }
    //
    //
    //
    ThingPropertyEditor.prototype.setZoom = function ( factor ) {
        if ( factor <= 8.0 && factor >= 1.0 ) {
            this.zoom = factor;
            //
            // 
            //
            this.canvas.style.width = ( this.content.offsetWidth * this.zoom ) + 'px';    
            this.canvas.style.height = ( this.content.offsetHeight * this.zoom ) + 'px';   
            this.content.scrollTop = (this.canvas.offsetHeight - this.content.offsetHeight) / 2.0;
            this.content.scrollLeft = (this.canvas.offsetWidth - this.content.offsetWidth) / 2.0;
            /*
            this.content.scrollTop = Math.max( 0, Math.min( this.canvas.offsetHeight - this.content.offsetHeight, scrollTop * this.zoom ) );
            this.content.scrollLeft = Math.max( 0, Math.min( this.canvas.offsetWidth - this.content.offsetWidth, scrollLeft * this.zoom ) );
            */
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
    // tools
    //
    ThingPropertyEditor.prototype.createBrush = function() {
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
    ThingPropertyEditor.prototype.initialiseErase = function( ctx, p ) {
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
                    source: _this.imageCanvas.getContext("2d"),
                    processed: _this.processedImageCanvas.getContext("2d"),
                };
                _this.beginErase(_this.eraseContext.source, p );
                _this.beginErase(_this.eraseContext.processed, p );
                _this.eraserPrevious = p;
                _this.draw();
            },
            pointermove: function(p) {
                _this.eraseCurrent.x = p.x;
                _this.eraseCurrent.y = p.y;
                if ( _this.eraseContext ) {
                    var imageBounds = _this.imageBounds();
                    p.x -= imageBounds.x;
                    p.y -= imageBounds.y;
                    _this.erase(_this.eraseContext.source, p );
                    _this.erase(_this.eraseContext.processed, p );
                    _this.eraserPrevious.set(p.x,p.y);
                }
                _this.draw();
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
                    _this.eraserCurrent = null;
                    _this.draw();
                }
            }
        }
    }
    ThingPropertyEditor.prototype.beginErase = function( ctx, p ) {
        ctx.save();
        this.erase(ctx, p)
    }
    ThingPropertyEditor.prototype.erase = function( ctx, p ) {
        var top = Math.round(p.y - this.eraserSize / 2);
        var left = Math.round(p.x - this.eraserSize / 2);
        var data = ctx.getImageData(left, top, this.eraserSize, this.eraserSize);
        console.log( 'imagedata dim= [' + data.width + ',' + data.height + ']' );
        for ( var dst = 3, src = 0; dst < data.data.length; dst += 4, src++ ) {
            data.data[ dst ] = Math.max(0,( data.data[ dst ] - this.eraser[ src ] ));
        }
        ctx.putImageData( data, left, top );
    }
    ThingPropertyEditor.prototype.endErase = function( ctx, p ) {
        ctx.restore();
    }
    //
    // draw functions
    //
    ThingPropertyEditor.prototype.initialiseDraw = function( ctx, p ) {
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
                    source: _this.imageCanvas.getContext("2d"),
                    processed: _this.processedImageCanvas.getContext("2d"),
                };
                _this.beginDraw(_this.drawContext.source, p );
                _this.beginDraw(_this.drawContext.processed, p );
                _this.drawPrevious = p;
                _this.draw();
            },
            pointermove: function(p) {
                _this.drawCurrent.x = p.x;
                _this.drawCurrent.y = p.y;
                if ( _this.drawContext ) {
                    var imageBounds = _this.imageBounds();
                    p.x -= imageBounds.x;
                    p.y -= imageBounds.y;
                    _this.drawPoint(_this.drawContext.source, p );
                    _this.drawPoint(_this.drawContext.processed, p );
                    _this.drawPrevious.set(p.x,p.y);
                }
                _this.draw();
            },
            pointerup: function(p) {
                if ( _this.drawContext ) {
                    var imageBounds = _this.imageBounds();
                    p.x -= imageBounds.x;
                    p.y -= imageBounds.y;
                    _this.endDraw(_this.drawContext.source, p );
                    _this.endDraw(_this.drawContext.processed, p );
                    _this.drawContext = null;
                    _this.drawPrevious = null;
                    _this.draw();
                }
            }
        }
    }
    ThingPropertyEditor.prototype.beginDraw = function( ctx, p ) {
        ctx.save();
        this.drawPoint(ctx, p)
    }
    ThingPropertyEditor.prototype.drawPoint = function( ctx, p ) {
        var top = Math.round(p.y - this.penSize / 2);
        var left = Math.round(p.x - this.penSize / 2);
        var data = ctx.getImageData(left, top, this.penSize, this.penSize);
        var colourData = this.baseImageCanvas.getContext("2d").getImageData(left, top, this.penSize, this.penSize);
        for ( var dst = 0, src = 0; dst < data.data.length; dst += 4, src++ ) {
            if ( colourData.data[ dst + 3 ] > 0 ) {
                data.data[ dst ] = colourData.data[ dst ];
                data.data[ dst + 1 ] = colourData.data[ dst + 1 ];
                data.data[ dst + 2 ] = colourData.data[ dst + 2 ];
            }
            if ( this.pen[src] > 0 ) { // TODO: possibly premultiply
                data.data[ dst + 3 ] = colourData.data[ dst + 3 ];//255;//Math.min(255,( data.data[ dst ] + this.pen[src] ));
            } 
            
        }
        ctx.putImageData( data, left, top );

    }
    ThingPropertyEditor.prototype.endDraw = function( ctx, p ) {
        ctx.restore();
    }
    //
    // crop functions
    //
    ThingPropertyEditor.prototype.initialiseCrop = function( ctx, p ) {
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
        //
        //
        //
        this.toolFunction["crop"] = {
            pointerdown: function(p) {
                var imageBounds = _this.imageBounds();
                var cropBounds = new Rectangle( imageBounds.x + _this.options.crop.x, imageBounds.y + _this.options.crop.y, _this.options.crop.width, _this.options.crop.height );
                var dLeft = Math.abs( cropBounds.left() - p.x );
                var dRight = Math.abs( cropBounds.right() - p.x );
                var hSafe = imageBounds.width / 4;
                hTrack = dLeft > hSafe && dRight > hSafe ? "none" : dLeft < dRight ? "left" : "right";
                var dTop = Math.abs( cropBounds.top() - p.y );
                var dBottom = Math.abs( cropBounds.bottom() - p.y );
                var vSafe = imageBounds.height / 4;
                vTrack = dTop > vSafe && dBottom > vSafe ? "none" : dTop < dBottom ? "top" : "bottom";
                _this.toolFunction["crop"].pointermove(p);
            },
            pointermove: function(p) {
                //var pixelAspect = new Point( _this.canvas.offsetWidth / _this.canvas.width, _this.canvas.offsetHeight / _this.canvas.height );
                //console.log( 'pixel aspect : ' + pixelAspect.tostring() );
                var imageBounds = _this.imageBounds();
                console.log( 'p.x= ' + p.x + ' imageBounds.width=' + imageBounds.width );
                p.x -= imageBounds.x;
                //p.x *= pixelAspect.x;
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
                console.log( 'p.y= ' + p.y + ' imageBounds.height=' + imageBounds.height );
                p.y -= imageBounds.y;
                //p.y *= _this.canvas.height / _this.canvas.offsetHeight;
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
                _this.draw();
            },
            pointerup: function(p) {
                hTrack = "none";
                vTrack = "none";
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
        }
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
                break;
            case 'behaviour' :
                console.log( 'hooking behaviours' ) ;
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
                                console.log( 'item.behaviour[' + behaviourIndex + '][' + parameter + '] = ' + value );
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
                this.behaviourPreview = localplay.game.behaviour.creatbehaviourpreviewanimator(this.canvas, this.item);
                this.behaviourPreview.start();               
                break;
            case 'audio' :
                //
                // initialise player
                //
                var player = tooloptions.querySelector('audio');
                if ( player ) {
                   player.src = _this.item.audio ? _this.item.audio[localplay.domutils.getTypeForAudio()] : "";
                }
                var changeaudio = tooloptions.querySelector('#audio\\.change');
                if (changeaudio) {
                    changeaudio.onclick = function (e) {
                        var pin = localplay.domutils.elementPosition(changeaudio);
                        var dialog = localplay.game.soundeditor.createaudiodialog("Select collison sound", "effect", _this.item.audio, pin);
                        dialog.addEventListener("save", function () {
                            if (!_this.item.audio) _this.item.audio = {};
                            _this.item.audio.id = dialog.selection.id;
                            _this.item.audio.type = dialog.selection.type;
                            _this.item.audio.name = dialog.selection.name;
                            _this.item.audio.mp3 = dialog.selection.mp3;
                            _this.item.audio.ogg = dialog.selection.ogg;
                            player.src = _this.item.audio[localplay.domutils.getTypeForAudio()];
                        });
                        dialog.show();
                    }
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
                                            var title = _this.container.querySelector('editor\\.title');
                                            if ( title ) {
                                                title.innerHTML = 'editing ' + type;
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
        this.draw();
    }
    //
    //
    //
    thingpropertyeditor.createthingpropertyeditor = function (item,callback) {
        return new ThingPropertyEditor(item,callback);
    }
    return thingpropertyeditor;
})();
