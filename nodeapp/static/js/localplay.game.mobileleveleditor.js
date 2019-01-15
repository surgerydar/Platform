/**
 *
 * @source: https://github.com/LocalPlay/PlayYourPlace/tree/master/htdocs/js/localplay.game.mobileleveleditor.js
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

localplay.game.mobileleveleditor = (function () {
    if (localplay.game.mobileleveleditor) return localplay.game.mobileleveleditor;
    var mobileleveleditor = {};
    //
    // templates
    //
    var mainmenu = '\
        {{#items}} \
            <div class="main-menu-item" id="menuitem.{{id}}">{{name}}</div> \
        {{/items}} \
    ';
    
    var createlevel = '\
        <div class="fullscreen" style="background-color: white;" > \
            <div id="mobileleveleditor.createlevel.editorcontainer" class="editorcontainer"> \
            </div> \
            <div id="title-bar"> \
                <img id="title-logo" src="/images/bc-logo.png" /> \
                <img id="title-menu" src="/images/logo-menu.png" /> \
            </div> \
        </div> \
    ';

    var editlevel = '\
        <div class="fullscreen" style="background-color: white;" > \
            <div id="mobileleveleditor.createlevel.editorcontainer" class="editorcontainer"> \
            </div> \
            <div id="title-bar"> \
                <img id="title-logo" src="/images/bc-logo.png" /> \
                <img id="title-menu" src="/images/logo-menu.png" /> \
            </div> \
        </div> \
    ';
    
    var savedialog = '\
        <div style="display: flex; flex-direction: column; justify-content: flex-start; align-items: center; padding: 8px; margin: auto;">\
            <h2>Save Level</h2> \
            <div><input id="savelevel.name" class="required" style="width: 80vw;" type="text" placeholder="Name for level" value="{{name}}"/></p>\
            <p><input id="savelevel.place" class="required" style="width: 80vw;" type="text" placeholder="Place for level" value="{{place}}"/></p>\
            <p><input id="savelevel.change" class="required" style="width: 80vw;" type="text" placeholder="What is the change?" value="{{change}}"/></p>\
            <p><textarea id="savelevel.instructions" style="width: 80vw; height: 80px;" class="required" placeholder="What is the mission?" >{{instructions}}</textarea></p>\
            <p><input id="savelevel.winmessage" style="width: 80vw;" type="text" placeholder="message for winner" value="{{winmessage}}"/></p>\
            <p><input id="savelevel.losemessage" style="width: 80vw;" type="text" placeholder="message for loser" value="{{losemessage}}"/></p>\
            <p style="width: 80vw; text-align: left;">\
                Visibility&nbsp;\
                <input type="radio" id="savelevel.private" name="savelevel.visibility" value="private" /><label for="savelevel.private"></label>&nbsp;private \
                <input type="radio" id="savelevel.public" name="savelevel.visibility" value="public" /><label for="savelevel.public"></label>&nbsp;public<br/> \
            </p>\
            <p style="max-width: 80vw; text-align: left;">\
                 <input type="checkbox" id="savelevel.savecopy" name="savelevel.savecopy" /><label for="savelevel.savecopy"></label>&nbsp;save a copy<br/> \
            </p> \
            <div style="display: flex; flex-direction: row; justify-content: space-between; height: 42px; width: 80vw;">\
                <div id="button.savelevel.cancel" class="menubaritem"  > \
                    <img class="menubaritem" src="/images/icons/close-cancel-01.png" /> \
                    &nbsp;Cancel \
                </div> \
                <div id="button.savelevel.save" class="menubaritem" > \
                    <img class="menubaritem" src="/images/icons/save-01.png" /> \
                    &nbsp;Save \
                </div> \
            </div> \
        </div>\
    ';
    var preview = '\
            <div style="position: absolute; top: 0px; left: 0px; right: 0px; bottom: 0px; background-color: white;"> \
                <canvas id="preview.canvas" class="slider" width="1024" height="723" ></canvas> \
            </div> \
    ';
    var list = '\
    <div id="mobileleveleditor.list.header">\
        <div id="mobileleveleditor.list.pagination">\
        </div> \
        <div id="mobileleveleditor.list.search"> \
            <input id="mobileleveleditor.list.searchfield" type="search" /> \
        </div> \
        <div id="mobileleveleditor.list.add" ></div>\
    </div> \
    <div id="mobileleveleditor.list.body"> \
        {{listcontent}} \
    </div> \
    ';
    //
    //
    //
    var backgroundeditor = {
        breadcrumb: "Edit background",
        prompt: "MAKE A NEW GAME - START BY CREATING YOUR BACKGROUND",
        init: function () {
            coverGame(true);
            var editor = localplay.game.backgroundeditor.createbackgroundeditor(level);
            createleveleditorcontainer.appendChild(editor.container);
            editor.initialise();
            createleveleditorcontainer.localplay.backgroundeditor = editor;
        },
        dealloc: function () {
            if (createleveleditorcontainer.localplay.backgroundeditor) {
                createleveleditorcontainer.localplay.backgroundeditor.dealloc();
                delete createleveleditorcontainer.localplay.backgroundeditor;
                createleveleditorcontainer.localplay.backgroundeditor = null;
                coverGame(false);
            }
        },
        exitcondition: function() {
            if (level.background.countimages() == 0) {
                localplay.dialogbox.alert("Platform", "Your level needs a place!<br />Please add at least one background image.");
                return false;
            }
            return true;
        }
    }
    
    var addthingseditor = {
        breadcrumb: "Add things",
        prompt: "ADD THINGS TO YOUR GAME LEVEL",
        init: function () {
            coverGame(true);
            var editor = localplay.game.addthingseditor.createaddthingseditor(level);
            createleveleditorcontainer.appendChild(editor.container);
            editor.initialise(function() {
                gotocreatelevelphase(0);
            });
            createleveleditorcontainer.localplay.addthingseditor = editor;
        },
        dealloc: function () {
            if (createleveleditorcontainer.localplay.addthingseditor) {
                //createleveleditorcontainer.localplay.addthingseditor.save();
                createleveleditorcontainer.localplay.addthingseditor.dealloc();
                createleveleditorcontainer.removeChild(createleveleditorcontainer.localplay.addthingseditor.container);
                delete createleveleditorcontainer.localplay.addthingseditor;
                createleveleditorcontainer.localplay.addthingseditor = null;
                coverGame(false);
            }
        },
        exitcondition: function () {
            /*
            if (level.countitems() <= 0) {
                localplay.dialogbox.alert("Platform", "Your level needs some things!<br />Please add some platforms, obstacles, pickups or goals.");
                return false;
            }
            */
            return true;
        }
    };

    var thingeditor = {
        breadcrumb: "Edit layout",
        prompt: "MAKE THINGS DO STUFF - EDIT YOUR THINGS",
        init: function () {
            coverGame(false);
            var editor = localplay.game.thingeditor.createnewthingeditor(level);
            createleveleditorcontainer.appendChild(editor.container);
            editor.initialise();
            createleveleditorcontainer.localplay.thingeditor = editor;
        },
        dealloc: function () {
            if (createleveleditorcontainer.localplay.thingeditor) {
                createleveleditorcontainer.localplay.thingeditor.dealloc();
                createleveleditorcontainer.removeChild(createleveleditorcontainer.localplay.thingeditor.container);
                delete createleveleditorcontainer.localplay.thingeditor;
                createleveleditorcontainer.localplay.thingeditor = null;
            }
        },
        exitcondition: function () {
            return true;
        }
    };

    var storyeditor = {
        breadcrumb: "Edit gameplay",
        prompt: "MAKE THINGS DO STUFF - ADD GAMEPLAY RULES",
        init: function () {
            coverGame(true);
            var editor = localplay.game.storyeditor.createstoryeditor(level);
            createleveleditorcontainer.appendChild(editor.container);
            editor.initialise();
            createleveleditorcontainer.localplay.storyeditor = editor;
        },
        dealloc: function () {
            if (createleveleditorcontainer.localplay.storyeditor) {
                createleveleditorcontainer.localplay.storyeditor.save();
                createleveleditorcontainer.localplay.storyeditor.dealloc();
                createleveleditorcontainer.removeChild(createleveleditorcontainer.localplay.storyeditor.container);
                delete createleveleditorcontainer.localplay.storyeditor;
                createleveleditorcontainer.localplay.storyeditor = null;
                coverGame(false);
            }
        },
        exitcondition: function () {
            return true;
        }
    };

    var soundeditor = {
        breadcrumb: "Edit sounds",
        prompt: "MAKE THINGS DO STUFF - ADD LEVEL SOUNDS",
        init: function () {
            coverGame(true);
            var editor = localplay.game.soundeditor.createlevelsoundeditor(level);
            createleveleditorcontainer.appendChild(editor.container);
            editor.initialise();
            createleveleditorcontainer.localplay.soundeditor = editor;
        },
        dealloc: function () {
            if (createleveleditorcontainer.localplay.soundeditor) {
                createleveleditorcontainer.localplay.soundeditor.dealloc();
                createleveleditorcontainer.removeChild(createleveleditorcontainer.localplay.soundeditor.container);
                delete createleveleditorcontainer.localplay.soundeditor;
                createleveleditorcontainer.localplay.soundeditor = null;
                coverGame(false);
            }
        },
        exitcondition: function () {
            return true;
        }
    };
    //
    // utility functions
    //
    function renderfragment(fragment) {
        //
        // resolve all templated data
        //
        for (var key in fragment.data) {
            if (fragment.data[key].template && fragment.data[key].data) {
                fragment.data[key] = render(fragment.data[key]);
            }
        }
        //
        // process template
        //
        return Mustache.render(fragment.template, fragment.data);
    }

    function hookbuttons(container, selector, callback) {
        for (var i = 0; i < container.childNodes.length; i++) {
            if (container.childNodes[i].id && container.childNodes[i].id.indexOf(selector) === 0) {
                container.childNodes[i].onclick = callback;
            }
            if (container.childNodes[i].childNodes.length > 0) {
                hookbuttons(container.childNodes[i], selector, callback);
            }
        }
    }
    //
    //
    //
    var level = null;
    var canvas = null;
    var maintemplate = createlevel;
    //
    // create level sequence
    //
    var createlevelphase = 0;

    var createlevelsequence = [
        thingeditor,
        backgroundeditor,
        addthingseditor,
        storyeditor,
        soundeditor
    ];
    
    var createlevelcontainer = null;
    var createleveleditorcontainer = null;
    var createlevelmainmenu = null;

    function initialisecreatelevel() {
        //
        //
        //
        var logo = document.querySelector('#title-logo');
        if ( logo ) {
            logo.addEventListener('click', function(e) {
                closeeditor('/');
            });
        }
        //
        //
        //
        createMenu();
        //
        // initialise ui
        //
        createlevelphase = 0;
        createlevelcontainer = document.querySelector("#mobileleveleditor\\.createlevel");
        createleveleditorcontainer = document.querySelector("#mobileleveleditor\\.createlevel\\.editorcontainer");
        if ( createleveleditorcontainer ) {
            createleveleditorcontainer.localplay = {};
        }
    }
    
    function cleanup() {
        //
        // remove mainmenu
        //
        /*
        if (createlevelmainmenu) {
            localplay.menu.dettachmenu(createlevelmainmenu);
        }
        */
        //
        //
        //
        localplay.domutils.purgeDOMElement(createlevelcontainer);
        document.body.removeChild(createlevelcontainer);
    }
    //
    //
    //
    function createlevelclick(e) {
        localplay.domutils.fixEvent(e);
        var selector = localplay.domutils.getButtonSelector(e);
        if (selector.length >= 3) {
            //
            // 
            //
            localplay.log(selector[2]);
            localplay.log("in phase: " + createlevelphase);
            switch (selector[2]) {
                case "next": 
                    gotocreatelevelphase(createlevelphase + 1);
                    break;
                case "prev":
                    gotocreatelevelphase(createlevelphase - 1);
                    break;
                case "save":
                    savelevel();
                    break;
                case "cancel":
                    closeeditor();
                    break;
                case "preview":
                    previewlevel();
                    break;
                case "home":
                    closeeditor(true);
                    break;
            }
        }
    }
    function gotocreatelevelphase(i) {
        if (createleveleditorcontainer&&createleveleditorcontainer.localplay.exitcondition && !createleveleditorcontainer.localplay.exitcondition()) return;
        if (i > createlevelsequence.length - 1) {
            createlevelphase = createlevelsequence.length - 1; 
        } else if (i < 0) {
            createlevelphase = 0;
        } else {
            createlevelphase = i;
        }
        rendercreatelevelphase();
    }

    function setbreadcrumb(text) {
        var breadcrumb = document.getElementById("mobileleveleditor.createlevel.breadcrumb");
        if (breadcrumb) {
            breadcrumb.innerHTML = text ? '<img class="menubaritem" src="/images/icons/breadcrumb.png" />&nbsp;' + text : "";
        }

    }
    function setprompt(text) {
        var prompt = document.getElementById("mobileleveleditor.createlevel.prompt");
        if (prompt) {
            prompt.innerHTML = text;
        }
    }
    function rendercreatelevelphase() {
        var template = createlevelsequence[createlevelphase];
        rendercreateleveltemplate(template);
    }
    function rendercreateleveltemplate(template) {
        //
        // remove previous editor
        //
        if( createleveleditorcontainer.localplay.dealloc) {
            createleveleditorcontainer.localplay.dealloc();
        }
        //
        // editors, these are rendered into the editor container
        //
        if (template.prompt) {
            setprompt(template.prompt);
        } else {
            setprompt("");
        }
        //
        // render fragment
        //
        if (template.fragment) {
            createleveleditorcontainer.innerHTML = renderfragment(template.fragment);
        } else {
            createleveleditorcontainer.innerHTML = "";
        }
        //
        // initialise
        //
        if (template.init) {
            template.init();
        }
        //
        // store dealloc and exit condition
        //
        if (template.dealloc) {
            createleveleditorcontainer.localplay.dealloc = template.dealloc;
        } else {
            createleveleditorcontainer.localplay.dealloc = null;
        }
        if (template.exitcondition) {
            createleveleditorcontainer.localplay.exitcondition = template.exitcondition;
        } else {
            createleveleditorcontainer.localplay.exitcondition = null;
        }

        hookbuttons(createlevelcontainer, "mobileleveleditor.button", createlevelclick);
        //
        //
        //
        var nextbutton = document.getElementById("mobileleveleditor.button.next");
        if (nextbutton) {
            nextbutton.style.visibility = (createlevelphase < createlevelsequence.length - 1) ? 'visible' : 'hidden';
        }
    }
    function coverGame( cover ) {
        if ( cover ) {
            createlevelcontainer.classList.add('cover');
        } else {
            createlevelcontainer.classList.remove('cover');
        }
    }
    
    function createMenu() {
        var menu = document.querySelector('#main-menu');
        if ( menu ) {
            var items = [];
            //
            // add editors
            //
            for (var i = 0; i < createlevelsequence.length; i++) {
                items.push({
                    name: createlevelsequence[i].breadcrumb,
                    id: "phase." + i
                });
            }
            //
            // add global commands
            //
            items.push({
                name: "Save game",
                id: "save"
            });
            items.push({
                name: "Play game",
                id: "play"
            });
            //
            // render menu
            //
            menu.innerHTML = Mustache.render( mainmenu, { items: items } );
            //
            // hook menu button
            //
            var menuButton = document.querySelector('#title-menu');
            if ( menuButton ) {
                menuButton.addEventListener('click',function(e) {
                    menu.classList.toggle('open'); 
                    menuBackdrop.classList.toggle('open');
                });
            }
            var menuBackdrop = document.querySelector('#menu-backdrop');
            if ( menuBackdrop ) {
                menuBackdrop.addEventListener('click', function(e) {
                    menu.classList.remove('open'); 
                    menuBackdrop.classList.remove('open'); 
                });
            }    
            menu.addEventListener('click',function(e) {
                var item = e.target;
                var command = item.id.split('.');
                if (command.length >= 3) {
                    var phase = parseInt(command[2]);
                    gotocreatelevelphase(phase);
                } else if ( command.length >= 2 ) {
                    //
                    // save etc
                    //
                    switch( command[ 1 ] ) {
                        case 'add' :
                            break;
                        case 'save' :
                            savelevel();
                            break;
                        case 'play' :
                            closeeditor( '/play/' + level.game.levelid );
                            break;
                    }
                }
                menu.classList.remove('open'); 
                menuBackdrop.classList.remove('open'); 
            });
        }
    }
    function savelevel(successAction) {
        localplay.showtip();
        
        //
        // force the story editor to save it's state
        // TODO: this should be automated
        //
        if (createleveleditorcontainer.localplay.storyeditor) {
            createleveleditorcontainer.localplay.storyeditor.save();
        }
        //
        // get dialog position
        //
        var metadata = {
            name: level.game.metadata.name,
            place: level.game.metadata.place,
            change: level.game.metadata.change,
            published: level.game.metadata.published,
            instructions: level.instructions,
            winmessage: level.winmessage,
            losemessage: level.losemessage,
            music: level.music[localplay.domutils.getTypeForAudio()],
            winsound: level.winsound[localplay.domutils.getTypeForAudio()],
            losesound: level.winsound[localplay.domutils.getTypeForAudio()]
        };
        //
        // show save dialog
        //
        //dialogboxwithtemplate(template, data, callback, fullscreen)
        localplay.dialogbox.dialogboxwithtemplate(savedialog, metadata, function (e) {
            localplay.domutils.fixEvent(e);
            var selector = localplay.domutils.getButtonSelector(e);
            if (selector.length >= 3) {
                var command = selector[2];
                switch (command) {
                    case "save":
                        {
                            //
                            // game metadata
                            //
                            var copy = document.getElementById("savelevel.savecopy").checked;
                            var name = document.getElementById("savelevel.name").value;
                            var place = document.getElementById("savelevel.place").value;
                            var published = localplay.domutils.valueOfRadioGroup("savelevel.visibility") === "public";
                            var change = document.getElementById("savelevel.change").value;
                            //
                            // level data
                            //
                            var instructions = document.getElementById("savelevel.instructions").value;
                            var winmessage = document.getElementById("savelevel.winmessage").value;
                            var losemessage = document.getElementById("savelevel.losemessage").value;
                            //
                            // update game metadata
                            //
                            level.game.metadata.name = name;
                            level.game.metadata.place = place;
                            level.game.metadata.published = published;
                            level.game.metadata.change = change;
                            //
                            // update level data
                            //
                            level.instructions = instructions;
                            level.winmessage = winmessage;
                            level.losemessage = losemessage;
                            level.reserialise();
                            level.reset();
                            /*
                            level.game.setcanvas(canvas);
                            level.draw();
                            */
                            level.game.savelevel(function (success) {
                                if (success) {
                                    level.resetdirty();
                                }
                                rendercreatelevelphase();
                                if ( successAction ) {
                                    successAction();
                                }
                            },copy);
                        }
                        break;
                }
            }
            return true;
        }, true);
        //
        // initialise publish radio group
        //
        var publishpublic = document.getElementById("savelevel.public");
        var publishprivate = document.getElementById("savelevel.private");
        if (publishpublic) publishpublic.checked = metadata.published;
        if (publishprivate) publishprivate.checked = !metadata.published;

    }

    function closeeditor(targeturl) {
        var cancel = function () {
            if ( targeturl ) {
                window.location = targeturl;
            } else {
                window.location = '/';
            }
        }
        //
        // confirm cancel
        //
        if (level.isdirty()) {
            localplay.dialogbox.confirm("Platform", "Do you want to save changes?", function (confirm) {
                if (confirm) {
                    savelevel( function successAction() {
                        closeeditor(targeturl);
                    });
                } else {
                    cancel();
                }
            });
        } else {
            cancel();
        }
    }

    function previewlevel() {
        //
        // force the story editor to save it's state
        // TODO: this should be automated
        //
        if (createleveleditorcontainer.localplay.storyeditor) {
            createleveleditorcontainer.localplay.storyeditor.save();
        }
        //
        //
        //
        var json = new String( level.json );
        var previewgame = null;
        var previewcontroller = null;
        //createfullscreendialogboxwithtemplate = function (prompt, template, data, closebuttonaction)
        localplay.savetip();
        localplay.showtip();
        var dialog = localplay.dialogbox.createfullscreendialogboxwithtemplate( "Preview", preview, {}, function (d) {
            if (previewcontroller) {
                previewcontroller.detach();
            }
            previewgame.level.clear();
            delete previewgame;
            localplay.restoretip();
        });
        dialog.show();
        var previewcanvas = document.getElementById("preview.canvas");
        if (previewcanvas) {
            previewgame = localplay.game.creategame(previewcanvas);
            previewgame.level.setup(json);
            previewcontroller = localplay.game.controller.embedded.attachtogame(previewgame);
            previewgame.play();
            previewgame.level.play();
        }
    }
    //
    //
    //
    mobileleveleditor.createlevel = function (game) {
        //
        // create new level
        //
        var metadata = {
            name: "",
            place: "",
            change: "",
            tags: "",
            published: 0
        }
        //
        // 
        //
        var defaultJSON = '\
            {   "background" : { \
                    "images" : ["/media/5ab26a8594642dbae5183960"] \
                }, \
                "avatar" : { \
                    "image" : "/media/5ab26a8594642dbae5183961", \
                    "position" : "262,389", \
                    "scale" : "0.28870890567388735", \
                    "rotation" : "0", \
                    "gravityscale" : "1", \
                    "canjump" : "1" \
                } \
            }';
        game.newlevel(metadata, defaultJSON);
        //
        //
        //
        mobileleveleditor.editlevel(game);
    }
    //
    //
    //
    mobileleveleditor.editlevel = function (game) {
        //
        //
        //
        level = game.level;
        canvas = game.canvas;
        //canvas.style.visibility = "hidden";
        //
        //
        //
        level.reset();
        level.trackavatar = false;
        //
        //
        //
        maintemplate = editlevel;
        initialisecreatelevel();
        gotocreatelevelphase(0);
    }

    return mobileleveleditor;
})();