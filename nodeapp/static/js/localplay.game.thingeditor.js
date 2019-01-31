/**
 *
 * @source: https://github.com/LocalPlay/PlayYourPlace/tree/master/htdocs/js/localplay.game.thingeditor.js
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

localplay.game.thingeditor = (function () {
    var thingeditor = {};
    //
    //
    //
    var mousetrackingmode = {
        rotatescale: "rotatescale",
        rotate: "rotate",
        scale: "scale",
        move: "move",
        background: "background",
        duplicate: "duplicate",
        none: "none"
    }
    //
    // thing selection indicator
    //
    var deleteindex = 2;
    var duplicateindex = 4;
    var selectiontools = [
        {
            id: mousetrackingmode.move,
            source: "/images/selection/move.png",
            image: new Image(),
            offset: {
                x: 0, y: 0
            }
        },
        {
            id: "properties",
            source: "/images/selection/properties.png",
            image: new Image(),
            offset: {
                x: -1, y: -1
            }
        },
        {
            id: "delete",
            source: "/images/selection/delete.png",
            image: new Image(),
            offset: {
                x: 1, y: -1
            }
        },
        {
            id: mousetrackingmode.rotatescale,
            source: "/images/selection/rotatescale.png",
            image: new Image(),
            offset: {
                x: 1, y: 1
            }
        },
        {
            id: mousetrackingmode.duplicate,
            source: "/images/selection/duplicate.png",
            image: new Image(),
            offset: {
                x: -1, y: 1
            }
        }
        /*
        {
            id: mousetrackingmode.rotate,
            source: "/images/icons/rotate-03.png",
            image: new Image(),
            offset: {
                x: 1, y: 1
            }
        },
        {
            id: mousetrackingmode.scale,
            source: "/images/icons/resize-03.png",
            image: new Image(),
            offset: {
                x: -1, y: 1
            }
        }
        */
    ];
    //
    // preload icons
    //
    for (var i = 0; i < selectiontools.length; i++) {
        selectiontools[i].image.src = selectiontools[i].source;
    }
    var backgroundscrollindicator = new Image();
    backgroundscrollindicator.src = "/images/hscroll.png";

    function ThingSelection() {
        this.sprite = null;
        this.isavatar = false;
        this.selectedicon = null;
        this.rollover = [];
        this.toolbounds = [];
        for (var i = 0; i < selectiontools.length; i++) {
            this.toolbounds.push(new Rectangle());
            this.rollover.push(false);
        }
        this.boundaabblistener = this.aabblistener.bind(this);
    }

    ThingSelection.prototype.dealloc = function () {
        if (this.sprite) {
            this.sprite.removeAABBListener(this.boundaabblistener);
        }
        this.sprite = null;
    }

    ThingSelection.prototype.setsprite = function (sprite, scale) {
        this.selectedicon = null;
        if ( this.sprite ) {
            this.sprite.removeAABBListener(this.boundaabblistener);
        }
        this.sprite = sprite;
        if (this.sprite) {
            this.sprite.addAABBListener(this.boundaabblistener);
        }
        this.update(scale);
    }

    ThingSelection.prototype.aabblistener = function (sprite) {
        this.update(1.0);
    }

    ThingSelection.prototype.update = function (scale) {
        if (this.sprite) {
            this.isavatar = this.sprite.body && this.sprite.userdata.level.isAvatar(this.sprite.body);
            //var minimumdim = 64 * ( scale ? scale : 1.0 );
            var minimumdim = 128 * ( scale ? scale : 1.0 );
            this.aabb = this.sprite.getAABB().duplicate();
            if (this.aabb.width < minimumdim || this.aabb.height < minimumdim) {
                var growth = Math.max(minimumdim - this.aabb.height, minimumdim - this.aabb.width) / 2;
                this.aabb.grow(growth, growth);
            } else {
                this.aabb.grow(4, 4);
            }
            //this.aabb.scalefromcenter(scale);
            var cp = this.aabb.getcenter();
            for (var i = 0; i < selectiontools.length; i++) {
                this.toolbounds[i].width = Math.max( 24, Math.min( 48, selectiontools[i].image.naturalWidth ) );
                this.toolbounds[i].height = Math.max( 24, Math.min( 48, selectiontools[i].image.naturalHeight ) );
                this.toolbounds[i].x = cp.x - (this.toolbounds[i].width / 2);
                this.toolbounds[i].y = cp.y - (this.toolbounds[i].height / 2);
                this.toolbounds[i].x += (this.aabb.width / 2.0) * selectiontools[i].offset.x;
                this.toolbounds[i].y += (this.aabb.height / 2.0) * selectiontools[i].offset.y;
            }
        }
    }

    ThingSelection.prototype.draw = function (context, scale) {
        if (this.sprite) {
            context.save();
            //
            // draw selection rectangle
            //
            var dash = Math.ceil(5 * scale);
            if (context.setLineDash !== undefined) context.setLineDash([dash, dash]);
            if (context.mozDash !== undefined) context.mozDash = [dash, dash];
            context.lineWidth = Math.ceil(2 * scale);
            context.strokeStyle = localplay.colours.orange;
            context.strokeRect(this.aabb.x, this.aabb.y, this.aabb.width, this.aabb.height);
            //
            // draw tool icons
            //
            for (var i = 0; i < selectiontools.length; i++) {
                if (this.isavatar && ( i === deleteindex || i === duplicateindex ) ) continue;
                var bounds = this.toolbounds[i].duplicate();
                bounds.scalefromcenter(scale);
                if (this.rollover[i]) {
                    context.globalAlpha = 0.5;
                } else {
                    context.globalAlpha = 1.0;
                }
                if ( selectiontools[i].image.complete ) {
                    context.drawImage(selectiontools[i].image, bounds.x, bounds.y, bounds.width, bounds.height);
                } else {
                    context.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
                }
            }
            context.restore();
        }
    }

    ThingSelection.prototype.mousedown = function (p, scale) {
        if (this.sprite) {
            for (var i = 0; i < this.toolbounds.length; i++) {
                if (this.isavatar && ( i === deleteindex || i === duplicateindex ) ) continue;
                var bounds = this.toolbounds[i].duplicate();
                bounds.scalefromcenter(scale);
                if (bounds.contains(p)) {
                    this.selectedicon = selectiontools[i].image;
                    return selectiontools[i].id;
                }
            }
            //
            // default to move if click is in the aabb
            //
            if (this.aabb.contains(p)) {
                this.selectedicon = selectiontools[0].image;
                return selectiontools[0].id;
            }
        }
        return "";
    }
    ThingSelection.prototype.mousemove = function (p, scale) {
        if (this.sprite) {
            for (var i = 0; i < this.toolbounds.length; i++) {
                if (this.isavatar && ( i === deleteindex || i === duplicateindex )) continue;
                var bounds = this.toolbounds[i].duplicate();
                bounds.scalefromcenter(scale);
                this.rollover[i] = bounds.contains(p);
            }
        }
    }
    //
    //
    //
    function ThingEditor(level) {
        var _this = this;
        this.level = level;
        //
        // attach to game
        //
        localplay.game.controller.attachcontroller(level.game, this);
        this.boundstatechange = this.onstatechange.bind(this); // TODO: this should probably be moved to game.controller
        this.level.addEventListener("statechange", this.boundstatechange);
        //
        // shift game canvas into our layout
        //
        this.container = document.createElement("div");
        this.container.id = "thingeditor";
        this.container.style.position = "absolute";
        this.container.style.top = "0px";
        this.container.style.left = "0px";
        this.container.style.bottom = "0px";
        this.container.style.right = "0px";
        this.container.style.overflow = "hidden";
        /*
        this.canvas = document.createElement("canvas");
        this.canvas.className = "thingview";
        this.canvas.width = level.canvas.width;
        this.canvas.height = level.canvas.height;
        this.container.appendChild(this.canvas);
        this.level.game.setcanvas(this.canvas);
        this.canvasoffset = new Point();
        */
        this.canvas = level.canvas;
        //
        // build ui
        //
        this.rollover = null;
        this.selectedsprite = null;
        this.selection = new ThingSelection();
        this.mousetrackingmode = mousetrackingmode.none;
        this.mousetrackingposition = new Point();
        this.mousetrackingduplicate = null;
        this.keys = [];
        //
        // hook events
        //
        /*
        localplay.touch.attach( this.canvas, {
            pointerdown: function(p) {
                _this.pointerdown(p);
            },
            pointermove: function(p) {
                _this.pointermove(p);
            },
            pointerup: function(p) {
                _this.pointerup(p);
            }
        });
        */
        localplay.touch.attach( this.container, {
            pointerdown: function(p) {
                _this.pointerdown(p);
            },
            pointermove: function(p) {
                _this.pointermove(p);
            },
            pointerup: function(p) {
                _this.pointerup(p);
            }
        });
        //
        //
        //
        if ( !localplay.touchsupport() ) {
            //this.boundkeydown = this.onkeydown.bind(this);
            //this.boundkeyup = this.onkeyup.bind(this);
            window.addEventListener("keydown", function(e) {
                _this.onkeydown(e);
            });
            window.addEventListener("keyup", function(e) {
                _this.onkeyup(e);
            });
        }
        //
        //
        //
        //this.boundresize = this.onresize.bind(this);
        window.addEventListener("resize", function(e) {
            _this.onresize(e);
        });
        //
        //
        //
        this.level.reset();
        this.level.trackavatar = false;
        this.level.game.paused = true;
        this.level.paused = true;
        this.thingpropertyeditor = null;
        //
        // ensure level update is called until loaded 
        //
        var monitor = function() {
            _this.level.update();
            _this.redraw();
            if ( !_this.level.loaded ) {
                setTimeout( monitor, 10 );
            }
        };
        monitor();
    }
    //
    // required editor methods
    //
    ThingEditor.prototype.initialise = function () {
        this.onresize();
        localplay.showtip("Click things to change and move them<br />Click and drag the background to scroll the game", this.container);
    }

    ThingEditor.prototype.dealloc = function () {
        if ( this.thingpropertyeditor ) {
            this.thingpropertyeditor.close();
            this.thingpropertyeditor = null;
        }
        localplay.showtip();
        if (this.container) {
            localplay.domutils.purgeDOMElement(this.container);
        }
    }
    //
    // required controller methods
    //
    ThingEditor.prototype.redraw = function() {
        this.level.draw();
        this.draw();
    }
    ThingEditor.prototype.draw = function () {
        var context = this.level.world.context;
        var scale = localplay.defaultsize.height / this.canvas.offsetHeight;
        var minimumdim = 64 * scale;
        if (this.istrackingmouse()) {
            context.save();
            if (this.selectedsprite) {
                var p0 = this.selectedsprite.editPosition.duplicate();
                var p1 = this.mousetrackingposition;
                p0.moveby(this.level.game.getviewportoffset());

                context.strokeStyle =
                context.fillStyle = localplay.colours.orange;
                context.lineWidth = 2 * scale;

                var radius = 2 * scale;
                var offset = new Point(p1.x - p0.x, p1.y - p0.y);
                offset.normalise();
                offset.scale(radius);

                context.beginPath();
                context.moveTo(p0.x + offset.x, p0.y + offset.y);
                context.lineTo(p1.x, p1.y);
                context.stroke();

                context.beginPath();
                context.arc(p0.x, p0.y, radius, 0.0, Math.PI * 2.0);
                context.stroke();
                
                if (this.selection.selectedicon) {
                    context.drawImage(this.selection.selectedicon, p1.x - 11, p1.y - 11, 22, 22);
                } else {
                    context.beginPath();
                    context.arc(p1.x, p1.y, 8, 0.0, Math.PI * 2.0);
                    context.stroke();
                }
            } else {
                var p1 = this.mousetrackingposition;
                context.drawImage(backgroundscrollindicator, p1.x - 11, p1.y - 11, 22, 22);
            }
            context.restore();
        } else {
            //
            // draw selection and rollover
            //
            if (this.rolloversprite) {
                var aabb = this.rolloversprite.getAABB().duplicate();
                if (aabb.height < minimumdim || aabb.width < minimumdim) { // grow to accomodate interface
                    var growth = Math.max(minimumdim - aabb.height, minimumdim - aabb.width) / 2;
                    aabb.grow(growth, growth);
                } else {
                    aabb.grow(4, 4);
                }
                this.level.world.startDrawSprites();
                context.lineWidth = 2 * scale;
                context.strokeStyle = 'lightgrey';
                if (context.setLineDash !== undefined) context.setLineDash([5, 5]);
                if (context.mozDash !== undefined) context.mozDash = [5, 5];
                context.strokeRect(aabb.x, aabb.y, aabb.width, aabb.height);
                this.level.world.endDrawSprites();
            }
            if (this.selectedsprite) {
                this.level.world.startDrawSprites();
                this.selection.draw(context, scale);
                this.level.world.endDrawSprites();
            }
        }
    }

    ThingEditor.prototype.detach = function () {
        this.level.removeEventListener("statechange", this.boundstatechange);
        this.level.reserialise();
        var canvas = document.getElementById("game.canvas");
        if (canvas) {
            this.level.game.setcanvas(canvas);
        }
    }


    ThingEditor.prototype.onstatechange = function (e) {
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
        this.redraw();
    }

    ThingEditor.prototype.adjustscrollbar = function () {
        if( localplay.touchsupport() ) return;
        if (!this.scrollbar) {
            //
            // TODO: move this into generic scrollbar class
            //
            this.scrollbar = document.createElement("div");
            this.scrollbar.classList.add("scrollbar");
            this.scrollbarthumb = document.createElement("div");
            this.scrollbarthumb.classList.add("scrollbarthumb");
            this.scrollbar.appendChild(this.scrollbarthumb);
            this.scrollbar.style.width = "100%";
            this.container.appendChild(this.scrollbar);
            //
            // scroll events
            //
            var _this = this;
            var scrolltracker = {
                scrollanchor: 0,
                hookevents: function () {
                    document.addEventListener("mouseup", this, true);
                    document.addEventListener("mousemove", this, true);
                },
                unhookEvents: function () {
                    document.removeEventListener("mouseup", this, true);
                    document.removeEventListener("mousemove", this, true);
                },
                handleEvent: function (e) {
                    switch (e.type) {
                        case 'mouseup':
                            this.unhookEvents();
                            _this.adjustscrollbar();
                            break;
                        case 'mousemove':
                            if (e.target === _this.scrollbar || e.target === _this.scrollbarthumb) {
                                localplay.domutils.fixEvent(e);
                                var x = e.offsetX;
                                var offset = _this.scrollbarthumb.offsetLeft;
                                var width = _this.scrollbarthumb.offsetWidth;
                                if (e.target === _this.scrollbarthumb) {
                                    x += offset;
                                }
                                var thumbposition = Math.max(0, Math.min(_this.scrollbar.offsetWidth - width, x - scrolltracker.scrollanchor));
                                _this.scrollbarthumb.style.left = thumbposition + "px";
                                var viewportoffset = (thumbposition / (_this.scrollbar.offsetWidth - width)) * (_this.level.bounds.width - _this.level.world.viewport.width);
                                var dx = viewportoffset - _this.level.world.viewport.x
                                _this.level.scrollviewportby(dx);
                            }
                            break;
                    }
                    localplay.domutils.stopPropagation(e);
                    return false;
                }
            }
            this.scrollbar.onmousedown = function (e) {
                localplay.domutils.fixEvent(e);
                var x = e.offsetX;
                var offset = _this.scrollbarthumb.offsetLeft;
                var width = _this.scrollbarthumb.offsetWidth;
                var pagesize = _this.level.world.viewport.width / 4;
                if (e.target === _this.scrollbarthumb) {
                    x += offset;
                }
                if (x < offset) {
                    _this.level.scrollviewportby(-pagesize);
                    _this.adjustscrollbar();
                } else if (x > offset + width) {
                    _this.level.scrollviewportby(pagesize);
                    _this.adjustscrollbar();
                } else {
                    scrolltracker.hookevents();
                    scrolltracker.scrollanchor = x - offset;
                }
                localplay.domutils.stopPropagation(e);
                return false;
            };
        }

        var totalwidth = this.level.bounds.width;
        var viewportwidth = this.level.world.viewport.width;
        if (totalwidth > viewportwidth) {
            var viewportoffset = this.level.world.viewport.x;
            var thumbwidth = Math.ceil((viewportwidth / totalwidth) * this.scrollbar.offsetWidth);
            var thumboffset = Math.ceil((viewportoffset / totalwidth) * this.scrollbar.offsetWidth);
            this.scrollbarthumb.style.width = thumbwidth + "px";
            this.scrollbarthumb.style.left = thumboffset + "px";
            this.scrollbar.style.visibility = "visible";
        } else {
            this.scrollbar.style.visibility = "hidden";
        }
    }
    //
    //
    //

    ThingEditor.prototype.starttrackingmouse = function (mode) {
        
        this.mousetrackingmode = mode;
        this.firstmousetrackingupdate = true;
        this.mousetrackingduplicate = null;
        if (this.selectedsprite) {
            if (this.keys[localplay.keycode.ALT] && !this.level.isAvatar(this.selectedsprite.body)) {
                //
                // duplicate
                //
                this.mousetrackingduplicate = this.selectedsprite.userdata.duplicate();
                this.level.additem(this.mousetrackingduplicate);
                this.selectedsprite = this.mousetrackingduplicate.sprite;
            }
            this.selectedsprite.beginedit();
        }
        this.redraw();
    }

    ThingEditor.prototype.endtrackingmouse = function () {
        if (this.selectedsprite) {
            this.mousetrackingduplicate = null;
            this.selectedsprite.commitedit();
            this.level.reserialise();
            this.selection.setsprite(this.selectedsprite);
        }
        this.mousetrackingmode = mousetrackingmode.none;
        //this.showtip();
        this.redraw();
    }
    
    ThingEditor.prototype.canceltrackingmouse = function () {
        
        this.mousetrackingmode = mousetrackingmode.none;
        if (this.mousetrackingduplicate) {
            this.level.removeitem(this.mousetrackingduplicate, true);
            this.mousetrackingduplicate = null;
        } else if (this.selectedsprite) {
            this.selectedsprite.canceledit();
        }
        this.selection.update();
        //this.showtip();
        this.redraw();
    }
    
    ThingEditor.prototype.updatemousetracking = function (p) {
        
        this.mousetrackingposition.set(p.x, p.y);

        var p0 = this.selectedsprite ? this.selectedsprite.editPosition.duplicate() : null;
        var p1 = this.mousetrackingposition.duplicate();
        var offset = this.level.game.getviewportoffset();
        if (p0) p0.moveby(offset);

        if (this.mousetrackingmode === mousetrackingmode.rotatescale) {
            var rotation = Math.atan2(p1.y - p0.y, p1.x - p0.x);
            var scaled = p1.distance(p0);
            if (this.firstmousetrackingupdate) {
                this.mousetrackingreference = { rotation: rotation, scaled: scaled };
                this.firstmousetrackingupdate = false;
            } else {
                this.selectedsprite.editRotation = rotation - this.mousetrackingreference.rotation;
                this.selectedsprite.editScale = Math.min(100.0, Math.max(0.1, scaled / this.mousetrackingreference.scaled));
            }
        } else if (this.mousetrackingmode === mousetrackingmode.rotate) {
            var rotation = Math.atan2(p1.y - p0.y, p1.x - p0.x);
            if (this.firstmousetrackingupdate) {
                this.mousetrackingreference = rotation;
                this.firstmousetrackingupdate = false;
            } else {
                this.selectedsprite.editRotation = rotation - this.mousetrackingreference;
            }
        } else if (this.mousetrackingmode === mousetrackingmode.scale) {
            var d = p1.distance(p0);
            if (this.firstmousetrackingupdate) {
                this.mousetrackingreference = d;
                this.firstmousetrackingupdate = false;
            } else {
                var scale = Math.min(100.0, Math.max(0.1, d / this.mousetrackingreference));
                this.selectedsprite.editScale = scale;
            }
        } else if (this.mousetrackingmode === mousetrackingmode.move) {
            if (this.firstmousetrackingupdate) {
                this.mousetrackingreference = new Point(p0.x - p1.x, p0.y - p1.y);
                this.firstmousetrackingupdate = false;
            } else {
                this.selectedsprite.editPosition.x = (p1.x + this.mousetrackingreference.x) - offset.x;
                this.selectedsprite.editPosition.y = (p1.y + this.mousetrackingreference.y) - offset.y;
            }
        } else if (this.mousetrackingmode === mousetrackingmode.background) {
            if (this.firstmousetrackingupdate) {
                this.mousetrackingreference = new Point(p1.x, p1.y);
                this.firstmousetrackingupdate = false;
            } else {
                this.level.scrollviewportby(this.mousetrackingreference.x - p1.x);
                this.mousetrackingreference.x = p1.x;
                this.mousetrackingreference.y = p1.y;
                this.adjustscrollbar();
            }
        }
    }

    ThingEditor.prototype.istrackingmouse = function () {
        
        return this.mousetrackingmode != mousetrackingmode.none;
       
    }
    //
    //
    //
    ThingEditor.prototype.showpropertyeditor = function () {
        if (this.selectedsprite) {           
            var item = this.selectedsprite.userdata;           
            if (item) {
                var _this = this;
                localplay.showtip();
                /*
                this.thingpropertyeditor = localplay.game.thingpropertyeditor.createthingpropertyeditor(item, function() {
                    item.options = _this.thingpropertyeditor.options;
                    _this.level.reserialise();
                });
                this.container.parentElement.appendChild(this.thingpropertyeditor.container);
                this.thingpropertyeditor.initialise();
                */
                this.thingpropertyeditor = localplay.game.thingpropertyeditor.createthingpropertyeditordialog(item, function() {
                    item.options = _this.thingpropertyeditor.options;
                    _this.level.reserialise();
                    item.createsprite();
                    _this.selectedsprite = item.sprite;
                    _this.selection.setsprite(item.sprite);
                });
                /*
                var propertyeditor = item.geteditor();
                if (propertyeditor) {
                    localplay.showtip();
                    var title = _this.level.avatar === item ? "Avatar properties" : "Thing properties";
                    var dialog = localplay.dialogbox.createfullscreendialogbox(title, [propertyeditor],
                        [],
                        [], function () {
                            _this.level.reserialise();
                            _this.selectedsprite = item.sprite;
                            _this.selection.setsprite(item.sprite);
                            item.closeeditor();
                            if ( !localplay.touchsupport() ) {
                                localplay.showtip("Press the alt key whilst moving, rotating or scaling to duplicate", _this.container);
                            }
                        });
                    dialog.show();
                    //
                    //
                    //
                    item.initialiseeditor();
                }
                */
            }
        }
    }

    ThingEditor.prototype.confirmdelete = function () {
        if (this.selectedsprite) {
            var item = this.selectedsprite.userdata;
            if (item) {
                if (true) {//this.level.gameplay.containsItem(item)) {
                    var _this = this;
                    localplay.dialogbox.confirm("Delete item", "Are you sure you want to delete this item?",
                    function (confirm) {
                        if (confirm) {
                            _this.level.removeitem(item, true);
                            _this.level.reserialise();
                            _this.selectedsprite = null;
                            _this.selection.setsprite(null);
                        }
                    });

                } else {
                    this.selectedsprite = null;
                    this.selection.setsprite(null);
                    this.level.removeitem(item, true);
                    this.level.reserialise();
                }
            }
        }
    }
    //
    //
    //
    ThingEditor.prototype.onmousedown = function (e) {
        if (e.target === this.container || e.target === this.canvas) {
            localplay.domutils.fixEvent(e);
            var p = e.target === this.canvas ? new Point(e.offsetX, e.offsetY) : new Point(e.offsetX - this.canvasoffset.x, e.offsetY - this.canvasoffset.y);
            this.pointerdown(p);
       }
       return false;
    }
    
    ThingEditor.prototype.pointerdown = function (p) {
        var _this = this;
        var mp = p.duplicate(); // need the raw mouse point for selection mousedown
        var scale = localplay.defaultsize.height / this.canvas.offsetHeight;
        var sprite = this.level.game.spriteatpoint(p);
        if (this.selectedsprite) {
            var command = this.selection.mousedown(p, scale);
            //console.log( 'ThingEditor.onmousedown : command=' + command );
            switch (command) {
                case mousetrackingmode.move:
                case mousetrackingmode.rotate:
                case mousetrackingmode.scale:
                case mousetrackingmode.rotatescale:
                    this.starttrackingmouse(command);
                    mp.scale(scale);
                    this.updatemousetracking(mp);
                    break;
                case "properties":
                    this.showpropertyeditor();
                    break;
                case "delete":
                    this.confirmdelete();
                    break;
                case "duplicate":
                    var duplicate = this.selectedsprite.userdata.duplicate();
                    this.level.additem(duplicate);
                    duplicate.sprite.moveby({x:44,y:44});
                    //duplicate.sethometocurrentposition();
                    this.selectedsprite = duplicate.sprite;
                    this.selection.setsprite(this.selectedsprite);
                    break;
                default: {
                    if (sprite != this.selectedsprite) {
                        this.selectedsprite = sprite;
                        this.selection.setsprite(this.selectedsprite);
                        if (this.selectedsprite && !localplay.touchsupport() && !this.level.isAvatar(this.selectedsprite.body)) {
                            localplay.showtip("Press the alt key whilst moving, rotating or scaling to duplicate", this.container);
                        } else {
                            localplay.showtip();
                        }
                    }
                }
            }
        } else {
            if (sprite) {
                //console.log( 'ThingEditor.onmousedown : selecting sprite' );
                this.rolloversprite = null;
                this.selectedsprite = sprite;
                this.selection.setsprite(sprite, scale);
                if (this.selectedsprite && !this.level.isAvatar(this.selectedsprite.body)) {
                    localplay.showtip();//"Press the alt key whilst moving, rotating or scaling to duplicate", this.container);
                } else {
                    localplay.showtip();
                }
            } else {
                //console.log( 'ThingEditor.onmousedown : tracking background' );
                this.selectedsprite = null;
                this.selection.setsprite(null);
                this.starttrackingmouse(mousetrackingmode.background);
                localplay.showtip("Drag to scroll the background", this.container);
            }
        }
        this.redraw();
    }
    
    ThingEditor.prototype.onmouseup = function (e) {
        this.pointerup();
        return false;
    }
    
    ThingEditor.prototype.pointerup = function (p) {
        if (this.istrackingmouse()) {
            this.endtrackingmouse();
        }
    }
    
    ThingEditor.prototype.onmousemove = function (e) {
        //
        //
        //
        if (e.target === this.container || e.target === this.canvas) {
            localplay.domutils.fixEvent(e);
            var p = e.target === this.canvas ? new Point(e.offsetX, e.offsetY) : new Point(e.offsetX - this.canvasoffset.x, e.offsetY - this.canvasoffset.y);
            this.pointermove(p);
         }
        return false;
    }
    
    ThingEditor.prototype.pointermove = function (p) {
        var scale = localplay.defaultsize.height / this.canvas.offsetHeight;
        //console.log( 'ThingEditor.pointermove : scale = ' + scale );
        if (this.istrackingmouse()) {
            p.scale(scale);
            this.updatemousetracking(p);
            this.redraw();
        } else {
            if (this.scrollbar) {
                //
                // TODO: this condition needs a method
                //
                var totalwidth = this.level.bounds.width;
                var viewportwidth = this.level.world.viewport.width;
                if (totalwidth > viewportwidth) {
                    //if (e.offsetY > this.scrollbar.offsetTop) {
                    if (p.y >  this.scrollbar.offsetTop) {
                        this.scrollbar.style.visibility = "visible";
                    } else {
                        this.scrollbar.style.visibility = "hidden";
                    }
                }
            }
            //
            // update rollover
            //
            var redraw = false;
            var sprite = this.level.game.spriteatpoint(p);
            if (sprite && sprite !== this.selectedsprite) {
                if ( this.rolloversprite !== sprite ) {
                    redraw = true;
                    this.rolloversprite = sprite;
                }
            } else if ( this.rolloversprite ) {
                redraw = true;
                this.rolloversprite = null;
            }
            //
            //
            //
            if (this.selectedsprite) {
                redraw = true;
                this.selection.mousemove(p, scale);
            }
            //
            //
            //
            if ( redraw ) {
                this.redraw();
            }
        }
    }
    
    ThingEditor.prototype.onkeydown = function (e) {
        this.keys[e.keyCode] = true;
        if (this.keys[localplay.keycode.ESC]) {
            if (this.istrackingmouse()) {
                this.canceltrackingmouse();
            }
        } else {
            this.level.onkeydown(e);
        }
        return false;
    }

    ThingEditor.prototype.onkeyup = function (e) {
        this.keys[e.keyCode] = false;
        return false;
    }

    ThingEditor.prototype.onresize = function (e) {
        //this.level.game.fittocontainer();
        var aspect = this.canvas.offsetWidth / this.canvas.offsetHeight;
        this.canvas.width = Math.round(this.canvas.height * aspect);
        /*
        if ( localplay.touchsupport() ) {
            this.canvasoffset = localplay.domutils.elementPosition( this.canvas );
        } else {
            this.canvasoffset = new Point(this.canvas.offsetLeft, this.canvas.offsetTop);
        }
        */
        this.canvasbounds =
            new Rectangle(this.canvas.offsetLeft, this.level.offsetTop,
            this.canvas.offsetWidth, this.canvas.offsetHeight);
        
        var scale = this.canvas.height / localplay.defaultsize.height;
        if (this.level.background) {
            this.level.background.setscale(scale);
            this.level.adjustviewport();
        }
        this.adjustscrollbar();
        this.redraw();
        return false;
    }

    thingeditor.createnewthingeditor = function (level) {
        return new ThingEditor(level);
    }

    return thingeditor;
})();



