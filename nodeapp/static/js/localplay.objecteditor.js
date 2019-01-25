/**
 *
 * @source: https://github.com/LocalPlay/PlayYourPlace/tree/master/htdocs/js/localplay.objecteditor.js
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
localplay.objecteditor = (function () {
    var objecteditor = {};
    //
    // 
    //
    //
    //
    //
    var uploadertemplate = '\
            <div class="menubar">\
                <div class="menubaritem disabled" > \
                   <img class="menubaritem" src="/images/icons/breadcrumb.png" />&nbsp;<span id="objecteditor.title">Add Thing</span>\
                </div> \
                <div class="menubaritemgroup"> \
                    <div id="objecteditor.button.cancel" class="menubaritem"> \
                       <img class="menubaritem" src="/images/icons/arrow-previous-02.png" />&nbsp;Back \
                    </div> \
                    <div id="objecteditor.button.save" class="menubaritem" style="display: none;"> \
                       <img class="menubaritem" src="/images/icons/save.png" />&nbsp;Save\
                    </div> \
                    <div id="objecteditor.button.file" class="menubaritem"> \
                       <img class="menubaritem" src="/images/icons/load.png" />&nbsp;Choose Image\
                    </div> \
                    <div id="objecteditor.button.close" class="menubaritem"> \
                       <img class="menubaritem" src="/images/icons/close-cancel-01.png" />&nbsp;Close\
                    </div> \
                </div> \
             </div> \
            <div id="objecteditor.container" style="position: absolute; top: 42px; left: 0px; bottom: 0px; right: 0px;"> \
                <!-- image canvas --> \
                <div id="objecteditor.scrollpane" style="position: absolute; top: 0px; left: 0px; bottom: 0px; right: 0px; overflow: auto; background-color: darkgray;"> \
                    <canvas id="objecteditor.canvas" class="backgrounduploader" style="cursor: url( ../images/icons/brush-01.png ); width: auto; height: auto;" width="1023" height="723">Your browser doesn&apos;t support HTML5 canvas</canvas> \
                </div> \
                <img id="objecteditor.cropbutton" src="/images/tools/crop.png" style="position: absolute; top: 0px; right: 0px; width: 48px; height: 48px; background-color: rgba( 0, 0, 0, 0.5); visibility: hidden" />\
                <div id="objecteditor.savepanel" class="uploader-container" style="visibility: hidden; top: 0px;"> \
                    <!-- toolbar --> \
                    <div id="objecteditor.toolbar" class="uploader-toolbar open"> \
                        <div id="objectuploader.meta" class="uploader-toolbar-group"> \
                            <input id="objecteditor.name" type="text" style="height: 5vw; border-radius: 2.5vw; margin: 8px 0 0 8px;" placeholder="name" /> \
                            <input id="objecteditor.tags" type="text" style="height: 5vw; border-radius: 2.5vw; margin: 8px 0 0 8px;" placeholder="tags" /> \
                        </div>\
                        <div id="objectuploader.adjust" class="uploader-toolbar-group"> \
                            <input id="objecteditor.slider.brightness" type="range" class="editor brightness" min="0" max="1.0" step= "0.01" value="0.5" style="margin: 8px 0 0 8px;"/> \
                            <input id="objecteditor.slider.contrast" type="range" class="editor contrast" min="0" max="1.0" step= "0.01" value="0.5" style="margin: 8px 0 0 8px;"/> \
                        </div>\
                        <div id="objectuploader.edit" class="uploader-toolbar-group"> \
                            <div id="objecteditor.brushes" class="horizontal-option-container"> \
                                <img id="objecteditor.button.brush.1" src="/images/icons/brush-04.png" style="margin: 4px; padding: 2px;"/> \
                                <img id="objecteditor.button.brush.2" src="/images/icons/brush-03.png" style="margin: 4px; padding: 2px;"/> \
                                <img id="objecteditor.button.brush.3" src="/images/icons/brush-02.png" style="margin: 4px; padding: 2px;"/> \
                                <img id="objecteditor.button.brush.4" src="/images/icons/brush-01.png" style="margin: 4px; padding: 2px;"/> \
                            </div> \
                        </div> \
                        <div id="objectuploader.zoom" class="uploader-toolbar-group"> \
                            <div id="objecteditor.zoom" class="horizontal-option-container"> \
                                <img id="objecteditor.button.zoomin" src="/images/icons/zoom-in.png" style="width: 5vw; margin: 4px;"/> \
                                <img id="objecteditor.button.zoomout" src="/images/icons/zoom-out.png" style="width: 5vw; margin: 4px;"/> \
                            </div> \
                        </div>\
                    </div> \
                    <!-- selected thing --> \
                    <div class="uploader-scrollpane backgroundgrid"> \
                        <canvas id="objecteditor.cropcanvas" class="backgrounduploader" width="1023" height="723">Your browser doesn&apos;t support HTML5 canvas</canvas> \
                    </div> \
                </div> \
            </div> \
            <input id="objecteditor.file" type="file" accept="image/*;capture=camera" style="position: absolute; left: -400px; visibility: collapse;" /> \
    ';

    function ObjectEditor(title,callback) {
        var _this = this;
        //
        // create container
        //
        var container = document.createElement("div");
        this.container = container;
        container.className = "fullscreen";
        container.innerHTML = uploadertemplate;
        document.body.appendChild(container);
        //
        //
        //
        this.title = document.getElementById("objecteditor.title");
        if (title) {
            this.title.innerHTML = title;
        }
        //
        // initialise canvas and tools
        //
        this.scroll = document.getElementById("objecteditor.scrollpane");
        this.canvas = document.getElementById("objecteditor.canvas");
        this.cropcanvas = document.getElementById("objecteditor.cropcanvas");
        this.savepanel = document.getElementById("objecteditor.savepanel");
        //
        //
        //
        this.cropbutton = document.getElementById("objecteditor.cropbutton");
        if ( this.cropbutton ) {
            this.cropbutton.onclick = function(e) {
                e.preventDefault();
                _this.cropbutton.style.visibility = 'hidden';
                _this.showSelection();  
                return true;
            };
        }
        //
        //
        //
        this.name = document.getElementById("objecteditor.name");
        this.tags = document.getElementById("objecteditor.tags");
        //
        // initialise file selector
        // TODO: IE9 support
        //
        var file = document.getElementById("objecteditor.file");
        if (file) {
            file.addEventListener("change", function (e) {
                _this.handleFileSelect(e);
            });
        }
        //
        // hook sliders
        //
        this.brightnessslider = document.getElementById("objecteditor.slider.brightness");
        if (this.brightnessslider) {
            this.brightnessslider.onchange = function (e) {
                _this.brightnessslider.style.setProperty('--adjustment',_this.brightnessslider.value);
                _this.adjustImage();
            }
            this.brightnessslider.addEventListener('input', function(e) {
                _this.brightnessslider.style.setProperty('--adjustment',_this.brightnessslider.value);
            });
            if (this.brightnessslider.type == "text") {
                localplay.domutils.createSlider(this.brightnessslider);
            }
        }
        this.contrastslider = document.getElementById("objecteditor.slider.contrast");
        if (this.contrastslider) {
            this.contrastslider.onchange = function (e) {
                _this.contrastslider.style.setProperty('--adjustment',_this.contrastslider.value);
                _this.adjustImage();
            }
            this.contrastslider.addEventListener('input', function(e) {
                _this.contrastslider.style.setProperty('--adjustment',_this.contrastslider.value);
            });
            if (this.contrastslider.type == "text") {
                localplay.domutils.createSlider(this.contrastslider);
            }
        }
        //
        // hook ui buttons
        //
        this.update = false;
        this.savebutton = document.getElementById("objecteditor.button.save");
        this.cancelbutton = document.getElementById("objecteditor.button.cancel");
        this.filebutton = document.getElementById("objecteditor.button.file");
        this.brushes = document.getElementById("objecteditor.brushes");
        this.zoom = 1;
        localplay.domutils.hookChildElementsWithPrefix(container, "objecteditor.button", "click", function (e) {
            var selector = localplay.domutils.getButtonSelector(e);
            if (selector.length >= 3) {
                var command = selector[2];
                switch (command) {
                    case "close":
                        localplay.showtip();
                        localplay.domutils.purgeDOMElement(container);
                        document.body.removeChild(container);
                        if (callback) callback(this.update);
                        break;
                    case "file":
                        file.click();
                        break;
                    case "save":
                        localplay.showtip();
                        _this.saveSelection();
                        this.update = true;
                        break;
                    case "cancel":
                        _this.showSavePanel(false);
                        break;
                    case "brush":
                        if ( selector.length >= 4 ) {
                            var eraserRadius = 4 * parseInt(selector[3]);
                            if ( isFinite(eraserRadius) ) {
                                _this.eraserRadius = eraserRadius;
                                if (_this.brushes) {
                                    var brushId = selector.join('.');
                                    localplay.domutils.forEachChildWithPrefix(_this.brushes, "objecteditor.button.brush", function( brush ) {
                                        if ( brushId === brush.id ) {
                                            brush.style.border = 'solid 1px white';
                                        } else {
                                            brush.style.border = 'none';
                                        }
                                    });
                                }
                            }
                        }
                        break;
                    case "zoomin" :
                        if ( _this.zoom < 8 ) {
                            _this.cropcanvas.style.width = ( _this.cropcanvas.offsetWidth * 2 ) + "px";
                            _this.cropcanvas.style.height = ( _this.cropcanvas.offsetHeight * 2 ) + "px";
                            _this.zoom++;
                        }
                        break;
                    case "zoomout" :
                        if ( _this.zoom > 0 ) {
                            _this.cropcanvas.style.width = ( _this.cropcanvas.offsetWidth / 2 ) + "px";
                            _this.cropcanvas.style.height = ( _this.cropcanvas.offsetHeight / 2 ) + "px";
                            _this.zoom++;
                        }
                        break;
                }
            }
        });
        //
        //
        //
        this.objectid = 0;
        this.objectname = "";
        this.objecttags = "";
        //
        // eraser
        //
        this.brushes.firstElementChild.style.border = 'solid 1px white';
        this.eraserRadius = 2; 
        this.eraserPrevious = null;
        function beginErase( ctx, p ) {
            ctx.save();
            erase(ctx, p)
            _this.eraserPrevious = p;
        }
        function erase( ctx, p ) {
            ctx.globalCompositeOperation = 'destination-out';
            ctx.beginPath();
            ctx.arc(p.x, p.y, _this.eraserRadius / 2, 0, 2 * Math.PI);
            ctx.fill();
            if ( _this.eraserPrevious ) {
                ctx.lineWidth = _this.eraserRadius;
                ctx.beginPath();
                ctx.moveTo(_this.eraserPrevious.x, _this.eraserPrevious.y);
                ctx.lineTo(p.x, p.y);
                ctx.stroke();
                _this.eraserPrevious.set(p.x,p.y);
            } 
            console.log( 'erasing : ' + p.tostring() );
        };
        function endErase( ctx, p ) {
            _this.eraserPrevious = null;
            ctx.restore();
        }
        //
        // initialise event handling
        //
        this.canvas.objecteditor = this;
        localplay.touch.attach( this.canvas, {
            pointerdown: function(p) {
                _this.pointerdown(_this,p);
            },
            pointermove: function(p) {
                _this.pointermove(_this,p);
            },
            pointerup: function(p) {
                _this.pointerup(_this,p);
            }
        });
        localplay.touch.attach( this.cropcanvas, {
            pointerdown: function(p) {
                p.scale(_this.cropcanvas.width / _this.cropcanvas.offsetWidth);
                _this.cropcanvas.drawing = true;
                beginErase(_this.cropcanvas.getContext("2d"),p);
            },
            pointermove: function(p) {
                p.scale(_this.cropcanvas.width / _this.cropcanvas.offsetWidth);
                if (_this.cropcanvas.drawing) {
                    erase(_this.cropcanvas.getContext("2d"),p);
                }
            },
            pointerup: function(p) {
                p.scale(_this.cropcanvas.width / _this.cropcanvas.offsetWidth);
                _this.cropcanvas.drawing = false;
                endErase(_this.cropcanvas.getContext("2d"),p);
            }
        });
        //
        //
        //
        this.trackingMouse = false;
        this.dragStart = new Point();
        this.dragCurrent = new Point();
        //
        //
        //
        //this.imageprocessor = new ImageProcessor();
        this.showSavePanel(false);
        //
        //
        //
        localplay.showtip("Choose an image", _this.scroll);
    }

    ObjectEditor.prototype.showSavePanel = function(show) {
        if (show) {
            this.savebutton.style.display = "block";
            this.cancelbutton.style.display = "block";
            this.filebutton.style.display = "none";
            /*
            this.savepanel.style.right = "0px";
            this.savepanel.style.left = "0px";
            */
            this.savepanel.style.visibility = "visible";
            localplay.showtip("Give your thing a name<br />Adjust its contrast and brightness<br />Save or Cancel to finish or select again", document.getElementById("objecteditor.container"));
         } else {
            localplay.showtip("Click and drag to select an object", this.canvas);
            this.savebutton.style.display = "none";
            this.cancelbutton.style.display = "none";
            this.filebutton.style.display = "block";
            /*
            this.savepanel.style.right = "100%";
            this.savepanel.style.left = "-100%";
            */
            this.savepanel.style.visibility = "hidden";
            this.name.value = "";
            this.tags.value = "";
            this.brightnessslider.value = 0.5;
            this.contrastslider.value = 0.5;
        }
    }

    ObjectEditor.prototype.handleFileSelect = function (e) {
        var _this = this;
        var files = e.target.files;
        var f = files[0];
        if (f) {
            //
            // NOTE: **platform** - image import
            //
            localplay.imageprocessor.loadlocalimage(f, function (filename, e1) {
                var image = new Image();
                image.src = e1.target.result;
                image.onload = function (e2) {
                    _this.setImage(e2.target);
                    //
                    //
                    //
                    localplay.showtip("Click and drag to select an object", _this.canvas);
                }
            });

        }
    }

    ObjectEditor.prototype.adjustImage = function () {
        var _this = this;
        var brightness = -255.0 + (this.brightnessslider.value*512.0);
        var contrast = -255.0 + (this.contrastslider.value*512.0);
        localplay.imageprocessor.adjustBrightnessAndContrast(this.originalcropcanvas, this.cropcanvas, brightness, contrast);
        localplay.imageprocessor.processCanvas(this.cropcanvas, this.cropcanvas, function (data) { _this.createMask(data); });
    }

    ObjectEditor.prototype.setImage = function (image) {
        this.image = image;
        //
        //
        //
        if (this.canvas == null) {
            this.canvas = document.createElement("canvas");
            this.canvas.style.position = "relative";
            this.scroll.appendChild(this.canvas);
        }
        //
        // get image size and calculate scale to fix standard height
        //
        var imagewidth = image.naturalWidth;
        var imageheight = image.naturalHeight;
        var scale = 723.0 / imageheight;
        if (scale < 1.0) {
            imagewidth *= scale;
            imageheight *= scale;
        }
        //
        // resize canvas to fit
        //
        
        this.canvas.width = Math.round(imagewidth);
        this.canvas.height = Math.round(imageheight);
        /*
        this.canvas.style.width = this.canvas.width + "px";
        this.canvas.style.height = this.canvas.height + "px";
        */
        var maxwidth = Math.min( imagewidth, ( this.scroll.offsetWidth - 16 ));
        var maxheight = Math.min( imageheight, ( this.scroll.offsetHeight - 16 ));
        if ( imagewidth > imageheight ) {
            this.canvas.style.width = maxwidth + "px";
            this.canvas.style.height = ( maxwidth * ( imageheight / imagewidth ) ) + "px";
        } else {
            this.canvas.style.width = ( maxheight * ( imagewidth / imageheight ) ) + "px";
            this.canvas.style.height = maxheight + "px";
        }
        //
        //
        //
        if ( this.cropbutton ) {
            this.cropbutton.style.visibility = 'hidden';
        }
        //
        //
        //
        this.trackingMouse = false;
        this.dragStart = new Point();
        this.dragCurrent = new Point();
        //
        //
        //

        //
        // draw image
        //
        this.draw();
    }
    //
    //
    //
    ObjectEditor.prototype.draw = function () {
        if (this.canvas === null) return;
        var context = this.canvas.getContext("2d");
        //
        // draw image
        //
        context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        if (this.image) {
            context.drawImage(this.image, 0, 0, this.canvas.width, this.canvas.height);
            //
            //
            //
            if (this.trackingMouse||(this.cropbutton&&this.cropbutton.style.visibility==='visible')) {
                var p0 = new Point();
                var p1 = new Point();
                if (this.dragCurrent.x > this.dragStart.x) {
                    p0.x = this.dragStart.x;
                    p1.x = this.dragCurrent.x;
                } else {
                    p1.x = this.dragStart.x;
                    p0.x = this.dragCurrent.x;
                }
                if (this.dragCurrent.y > this.dragStart.y) {
                    p0.y = this.dragStart.y;
                    p1.y = this.dragCurrent.y;
                } else {
                    p1.y = this.dragStart.y;
                    p0.y = this.dragCurrent.y;
                }
                context.fillStyle = 'rgba(0, 0, 0, 0.5)';
                context.fillRect(0,0,this.canvas.width,p0.y);
                context.fillRect(0,p1.y,this.canvas.width,this.canvas.height-p1.y);
                context.fillRect(0,p0.y,p0.x,p1.y-p0.y);
                context.fillRect(p1.x,p0.y,this.canvas.width-p1.x,p1.y-p0.y);
                /*
                if (context.setLineDash) {
                    context.setLineDash([5, 2]);
                }
                context.strokeRect(p0.x, p0.y, p1.x - p0.x, p1.y - p0.y);
                */
            }
        }
    }
    //
    //
    //
    ObjectEditor.prototype.onmousedown = function (e) {
        localplay.domutils.fixEvent(e);
        var objecteditor = this.objecteditor;
        if ( objecteditor) {
            var p = new Point(e.offsetX,e.offsetY);
            if ( e.target !== objecteditor.canvas ) {
                p.x -= objecteditor.canvas.offsetX;
                p.y -= objecteditor.canvas.offsetY;
            }
            objecteditor.pointerdown(objecteditor,p);
            localplay.domutils.stopPropagation(e);
        }
    }

    ObjectEditor.prototype.onmouseup = function (e) {
        localplay.domutils.fixEvent(e);
        var objecteditor = this.objecteditor;
        if ( objecteditor ) {
            var p = new Point(e.offsetX,e.offsetY);
            if ( e.target !== objecteditor.canvas ) {
                p.x -= objecteditor.canvas.offsetX;
                p.y -= objecteditor.canvas.offsetY;
            }
            objecteditor.pointerup(objecteditor,p);
            localplay.domutils.stopPropagation(e);
        }
    }

    ObjectEditor.prototype.onmousemove = function (e) {
        localplay.domutils.fixEvent(e);
        var objecteditor = this.objecteditor;
        if ( objecteditor ) {
            var p = new Point(e.offsetX,e.offsetY);
            if ( e.target !== objecteditor.canvas ) {
                p.x -= objecteditor.canvas.offsetX;
                p.y -= objecteditor.canvas.offsetY;
            }
            objecteditor.pointermove(objecteditor,p);
            localplay.domutils.stopPropagation(e);
        }
    }

    ObjectEditor.prototype.pointerdown = function( editor, p ) {
        var scale = editor.canvas.width / editor.canvas.offsetWidth;
        p.scale( scale );
        localplay.showtip();
        editor.trackingMouse = true;
        var x = Math.max(0, Math.min(editor.canvas.width, p.x));
        var y = Math.max(0, Math.min(editor.canvas.height, p.y));
        editor.dragStart.set(x, y);
        editor.dragCurrent.set(x, y);
        editor.draw();
        if ( editor.cropbutton ) {
            editor.cropbutton.style.visibility = 'hidden';
        }
    }
    
    ObjectEditor.prototype.pointermove = function( editor, p ) {
        var scale = editor.canvas.width / editor.canvas.offsetWidth;
        p.scale( scale );
        if (editor.trackingMouse) {
            var x = Math.max(0, Math.min(editor.canvas.width, p.x));
            var y = Math.max(0, Math.min(editor.canvas.height, p.y));
            editor.dragCurrent.set(x, y);
            editor.draw();
        }
    }
    
    ObjectEditor.prototype.pointerup = function( editor, p ) {
        var scale = editor.canvas.width / editor.canvas.offsetWidth;
        p.scale( scale );
        if ( editor.trackingMouse ) {
            if ( editor.cropbutton ) {
                editor.cropbutton.style.visibility = 'visible';
            } else {
                editor.showSelection(); 
            }
            editor.trackingMouse = false;
            editor.draw();
        }
    }
    
    ObjectEditor.prototype.showSelection = function () {
        var _this = this;
        //
        // crop image
        //
        var p0 = new Point();
        var p1 = new Point();
        if (this.dragCurrent.x > this.dragStart.x) {
            p0.x = this.dragStart.x;
            p1.x = this.dragCurrent.x;
        } else {
            p1.x = this.dragStart.x;
            p0.x = this.dragCurrent.x;
        }
        if (this.dragCurrent.y > this.dragStart.y) {
            p0.y = this.dragStart.y;
            p1.y = this.dragCurrent.y;
        } else {
            p1.y = this.dragStart.y;
            p0.y = this.dragCurrent.y;
        }
        if (p1.x - p0.x < 8 || p1.y - p0.y < 8) {
            if (this.canvas.width < 400 && this.canvas.height < 400) {
                p0.x = p0.y = 0;
                p1.x = this.canvas.width;
                p1.y = this.canvas.height;
            } else {
                return;
            }
        }
        var scale = 1.0;
        var imagewidth = Math.round(p1.x - p0.x);
        var imageheight = Math.round(p1.y - p0.y);
        var maxwidth = Math.min(imagewidth,this.cropcanvas.offsetParent.offsetWidth - 16);
        var maxheight = Math.min(imageheight,this.cropcanvas.offsetParent.offsetHeight - 16);
        this.cropcanvas.width = imagewidth;
        this.cropcanvas.height = imageheight;
        if ( imagewidth > imageheight ) {
            this.cropcanvas.style.width = maxwidth + "px";
            this.cropcanvas.style.height = ( ( imageheight / imagewidth ) * maxwidth ) + "px";
        } else {
            this.cropcanvas.style.width = ( ( imagewidth / imageheight ) * maxheight ) + "px";
            this.cropcanvas.style.height = maxheight + "px";
        }
        //this.cropcanvas.style.width = this.cropcanvas.width + "px";
        //this.cropcanvas.style.height = this.cropcanvas.height + "px";
        this.cropcanvas.style.position = "relative";
        this.cropcanvas.style.margin = "8px";
        this.cropcanvas.drawing = false;
        var context = this.cropcanvas.getContext("2d");
        context.clearRect(0, 0, this.cropcanvas.width, this.cropcanvas.height);
        context.drawImage(this.image, -p0.x, -p0.y, this.canvas.width, this.canvas.height);
        this.originalcropcanvas = document.createElement("canvas");
        this.originalcropcanvas.width = this.cropcanvas.width;
        this.originalcropcanvas.height = this.cropcanvas.height;
        context = this.originalcropcanvas.getContext("2d");
        context.clearRect(0, 0, this.cropcanvas.width, this.cropcanvas.height);
        context.drawImage(this.image, -p0.x, -p0.y, this.canvas.width, this.canvas.height);
        //
        // create processed version
        //
        localplay.imageprocessor.processCanvas(this.cropcanvas, this.cropcanvas, function (data) { _this.createMask(data); });

        this.showSavePanel(true);
    }


    ObjectEditor.prototype.saveSelection = function () {
        var _this = this;
        this.cropcanvas.toBlob( function(imageBlob) { // convert canvas to blob
            //
            // upload
            //
            var baseFilename = Date.now() + '-';
            var data = [
                {
                    name: baseFilename + 'object.png',
                    file: imageBlob
                }
            ];
            localplay.upload.upload(data, function(status) {
                if ( status === 'OK' ) {
                    //
                    // create new media entry
                    //
                    var media = {
                        name: _this.name.value,
                        tags: _this.tags.value,
                        type: 'object',
                        path: 'uploads/' + baseFilename + 'object.png'
                    };
                    localplay.datasource.post( '/media', media, {},
                    localplay.datasource.createprogressdialog("Updating database...", 
                            function (e) {
                                _this.showSavePanel(false);
                                /*
                                var xhr = e.target;
                                try {
                                    var response = JSON.parse(xhr.datasource.response);
                                    if (response.status === "OK") {
                                        _this.canvas.getContext('2d').clearRect(0, 0, _this.canvas.width, _this.canvas.height);
                                        _this.enableEditControls(false);
                                    }
                                } catch (error) {

                                }
                                */
                            }));
                } else {
                    //????
                }
            } );
        } );
        /*
        //
        // convert canvas to image for upload
        //
        var data = {};
        data.data = this.cropcanvas.toDataURL("image/png");
        //
        // upload
        //
        var param = {
            type: 'object'
        };
        if (this.objectid > 0) param.id = this.objectid;
        param.name = this.name.value;
        param.tags = this.tags.value;
        if (param.name.length > 0) {
            param.filename = param.name + ".png";
        } else {
            //
            // TODO: unsafe move to server
            //
            param.filename = "object" + (new Date()).getTime() + ".png";
        }
        //
        // 
        //
        var _this = this;
        localplay.datasource.put('upload.php', data, param, localplay.datasource.createprogressdialog(param.name.length > 0 ? "Saving '" + param.name + "'..." : "Saving object...", function () {
            _this.showSavePanel(false);
        }));
        */
    }

    var patternoffsets = [
        { x: -1, y: -1 },
        { x: -1, y: 0 },
        { x: -1, y: +1 },
        { x: -1, y: -1 },
        { x: 0, y: -1 },
        { x: 0, y: +1 },
        { x: 1, y: -1 },
        { x: 1, y: 0 },
        { x: 1, y: +1 }
    ];

    function neighbourscan(p, x, y, width, height, bpp, rowbytes) {
        if (x < 0 || y < 0 || x >= width || y >= height) return;
        var threshold = 200;
        var index = (y * rowbytes) + (x * bpp);
        var done = false;
        if (p[index + 3] !== 0) { // not already touched
            if (p[index] > threshold && p[index + 1] > threshold && p[index + 2] > threshold) {
                p[index + 3] = 0;
                patternoffsets.forEach(function (o) {
                    neighbourscan(p, x + o.x, y + o.y, width, height, bpp, rowbytes);
                });
            }
        }
    }
    ObjectEditor.prototype.createMask = function (data) {
        //
        //
        //
        var threshold = 200;
        var bpp = 4;
        var rowbytes = bpp * data.width;
        var pixels = data.data;
        //
        //
        //
        var test = function (x, y) {
            var index = (y * rowbytes) + (x * bpp);
            return (pixels[index+3] !=0 && pixels[index] > threshold && pixels[index + 1] > threshold && pixels[index + 2] > threshold);
        }
        var fill = function (x, y) {
            var stack = [];
            stack.push({ x: x, y: y });
            while (stack.length > 0) {
                var p = stack.pop();
                if (!(p.x < 0 || p.x >= data.width || p.y < 0 || p.y >= data.height)) {
                    if (test(p.x, p.y)) {
                        var index = (p.y * rowbytes) + (p.x * bpp);
                        pixels[index + 3] = 0;
                        stack.push({ x: p.x - 1, y: p.y });
                        stack.push({ x: p.x + 1, y: p.y });
                        stack.push({ x: p.x, y: p.y - 1 });
                        stack.push({ x: p.x, y: p.y + 1 });
                    }
                }
            }
        };
        //
        // scan edges for background colour
        //
        var x = 0;
        var y = 0;
        //
        // top
        //
        for (x = 0; x < data.width - 1; x++) {
            if (test(x, y)) {
                fill(x, y);
            }
        }
        //
        // right
        //
        x = data.width - 1;
        for (y = 0; y < data.height - 1; y++) {
            if (test(x, y)) {
                fill(x, y);
            }
        }
        //
        // bottom
        //
        y = data.height - 1;
        for (x = 1; x < data.width; x++) {
            if (test(x, y)) {
                fill(x, y);
            }
        }
        //
        // left
        //
        x = 0;
        for (y = 1; y < data.height; y++) {
            if (test(x, y)) {
                fill(x, y);
            }
        }

    }

    ObjectEditor.prototype.onprocessed = function (image) {
        var context = this.cropcanvas.getContext("2d");
        context.clearRect(0, 0, this.cropcanvas.width, this.cropcanvas.height);
        context.drawImage(image, 0, 0);
    }
    //
    //
    //
    objecteditor.createobjecteditor = function (title, callback) {
        return new ObjectEditor(title,callback);
    }
    //
    //
    //
    return objecteditor;
})();