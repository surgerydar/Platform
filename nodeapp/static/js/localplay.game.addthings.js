/**
 *
 * @source: https://github.com/LocalPlay/PlayYourPlace/tree/master/htdocs/js/localplay.game.addthingseditor.js
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

localplay.game.addthings = (function () {
    var addthings = {};

    //
    //
    //
    var addthingtemplate = '\
      <div style="width: 200px; height: 200px; padding: 8px;"> \
        <h3>Add item as</h3> \
        <hr class="white" style="width: 100%"></hr><br /> \
        <input type="radio" id="layout.goal" name="layout.type" value="goal"><label for="layout.goal"></label>Goal<br/> \
        <input type="radio" id="layout.obstacle" name="layout.type" value="obstacle"><label for="layout.obstacle"></label>Obstacle<br/> \
        <input type="radio" id="layout.pickup" name="layout.type" value="pickup"><label for="layout.pickup"></label>Pickup<br/> \
        <input type="radio" id="layout.platform" name="layout.type"  value="platform" checked="true"><label for="layout.platform"></label>Platform<br/> \
        <input type="radio" id="layout.prop"  value="prop" name="layout.type"><label for="layout.prop"></label>Prop<br/> \
        <div style="height: 42px; width: 200px">\
            <div id="button.layout.cancel" class="menubaritem" style="float: right;" > \
                <img class="menubaritem" src="/images/icons/close-cancel-01.png" /> \
                &nbsp;Cancel \
            </div> \
            <div id="button.layout.add" class="menubaritem" style="float: right;" > \
                <img class="menubaritem" src="/images/icons/add-01.png" /> \
                &nbsp;Add \
            </div> \
        </div> \
      </div>\
    ';
    //
    // TODO: move this to central color / pattern registry
    //
    var rolloverimage = new Image();
    rolloverimage.src = "/images/icons/move-02.png";
    var selectimage = new Image();
    selectimage.src = "/images/icons/move-03.png";
    //
    //
    //
    function AddThingsEditor(level) {
        var _this = this;
        this.level = level;
        //
        // attach to game
        //
        localplay.game.controller.attachcontroller(level.game,this);
        this.boundstatechange = this.onstatechange.bind(this); // TODO: this should probably be moved to game.controller
        this.level.addEventListener("statechange", this.boundstatechange);
        //
        //
        //
        var titleBar = document.querySelector('#title-bar');
        var vOffset = 0;
        if ( titleBar ) {
            vOffset = titleBar.offsetTop + titleBar.offsetHeight;
        }
        //
        // container
        //
        this.container = document.createElement("div");
        this.container.style.position = "absolute";
        this.container.style.top = vOffset + 'px';
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
        this.layoutview = document.createElement("div");
        this.layoutview.id = "layoutview";
        this.layoutview.className = "flexlayoutview";
        //
        //
        //
        level.background.setscale(1.0);
        level.world.setscale(1.0);
        this.scale = 240.0 / level.background.height;
        this.inversescale = 1.0 / this.scale;
        this.canvas = document.createElement("canvas");
        this.canvas.className = "flexlayoutview";
        this.canvas.height = 240;//Math.round(this.level.background.height * this.inversescale);;
        this.canvas.width = Math.round(this.level.background.width * this.scale);
        this.canvas.style.width = this.canvas.width + "px";
        //this.canvas.style.height = this.canvas.height + "px";
        this.layoutview.appendChild(this.canvas);
        this.level.game.setcanvas(this.canvas);
        window.addEventListener("resize", function() {
            _this.fitCanvas();
        });
        //
        //
        //
        this.selection = document.createElement("div");
        this.selection.className = "editrollover";
        this.selection.onmousedown = function (e) {
            _this.selection.style.visibility = "hidden";
            _this.selectedsprite = _this.rollover;
        };
        this.layoutview.appendChild(this.selection);
        
        //
        // hook mouse events
        //
        this.selectedsprite = null;
        this.rollover = null;
        this.duplicate = null;
        if ( localplay.touchsupport() ) {
            //
            // TODO: replace with interact
            //
            var ongoingTouches = [];
            function copyTouch(touch) {
                return { identifier: touch.identifier, pageX: touch.pageX, pageY: touch.pageY };
            }
            function ongoingTouchIndexById(idToFind) {
              for (var i = 0; i < ongoingTouches.length; i++) {
                var id = ongoingTouches[i].identifier;

                if (id == idToFind) {
                  return i;
                }
              }
              return -1;    // not found
            }
            //
            //
            //
            this.layoutview.addEventListener("touchstart", function(e) {
                e.preventDefault();
                var touches = e.changedTouches;
                for (var i = 0; i < touches.length; i++) {
                    ongoingTouches.push(copyTouch(touches[i]));
                }
                var p = new Point( ongoingTouches[0].pageX - _this.layoutview.offsetLeft, ongoingTouches[0].pageY -  _this.layoutview.offsetTop );
                _this.pointerdown(p);
            });
            this.layoutview.addEventListener("touchmove", function(e) {
                e.preventDefault();
                var touches = e.changedTouches;
                for (var i = 0; i < touches.length; i++) {
                    var idx = ongoingTouchIndexById(touches[i].identifier);
                    if (idx >= 0) {
                      ongoingTouches.splice(idx, 1, copyTouch(touches[i]));  
                    }
                }
                var p = new Point( ongoingTouches[0].pageX - _this.layoutview.offsetLeft, ongoingTouches[0].pageY -  _this.layoutview.offsetTop );
                _this.pointermove(p);
            });
            this.layoutview.addEventListener("touchend", function(e) {
                e.preventDefault();
                var touches = e.changedTouches;
                for (var i = 0; i < touches.length; i++) {
                    var idx = ongoingTouchIndexById(touches[i].identifier);
                    if (idx >= 0) {
                        if ( idx === 0 ) {
                            var p = new Point( ongoingTouches[0].pageX - _this.layoutview.offsetLeft, ongoingTouches[0].pageY -  _this.layoutview.offsetTop );
                            _this.pointerup(p);
                        }
                        ongoingTouches.splice(idx, 1);  
                    }
                }
            });
            this.layoutview.addEventListener("touchcancel", function(e) {
                e.preventDefault();
                var touches = e.changedTouches;
                for (var i = 0; i < touches.length; i++) {
                    var idx = ongoingTouchIndexById(touches[i].identifier);
                    if (idx >= 0) {
                        if ( idx === 0 ) {
                            var p = new Point( ongoingTouches[0].pageX - _this.layoutview.offsetLeft, ongoingTouches[0].pageY -  _this.layoutview.offsetTop );
                            _this.pointerup(p);
                        }
                        ongoingTouches.splice(idx, 1);  
                    }
                }
            });
        } else {
            this.layoutview.onmousedown = this.onmousedown.bind(this);
            this.layoutview.onmouseup = this.onmouseup.bind(this);
            this.layoutview.onmousemove = this.onmousemove.bind(this);
            //this.layoutview.onmouseout = this.onmouseout.bind(this);
        }
        //
        //
        //
        this.keys = [];
        this.boundkeydown = this.onkeydown.bind(this);
        window.addEventListener("keydown", this.boundkeydown, true);
        this.boundkeyup = this.onkeyup.bind(this);
        window.addEventListener("keyup", this.boundkeyup, true);
        //
        // drag and drop
        //
        interact('#layoutview').dropzone({
          // only accept elements matching this CSS selector
          //accept: '#yes-drop',
          // Require a 75% element overlap for a drop to be possible
          overlap: 0.25,
          // listen for drop related events:
          ondropactivate: function (e) {
          },
          ondragenter: function (e) {
              _this.layoutview.classList.add('over');
          },
          ondragleave: function (e) {
              _this.layoutview.classList.remove('over');
          },
          ondrop: function (e) {
            _this.layoutview.classList.remove('over');
            var url = localplay.mediaurl(e.relatedTarget.src);
            var offset = localplay.domutils.elementPosition(_this.canvas);
            var p = new Point(parseFloat(e.relatedTarget.getAttribute('data-x'))+e.x0,parseFloat(e.relatedTarget.getAttribute('data-y'))+e.y0);
            p.subtract(offset);
            if( !p.isvalid() ) {
                p.x = _this.canvas.offsetWidth / 2;
                p.y = _this.canvas.offsetHeight / 2;
            }
            //p.scale(_this.scale);
            _this.addthing(url, p);
          },
          ondropdeactivate: function (e) {
          }
        });
        
        //
        //
        //
        var d = new Date();
        this.prefix = "layout.medialibrary." + d.getTime();
        this.medialibrary = document.createElement("div");
        this.medialibrary.id = this.prefix;
        this.medialibrary.className = "flexlistview";
        //this.medialibrary.style.top = "260px";
        this.medialibrary.innerHTML = Mustache.render(localplay.listview.editablecontainer, { prefix: this.prefix, addlabel: "Upload drawings of things" });
        //
        //
        //
        this.container.appendChild(this.layoutview);
        this.container.appendChild(this.medialibrary);
        //
        // switch off avatar tracking and activate game
        //
        this.level.reset();
        this.level.trackavatar = false;
    }
    //
    // required editor methods
    //
    AddThingsEditor.prototype.initialise = function () {
        var _this = this;
        this.medialibrary.controller = localplay.listview.createlistview(this.prefix, "/media?type=object&listview=true", 20);
        this.medialibrary.controller.onselect = function (item) {
            //
            // add sprite at the center of the current view
            //
            var p = new Point();
            p.x = _this.layoutview.scrollLeft + _this.layoutview.offsetWidth / 2.0;
            p.y = _this.layoutview.offsetHeight / 2.0;

            _this.addthing(item.data.url, p);
        };
        //
        //
        //
        var addobjectbutton = document.getElementById(this.prefix + ".localplay.addlistitem");
        if (addobjectbutton) {
            addobjectbutton.onclick = function (e) {
                var objecteditor = localplay.objecteditor.createobjecteditor("Add Thing", function () {
                    localplay.showtip("Drag things here to add them to your level<br />Click and drag to move them<br />Press the alt key then click and drag to duplicate", _this.layoutview);
                    _this.medialibrary.controller.refresh();
                });
            }
        }
        //
        //
        //
        this.scale = this.layoutview.clientHeight / localplay.defaultsize.height;
        this.inversescale = 1.0 / this.scale;
        //
        //
        //
        localplay.showtip("Drag things here to add them to your level<br />Click and drag to move them<br />Press the alt key then click and drag to duplicate", this.layoutview);
        //
        //
        //
        this.fitCanvas();
    }
    AddThingsEditor.prototype.dealloc = function () {
        localplay.showtip();
        window.removeEventListener("keydown", this.boundkeydown, true);
        window.removeEventListener("keyup", this.boundkeyup, true);
    }
    //
    //
    //
    AddThingsEditor.prototype.draw = function () {
        if (this.rollover) {
            var dim = new Point(rolloverimage.naturalWidth, rolloverimage.naturalHeight);
            dim.scale(this.inversescale);
            var aabb = this.rollover.getAABB();
            var c = aabb.getcenter();
            this.level.world.startDrawSprites();
            this.level.world.context.drawImage(rolloverimage, c.x - (dim.x / 2), c.y - (dim.y / 2), dim.x, dim.y);
            this.level.world.endDrawSprites();
        } else if (this.selectedsprite) {
            var dim = new Point(selectimage.naturalWidth, selectimage.naturalHeight);
            dim.scale(this.inversescale);
            var c = this.selectedsprite.editPosition;
            this.level.world.startDrawSprites();
            this.level.world.context.drawImage(selectimage, c.x - (dim.x / 2), c.y - (dim.y / 2), dim.x, dim.y);
            this.level.world.endDrawSprites();
        }
    }

    AddThingsEditor.prototype.detach = function () {
        this.level.removeEventListener("statechange", this.boundstatechange);
        this.level.reserialise();
        var canvas = document.getElementById("game.canvas");
        if (canvas) {
            this.level.game.setcanvas(canvas);
        }
    }

    AddThingsEditor.prototype.onstatechange = function (e) {
        switch (this.level.state) {
            case localplay.game.level.states.clear:
                break;
            case localplay.game.level.states.loading:
                break;
            case localplay.game.level.states.ready:
                break;
            case localplay.game.level.states.playing:
                break;
            case localplay.game.level.states.done:
                break;
        }

    }
    //
    //
    //
    AddThingsEditor.prototype.fitCanvas = function () {
        console.log( 'addthingseditor : resizing canvas' );
        this.scale = this.layoutview.offsetHeight / this.level.background.height;
        this.inversescale = 1.0 / this.scale;
        this.canvas.height = this.layoutview.offsetHeight;
        this.canvas.width = Math.round(this.level.background.width * this.scale);
        this.canvas.style.width = this.canvas.width + "px";
    }
    //
    //
    //
    AddThingsEditor.prototype.addthing = function (url, position) {
        //
        // scale position into level and ensure it is within the viewport
        //
        var p = position.duplicate();
        var b = this.level.world.viewport;
        if (p.x < b.left() || p.x > b.right()) {
            p.x = b.x + b.width / 2.0;
        }
        if (p.y < b.top() || p.y > b.bottom()) {
            p.y = b.y + b.height / 2.0;
        }
        p.scale(this.inversescale);
        //
        // check to see if media has been assigned a type
        //
        var type = this.level.getTypeOfMedia(url);
        if (type) {
            this.level.newitem(type, url, p);
        } else {
            //
            // convert position into global coordinates from container
            //
            var dialogposition = localplay.domutils.elementPosition(this.layoutview);
            dialogposition.x -= layoutview.scrollLeft;
            dialogposition.moveby(position);
            //
            // prompt for type
            //
            var _this = this;
            localplay.dialogbox.pinnedpopupatpoint(dialogposition, addthingtemplate, null, function (e) {
                var selector = localplay.domutils.getButtonSelector(e);
                if (selector.length >= 3) {
                    var command = selector[2];
                    switch (command) {
                        case "add":
                            var type = localplay.domutils.valueOfRadioGroup("layout.type");
                            if (type.length > 0) {
                                _this.level.newitem(type, url, p);
                            }
                            break;
                        case "cancel":
                            break;
                    }
                    return true;
                }
            });
        }
    }

    AddThingsEditor.prototype.pointerdown = function(p) {
        p.scale(this.inversescale);
        this.selectedsprite = this.level.world.spriteAtPoint(p);
        if (this.selectedsprite) {
            if (this.keys[localplay.keycode.ALT] && !this.level.isAvatar(this.selectedsprite.body)) {
                //
                // duplicate
                //
                this.duplicate = this.selectedsprite.userdata.duplicate();
                this.level.additem(this.duplicate);
                this.selectedsprite = this.duplicate.sprite;
            }
            this.selectedsprite.beginedit();
            this.rollover = null;
        }
    }
    AddThingsEditor.prototype.pointermove = function(p) {
        p.scale(this.inversescale);
        if (this.selectedsprite) {
            this.selectedsprite.editPosition.x = p.x;
            this.selectedsprite.editPosition.y = p.y;
        } else {
            this.rollover = this.level.world.spriteAtPoint(p);
        }
    }
    AddThingsEditor.prototype.pointerup = function(p) {
        if (this.selectedsprite) {
            this.selectedsprite.commitedit();
            this.selectedsprite = null;
            this.duplicate = null;
        }
    }
    //
    //
    //
    AddThingsEditor.prototype.onmousedown = function (e) {
        localplay.domutils.fixEvent(e);
        localplay.domutils.stopPropagation(e);
        var p = new Point(e.offsetX, e.offsetY);
        this.pointerdown(p);
        return false;
    }

    AddThingsEditor.prototype.onmousemove = function (e) {
        //if (e.target == this.selection) return; // stops the selection from flickering
        localplay.domutils.fixEvent(e);
        localplay.domutils.stopPropagation(e);
        var p = new Point(e.offsetX, e.offsetY);
        this.pointermove(p);
        return false;
    }

    AddThingsEditor.prototype.onmouseup = function (e) {
        localplay.domutils.fixEvent(e);
        localplay.domutils.stopPropagation(e);
        var p = new Point(e.offsetX, e.offsetY);
        this.pointerup(p);
        return false;
    }

    AddThingsEditor.prototype.onmouseout = function (e) {
        localplay.domutils.fixEvent(e);
        localplay.domutils.stopPropagation(e);
        if (this.selectedsprite && !this.level.isAvatar(this.selectedsprite.body)) {
            //
            // 
            //
            var _this = this;
            localplay.dialogbox.confirm("Platform", "Are you sure you want to remove this thing from the game?",
                function (confirm) {
                    if (confirm) {
                        _this.level.removeitem(_this.selectedsprite,true);
                    } else {
                        _this.selectedsprite.canceledit();
                    }
                    _this.selectedsprite = null;
                    _this.duplicate = null;
                });
        }
        return false;
    }

    AddThingsEditor.prototype.onkeydown = function (e) {
        this.keys[e.keyCode] = true;
        if (e.keyCode == localplay.keycode.ESC) {
            if (this.duplicate) {
                this.level.removeitem(this.duplicate, true);
            } else if (this.selectedsprite) {
                this.selectedsprite.canceledit();
            }
            this.duplicate = null;
            this.selectedsprite = null;
        }
    }

    AddThingsEditor.prototype.onkeyup = function (e) {
        this.keys[e.keyCode] = false;
    }



    addthings.createaddthingseditor = function (level) {
        return new AddThingsEditor(level);
    }
    return addthings;

})();
