/**
 *
 * @source: https://github.com/LocalPlay/PlayYourPlace/tree/master/htdocs/js/localplay.game.backgroundeditor.js
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
//
// TODO: templating
//
localplay.game.backgroundeditor = (function () {
    var backgroundeditor = {};
    //
    //
    //
    function BackgroundEditor(level) {
        this.level = level;
        //
        //
        //
        var _this = this;
        this.hit = null;
        this.movebackground = -1;
        //
        // allow for titlebar
        //
        var vOffset = 0;
        var titleBar = document.querySelector( '#title-bar' );
        if ( titleBar ) {
            vOffset = titleBar.offsetHeight + 16;
            window.addEventListener('resize', function(e) {
                _this.container.style.top = ( titleBar.offsetHeight + 16 ) + 'px';
            });

        }
        //
        // create container
        //
        this.container = document.createElement("div");
        this.container.style.position = "absolute";
        this.container.style.top = vOffset + "px";
        this.container.style.left = "8px";
        this.container.style.bottom = "0px";
        this.container.style.right = "8px";
        this.container.style.display = "flex";
        this.container.style.flexDirection = "column";
        this.container.style.justifyContent = "flex-start";
        this.container.style.alignItems = "stretch";
        //
        //
        //
        this.backgroundview = document.createElement("div");
        this.backgroundview.id = "backgroundview";
        this.backgroundview.className = "flexbackgroundview";
        //
        //
        //
        interact('#backgroundview').dropzone({
          // only accept elements matching this CSS selector
          //accept: '#yes-drop',
          // Require a 75% element overlap for a drop to be possible
          overlap: 0.25,
          // listen for drop related events:
          ondropactivate: function (e) {
          },
          ondragenter: function (e) {
              if (!_this.isFull()) _this.backgroundview.classList.add('over');
          },
          ondragleave: function (e) {
              _this.backgroundview.classList.remove('over');  // this / e.target is previous target element.
          },
          ondrop: function (e) {
            _this.backgroundview.classList.remove('over');
            var url = localplay.mediaurl(e.relatedTarget.src);
            if (_this.movebackground >= 0) {
                _this.removeImage(_this.movebackground);
                _this.movebackground = -1;
            }
            _this.addImage(url);
          },
          ondropdeactivate: function (e) {
          }
        });
        //
        //
        //
        var d = new Date();
        this.prefix = "background.medialibrary." + d.getTime();
        this.medialibrary = document.createElement("div");
        this.medialibrary.id = this.prefix;
        this.medialibrary.className = "flexlistview";
        //this.medialibrary.style.top = "260px";
        this.medialibrary.style.flexGrow = "1";
        this.medialibrary.innerHTML = Mustache.render( localplay.listview.editablecontainer, { prefix: this.prefix, addlabel: "Add" });
        //
        //
        //
        this.container.appendChild(this.backgroundview);
        this.container.appendChild(this.medialibrary);
    }
    BackgroundEditor.prototype.save = function () {

    }

    BackgroundEditor.prototype.initialise = function () {
        var _this = this;
        this.medialibrary.controller = localplay.listview.createlistview(this.prefix, "/media?type=background&listview=true", 20);
        this.medialibrary.controller.onselect = function (item) {
            //image.src = item.data.url;
            //this.level.background.addimage(item.image.src);
            //this.level.reserialise();
            if (!_this.isFull()) {
                _this.addImage(item.data.url);
            } 
        };
        //
        // populate views
        //
        this.refresh();
        //
        //
        //
        var addobjectbutton = document.getElementById(this.prefix + ".localplay.addlistitem");
        if (addobjectbutton) {
            addobjectbutton.onclick = function (e) {
                var backgrounduploader = new BackgroundUploader(function (update) {
                    if (update) {
                        _this.medialibrary.controller.refresh();
                    }
                    if (_this.level.background.images.length > 1) {
                        localplay.showtip("Tap image to add background<br />Drag to reorder your backgrounds", _this.backgroundview);
                    } else {
                        localplay.showtip("Tap image to add background", _this.backgroundview);
                    }
                });

            }
        }
        if (this.level.background.images.length > 1) {
            localplay.showtip("Tap image to add background<br />Drag to reorder your backgrounds", this.backgroundview);
        } else {
            localplay.showtip("Tap image to add background", this.backgroundview);
        }
    }

    BackgroundEditor.prototype.dealloc = function () {
        localplay.showtip();
    }

    BackgroundEditor.prototype.isFull = function () {
        return this.level.background.images.length >= 7;
    }

    BackgroundEditor.prototype.isEmpty = function () {
        return this.level.background.images.length == 0;
    }

    BackgroundEditor.prototype.refresh = function () {
        if (this.backgroundview) {
            this.backgroundview.innerHTML = "";
            var background = this.level.background;
            var _this = this;
            if (background) {
                for (var i = 0; i < background.images.length; i++) {
                    var item = document.createElement("div");
                    item.className = "backgroundviewitem";
                    item.style.height = Math.round( this.backgroundview.offsetHeight * 0.8 ) + "px";
                    item.style.width = item.style.height;
                    item.background = i;
                    item.onclick = function (e) {
                        localplay.domutils.fixEvent(e);
                        localplay.log(" e.offsetX=" + e.offsetX + " e.offsetY=" + e.offsetY);
                        if (e.offsetX < 26  && e.offsetY < 42) {
                            _this.removeImage(e.target.background);
                        }
                    }
                    var image = new Image();
                    image.className = "backgroundview";
                    image.style.visibility = 'hidden';
                    image.background = i;
                    image.addEventListener('load',function(e){
                        var aspect = e.target.naturalWidth / e.target.naturalHeight;
                        var imageHeight = Math.round( _this.backgroundview.offsetHeight * 0.8 );
                        var imageWidth = Math.round( imageHeight * aspect );
                        e.target.style.width = imageWidth + 'px';
                        e.target.style.height = imageHeight + 'px';
                        e.target.parentElement.style.width = imageWidth + 'px';
                        e.target.parentElement.style.height = imageHeight + 'px';
                        e.target.style.visibility = 'visible';
                    });
                    image.addEventListener('contextmenu', function(e) {
                        e.preventDefault();
                        return false;
                    });
                    item.appendChild(image);
                    image.src = background.images[i].src;
                    this.backgroundview.appendChild(item);
                }
                //
                // drag and drop
                //
                interact('img.backgroundview').dropzone({
                    // only accept elements matching this CSS selector
                    //accept: '#yes-drop',
                    // Require a 25% element overlap for a drop to be possible
                    overlap: 0.25,
                    // listen for drop related events:
                    ondropactivate: function (e) {
                    },
                    ondragenter: function (e) {
                      if (!_this.isFull()) _this.backgroundview.classList.add('over');
                    },
                    ondragleave: function (e) {
                        e.target.classList.remove('overleft');
                        e.target.classList.remove('overright');
                    },
                    ondropmove: function(e) {
                        if (_this.movebackground < 0 && _this.isFull()) {
                            //e.dataTransfer.dropEffect = 'none';
                        } else {
                            //localplay.log("dragx=" + e.offsetX + " dragy=" + e.offsetY + " hoverx=" + this.hoverx + " hovery" + this.hovery );
                            var cx = e.target.offsetLeft + ( e.target.offsetWidth / 2.0 );
                            if (e.target.pageX > cx) {
                                e.target.classList.remove('overleft');
                                e.target.classList.add('overright');
                            } else {
                                e.target.classList.remove('overright');
                                e.target.classList.add('overleft');
                            }
                        }
                    },
                    ondrop: function (e) {
                        e.target.classList.remove('overleft');
                        e.target.classList.remove('overright');
                        _this.backgroundview.classList.remove('over');

                        var i = e.target.background;
                        var cx = e.target.offsetWidth / 2.0;
                        if (e.offsetX > cx) {
                            i++;
                        }
                        var url = localplay.mediaurl(e.relatedTarget.src);
                        var newimage = true;
                        if (_this.movebackground >= 0) {
                            _this.removeImage(_this.movebackground);
                            if (i > _this.movebackground) i--;
                            _this.movebackground = -1;
                            newimage = false;
                        }
                        _this.insertImage(i, url);
                        if (newimage&&_this.isFull()) {
                            localplay.showtip("You have reached the limit of 7 backgrounds<br />Drag to reorder your backgrounds<br />Delete backgrounds to add new ones", _this.backgroundview);
                        }
                    },
                    ondropdeactivate: function (e) {
                    }
                });
                interact('img.backgroundview').draggable({
                    restrict: { restriction: _this.backgroundview },
                    manualStart: true,
                    // disable autoScroll
                    autoScroll: false,
                    // call this function on every dragmove event
                    onmove: function(e) {
                        var target = e.target,
                        // keep the dragged position in the data-x/data-y attributes
                        x = (parseFloat(target.getAttribute('data-x')) || 0) + e.dx,
                        y = (parseFloat(target.getAttribute('data-y')) || 0) + e.dy;

                        // translate the element
                        target.style.webkitTransform =
                        target.style.transform =
                        'translate(' + x + 'px, ' + y + 'px)';

                        // update the posiion attributes
                        target.setAttribute('data-x', x);
                        target.setAttribute('data-y', y);
                    },
                }).on('down', function(e) {
                    e.preventDefault();
                }).on('hold', function(e) {
                    e.preventDefault();
                    var source = e.target;
                    var position = localplay.domutils.elementPosition( source );
                    var proxy = document.createElement('img');
                    proxy.id = 'listdragproxy';
                    proxy.style.position = 'absolute';
                    var width = Math.min( 64, source.offsetWidth );
                    var height = Math.min( 64, source.offsetHeight );
                    position.x += ( source.offsetWidth - width ) / 2.0;
                    position.y += ( source.offsetHeight - height ) / 2.0;
                    proxy.style.top = position.y + 'px';
                    proxy.style.left = position.x + 'px';
                    proxy.style.width = width + 'px';
                    proxy.style.height = height + 'px';
                    proxy.style.opacity = '0.5';
                    proxy.src = source.src;
                    document.body.appendChild(proxy);
                    source.parentElement.style.opacity = '0.5';
                    _this.movebackground = source.background;                        
                    var interaction = e.interaction;
                    if (!interaction.interacting()) {
                        interaction.start({ name: 'drag' },
                                        e.interactable,
                                        proxy);
                    }
                }).on('dragend', function(e) {
                    e.preventDefault();
                    var proxy = document.querySelector('#listdragproxy');
                    if ( proxy ) {
                        document.body.removeChild(proxy);
                    }
                });
            }
        }
    }

    BackgroundEditor.prototype.addImage = function (url) {
        //
        // add image to background
        //
        if (this.level) {
            if (this.isFull()) {
                localplay.showtip("You have reached the limit of 7 backgrounds<br />Drag to reorder your backgrounds<br />Delete backgrounds to add new ones", this.backgroundview);
            } else { 
                this.level.background.addimage(url);
                this.level.reserialise();
            }
        }
        //
        // refresh
        //
        this.refresh();
    }

    BackgroundEditor.prototype.insertImage = function (i, url) {
        //
        // add image to background
        //
        if (this.level) {
            this.level.background.insertimage(i, url);
            this.level.reserialise();
        }
        //
        // refresh
        //
        this.refresh();
    }

    BackgroundEditor.prototype.removeImage = function (i) {
        //
        // remove image from background
        //
        if (this.level) {
            this.level.background.removeimage(i);
            this.level.reserialise();
            localplay.showtip();
        }
        //
        // refresh
        //
        this.refresh();
    }
    //
    //
    //
    var uploadertemplate = '\
            <div class="menubar">\
                <div class="menubaritem" > \
                   Add Background\
                </div> \
                <div style="flex-grow: 1; flex-shrink: 1; width: 16px;" ></div> \
                <div id="backgrounduploader.button.file" class="menubaritem" style="float: right;"> \
                   <img class="menubaritem" src="/images/icons/load.png" />&nbsp;Choose Image\
                </div> \
                <div id="backgrounduploader.button.save" class="menubaritem" style="float: right; display: none;"> \
                   <img class="menubaritem" src="/images/icons/save.png" />&nbsp;Save&nbsp;Background\
                </div> \
                <div id="backgrounduploader.button.close" class="menubaritem" style="float: right;"> \
                   <img class="menubaritem" src="/images/icons/close-cancel-01.png" />&nbsp;Close\
                </div> \
            </div> \
            <div class="uploader-container"> \
                <!-- toolbar --> \
                <div id="backgrounduploader.toolbar" class="uploader-toolbar"> \
                    <div id="backgrounduploader.meta" class="uploader-toolbar-group"> \
                        <h3>name</h3>\
                        <input id="backgrounduploader.name" type="text" placeholder="name" /> \
                        <h3>tags</h3>\
                        <input id="backgrounduploader.tags" type="text" placeholder="tags" /> \
                    </div>\
                    <div id="backgrounduploader.adjust" class="uploader-toolbar-group"> \
                        <h3>brightness</h3>\
                        <input id="backgrounduploader.slider.brightness" type="range" min="-255" max="255" value="0" /> \
                        <h3>contrast</h3>\
                        <input id="backgrounduploader.slider.contrast" type="range" min="-255" max="255" value="0" /> \
                    </div>\
                    <!--\
                    <h3>brushes</h3> \
                    <div style="width: 256px; height: 42px"> \
                        <img src="/images/icons/brush-01.png" style="margin: 4px;"/> \
                        <img src="/images/icons/brush-02.png" style="margin: 4px;"/> \
                        <img src="/images/icons/brush-03.png" style="margin: 4px;"/> \
                        <img src="/images/icons/brush-04.png" style="margin: 4px;"/> \
                    </div> \
                    -->\
                </div> \
                <!-- image canvas --> \
                <div id="backgrounduploader.scrollpane" class="uploader-scrollpane"> \
                    <canvas id="backgrounduploader.canvas" class="backgrounduploader" width="1023" height="723">Your browser doesn&apos;t support HTML5 canvas</canvas> \
                </div> \
            </div> \
            <input id="backgrounduploader.file" accept="image/*;capture=camera" type="file" style="position: absolute; left: -400px; visibility: collapse;" /> \
    ';
    function BackgroundUploader(callback) {
        //
        // create container
        //
        var container = document.createElement("div");
        container.className = "fullscreen";
        container.innerHTML = uploadertemplate;
        document.body.appendChild(container);
        //
        // initialise canvas and tools
        //
        this.scrollpane = document.getElementById("backgrounduploader.scrollpane");
        this.canvas = document.getElementById("backgrounduploader.canvas");
        this.toolbar = document.getElementById("backgrounduploader.toolbar");
        //
        //
        //
        this.name = document.getElementById("backgrounduploader.name");
        this.tags = document.getElementById("backgrounduploader.tags");
        //
        // initialise file selector
        // TODO: IE9 support
        //
        var _this = this;
        var file = document.getElementById("backgrounduploader.file");
        if (file) {
            file.addEventListener("change", function (e) {
                _this.handleFileSelect(e);
            });
        }
        //
        // hook ui buttons
        //
        this.update = false;
        this.savebutton = document.getElementById("backgrounduploader.button.save");
        localplay.domutils.hookChildElementsWithPrefix(container, "backgrounduploader.button", "click", function (e) {
            var selector = localplay.domutils.getButtonSelector(e);
            if (selector.length >= 3) {
                var command = selector[2];
                switch (command) {
                    case "close":
                        localplay.domutils.purgeDOMElement(container);
                        document.body.removeChild(container);
                        if (callback) callback(_this.update);
                        break;
                    case "file":
                        file.click();
                        break;
                    case "save":
                        _this.save();
                        localplay.showtip("Choose another image", _this.scrollpane);
                        _this.update = true;
                        break;
                }
            }
        });
        //
        // hook sliders
        //
        this.brightnessslider = document.getElementById("backgrounduploader.slider.brightness");
        if ( this.brightnessslider ) {
            this.brightnessslider.onchange = function(e) {
                _this.adjustImage();
            }
            if (this.brightnessslider.type == "text") {
                localplay.domutils.createSlider(this.brightnessslider);
            }
        }
        this.contrastslider = document.getElementById("backgrounduploader.slider.contrast");
        if (this.contrastslider) {
            this.contrastslider.onchange = function (e) {
                _this.adjustImage();
            }
            if (this.contrastslider.type == "text") {
                localplay.domutils.createSlider(this.contrastslider);
            }
        }
        //
        //
        //
        this.enableEditControls(false);
        //
        //
        //
        localplay.showtip("Choose image", this.scrollpane);
    }
    //
    //
    //
    BackgroundUploader.prototype.save = function (e) {
        var _this = this;
        _this.canvas.toBlob( function(imageBlob) { // convert canvas to blob
            //
            // upload
            //
            var baseFilename = Date.now() + '-';
            var data = [
                {
                    name: baseFilename + 'background.png',
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
                        type: 'background',
                        path: 'uploads/' + baseFilename + 'background.png'
                    };
                    localplay.datasource.post( '/media', media, {},
                    localplay.datasource.createprogressdialog("Updating database...", 
                            function (e) {
                                var xhr = e.target;
                                try {
                                    var response = JSON.parse(xhr.datasource.response);
                                    if (response.status === "OK") {
                                        _this.canvas.getContext('2d').clearRect(0, 0, _this.canvas.width, _this.canvas.height);
                                        _this.enableEditControls(false);
                                    }
                                } catch (error) {

                                }

                            }));
                } else {
                    //????
                }
            } );
        } );
    }


    //
    // image processing worker
    //
    BackgroundUploader.prototype.adjustImage = function () {
        this.spawnWorker();
        if (this.worker) {
            var c = this.contrastslider.value / 255.0;
            var b = this.brightnessslider.value / 255.0;
            var blockwidth = this.originalcanvas.width >> 2;
            var blockheight = this.originalcanvas.height >> 2;
            var data = {
                'command': 'block',
                'brightness': b,
                'contrast': c,
                'x': 0,
                'y': 0,
                'width': blockwidth > 0 ? blockwidth : this.originalcanvas.width,
                'height': blockheight > 0 ? blockheight : this.originalcanvas.height
            };
            this.sendBlock(data);
        }
    }
    BackgroundUploader.prototype.sendBlock = function (data) {
        var context = this.originalcanvas.getContext("2d");
        data.imagedata = context.getImageData(data.x, data.y, data.width, data.height);
        this.worker.postMessage(data);
    }
    BackgroundUploader.prototype.spawnWorker = function () {
        var _this = this;
        this.terminateWorker();
        this.worker = new Worker('js/brightnesscontrastworker.js');
        this.worker.addEventListener('message', function (e) {
            localplay.log("worker command: " + e.data.command);
            if (e.data.command == 'block') {
                //
                // display processed data
                //
                var context = _this.canvas.getContext('2d');
                context.putImageData(e.data.imagedata, e.data.x, e.data.y);
                //
                // send next block
                //
                e.data.x += e.data.width;
                if (e.data.x >= _this.originalcanvas.width) {
                    e.data.x = 0;
                    e.data.y += e.data.height;
                    if (e.data.y >= _this.originalcanvas.height) {
                        return;
                    }
                }
                _this.sendBlock(e.data);
            } else if (e.data.command == 'image') {
                var context = _this.canvas.getContext('2d');
                context.putImageData(e.data.imagedata, 0, 0);
            }
        });
        this.worker.addEventListener('error', function (e) {
            localplay.log("worker error line:" + e.lineno + " file:" + e.filename + " message:" + e.message);
        });

    }
    BackgroundUploader.prototype.terminateWorker = function () {
        if (this.worker) {
            this.worker.terminate();
            this.worker = null;
        }
    }
    //
    //
    //
    BackgroundUploader.prototype.enableEditControls = function (enable) {
        if (window.Worker) {
            if (enable) {
                this.savebutton.style.display = "block";
                //this.toolbar.style.left = "0px";
                //this.scrollpane.style.left = "300px";
                this.toolbar.classList.add("open");
                this.scrollpane.classList.add("open");
            } else {
                this.savebutton.style.display = "none";
                this.toolbar.classList.remove("open");
                this.scrollpane.classList.remove("open");
                this.name.value = "";
                this.tags.value = "";
                this.brightnessslider.value = 0;
                this.contrastslider.value = 0;
            }
        }
    }

    BackgroundUploader.prototype.handleFileSelect = function (e) {
        var _this = this;
        var files = e.target.files;
        var f = files[0];
        if (f) {
            localplay.imageprocessor.loadlocalimage(f, function (filename, e1) {
                _this.setImage(e1.target.result);
                /*
                //localfilename = filename;
                var image = new Image();
                image.src = e1.target.result;
                image.onload = function (e2) {
                    _this.setImage(e2.target);
                }
                */
            });

        }
    }
    BackgroundUploader.prototype.setImage = function (data) {
        var _this = this;
        var image = new Image();
        image.src = data;
        image.onload = function (evt) {
            //
            // get image size and calculate scale to fix standard height
            //
            var imagewidth = image.naturalWidth;
            var imageheight = image.naturalHeight;
            var scale = _this.canvas.height / image.naturalHeight;
            imagewidth *= scale;
            imageheight = _this.canvas.height;
            //
            // resize this.canvas to fit
            //
            _this.canvas.width = Math.round(imagewidth);
            _this.originalcanvas = document.createElement("canvas");
            _this.originalcanvas.width = _this.canvas.width;
            _this.originalcanvas.height = _this.canvas.height;
            var context = _this.originalcanvas.getContext("2d");
            context.clearRect(0, 0, _this.canvas.width, _this.canvas.height);
            context.drawImage(image, 0, 0, imagewidth, imageheight);
            //
            // convert to grayscale
            //
            //localplay.imageprocessor.canvastograyscale(_this.originalcanvas, _this.originalcanvas);
            localplay.imageprocessor.copycanvas(_this.originalcanvas, _this.canvas);
            //
            //
            //
            _this.enableEditControls(true);
            //
            //
            //
            localplay.showtip("Give your background a name<br />Adjust the contrast and brightness<br />Save", _this.scrollpane);
        }

    }
    BackgroundUploader.prototype.cleanup = function () {
        this.terminateWorker();
    }
    //
    //
    //
    backgroundeditor.createbackgroundeditor = function (level) {
        return new BackgroundEditor(level);
    }
    backgroundeditor.createbackgrounduploader = function (level) {
        return new BackgroundUploader();
    }
    //
    //
    //
    return backgroundeditor;
})();