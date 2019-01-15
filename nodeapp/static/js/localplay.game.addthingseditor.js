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

localplay.game.addthingseditor = (function () {
    var addthingseditor = {};

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
            window.addEventListener('resize', function(e) {
                _this.container.style.top = ( titleBar.offsetHeight + 16 ) + 'px';
            });
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
        var d = new Date();
        this.prefix = "layout.medialibrary." + d.getTime();
        this.medialibrary = document.createElement("div");
        this.medialibrary.id = this.prefix;
        this.medialibrary.className = "flexlistview";
        //this.medialibrary.style.top = "260px";
        this.medialibrary.innerHTML = Mustache.render(localplay.listview.editablecontainer, { prefix: this.prefix, addlabel: "New" });
        //
        //
        //
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
    AddThingsEditor.prototype.initialise = function (callback) {
        var _this = this;
        this.medialibrary.controller = localplay.listview.createlistview(this.prefix, "/media?type=object&listview=true", 20);
        this.medialibrary.controller.onselect = function (item) {
            var url = item.data.url;
            var type = "platform";
            var addItem = function() {
                var b = _this.level.world.viewport;
                var p = new Point(b.x + b.width / 2.0, b.y + b.height / 2.0);
                var scale = _this.level.canvas.height / _this.level.background.height;
                p.scale(scale);
                if (type.length > 0) {
                    _this.level.newitem(type, url, p);
                    _this.level.reserialise();
                }
            };
            type = _this.level.getTypeOfMedia(url);
            if (type) {
                addItem();
            } else {
                var itemposn = localplay.domutils.elementPosition(item);
                itemposn.x += item.offsetWidth / 2;
                itemposn.y += item.offsetHeight / 2;
                localplay.dialogbox.pinnedpopupatpoint(itemposn, addthingtemplate, null, function (e) {
                    var selector = e.target.id.split('.');
                    if (selector.length >= 3) {
                        var command = selector[2];
                        switch (command) {
                            case "add":
                                type = localplay.domutils.valueOfRadioGroup("layout.type");
                                addItem();
                                break;
                            case "cancel":
                                break;
                        }
                    }
                    if( callback ) {
                        callback();
                    }
                    return true;
                });
            }
        };
        //
        //
        //
        var addobjectbutton = document.getElementById(this.prefix + ".localplay.addlistitem");
        if (addobjectbutton) {
            addobjectbutton.onclick = function (e) {
                var objecteditor = localplay.objecteditor.createobjecteditor("Add Thing", function () {
                    localplay.showtip("Tap object below to add it to your game", _this.layoutview);
                    _this.medialibrary.controller.refresh();
                });
            }
        }
        //
        //
        //
        localplay.showtip("Tap object below to add it to your game", this.layoutview);
    }
    AddThingsEditor.prototype.dealloc = function () {
        //
        //
        //
        localplay.showtip();
    }
    //
    //
    //
    AddThingsEditor.prototype.draw = function () {
    }

    AddThingsEditor.prototype.detach = function () {
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
    //
    //
    //
    AddThingsEditor.prototype.onmousedown = function (e) {
    }

    AddThingsEditor.prototype.onmousemove = function (e) {
    }

    AddThingsEditor.prototype.onmouseup = function (e) {
    }

    AddThingsEditor.prototype.onmouseout = function (e) {
    }

    AddThingsEditor.prototype.onkeydown = function (e) {
    }

    AddThingsEditor.prototype.onkeyup = function (e) {
    }



    addthingseditor.createaddthingseditor = function (level) {
        return new AddThingsEditor(level);
    }
    return addthingseditor;

})();
