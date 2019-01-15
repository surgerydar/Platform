/**
 *
 * @source: https://github.com/LocalPlay/PlayYourPlace/tree/master/htdocs/js/localplay.game.controller.mobile.js
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
// mobileedit module
//
localplay.game.controller.mobileedit = (function () {
    if (localplay.game.controller.mobileedit) return localplay.game.controller.mobileedit;
    //
    // resources
    //
    var pause = new Image();
    pause.src = "/images/pause.png";
    var play = new Image();
    play.src = "/images/play.png";
    //
    // TODO: export these to templates
    //
    var loading = 'Loading 0%';
    var intro = '<h3>{{name}}</h3> \
                by&nbsp;<a href="creatorpage.php?id={{creatorid}}">{{creator}}</a><p/> \
                <img id="mobileedit.list" title="go to mobile" class="imagebutton" style="margin: 4px;" src="/images/list.png" /> \
                <img id="mobileedit.new" title="create new level" class="imagebutton" style="margin: 4px;" src="/images/new.png" /> \
                <img id="mobileedit.edit" title="edit" class="imagebutton" style="margin: 4px;" src="/images/edit.png" /> \
                <img id="mobileedit.play" title="play" class="imagebutton" style="margin: 4px;" src="/images/play.png" />';
     var outro = '<h3>{{outcome}}</h3> \
                {{{score}}}<p/>';
    var info = '<h3>{{name}}</h3> \
                <img src="{{thumbnail}}" /><p/> \
                place - {{place}}<p/> \
                change - {{change}}<p/> \
                tags - {{tags}}<p/> \
                by - <a href="creatorpage.php?id={{creatorid}}">{{creator}}</a><p/>';
    //
    //
    //
    var mobileedit = {};
    //
    //
    //
    function MobileEditController(game) {
        var _this = this;
        //
        //
        //
        localplay.game.controller.attachcontroller(game, this);
        //
        //
        //
        this.game = game;
        this.timelimit = -1;
        this.loadingprogress = -1;
        //
        // controls
        //
        /*
        this.menubutton                 = document.querySelector('#title-menu');
        this.menu                       = document.querySelector('#main-menu');
        this.backdrop                   = document.querySelector('#menu-backdrop');
        */
        //
        //
        //
        if ( this.menubutton ) {
            this.menubutton.addEventListener('click', function(e) {
                e.preventDefault();
                _this.showmenu(true);
            });
        }
        if ( this.backdrop ) {
            this.backdrop.addEventListener('click', function(e) {
                if ( _this.backdrop.style.opacity > .0 ) {
                    e.preventDefault();
                    _this.showmenu(false);
                }
            });
        }
        //
        //
        //
        if ( this.menu ) {
            this.menu.addEventListener('click', function(e) {
                e.preventDefault();
                console.log( 'menu item : ' + e.target.id );
                var selector = e.target.id.split('.');
                if ( selector.length === 2 ) {
                    _this.showmenu(false);
                    switch( selector[1] ) {
                        case 'close':
                            if ( _this.game.level.paused ) {
                                _this.game.level.pause(false);
                            }
                            break;
                        case 'play':
                            //_this.game.level.reset();
                            _this.game.level.play();
                            break;
                    }
                }
            });
        }
        //
        //
        //
        //this.hooktools();
        //
        // pointer tracking
        //
        this.trackingmouse = false;
        this.selectedsprite = null;
        this.previousmouseposition = null;
        if ( localplay.touchsupport() ) {
            if ( this.upbutton ) {
                this.upbutton.addEventListener('touchstart', function(e) {
                    e.preventDefault();
                    _this.game.level.keys[32] = true;
                }, true );
                this.upbutton.addEventListener('touchend', function(e) {
                    e.preventDefault();
                    _this.game.level.keys[32] = false;
                }, false );
            }
            this.directionbuttons = document.querySelector('#play-bar-direction-buttons');
            if ( this.directionbuttons ) {
                var touchtodirection = function(e) {
                    if ( e.touches.length > 0 ) {
                        console.log( 'directionbuttons : touch : ' + e.touches[0].clientX + ',' + e.touches[0].clientY );
                        var x = e.touches[0].clientX;
                        var cx = _this.directionbuttons.offsetLeft + _this.directionbuttons.offsetWidth / 2;
                        _this.game.level.multiplier = Math.abs( x - cx ) / ( _this.directionbuttons.offsetWidth / 2 );
                        if ( x < cx ) {
                            _this.game.level.keys[37] = true;
                            _this.game.level.keys[39] = false;
                        } else if ( x > cx ) {
                            _this.game.level.keys[37] = false;
                            _this.game.level.keys[39] = true;
                        } else {
                            _this.game.level.keys[37] = false;
                            _this.game.level.keys[39] = false;
                        }
                    }
                };
                this.directionbuttons.addEventListener('touchstart', function(e) {
                    e.preventDefault();
                    touchtodirection(e);
                },true); 
                this.directionbuttons.addEventListener('touchend', function(e) {
                    e.preventDefault();
                    _this.game.level.keys[37] = _this.game.level.keys[39] = false;
                },false); 
                this.directionbuttons.addEventListener('touchmove', function(e) {
                    e.preventDefault();
                    touchtodirection(e);
                },true); 
            } else {
                if ( this.leftbutton ) {
                    this.leftbutton.addEventListener('touchstart', function(e) {
                        e.preventDefault();
                        _this.game.level.keys[37] = true;
                    }, true );
                    this.leftbutton.addEventListener('touchend', function(e) {
                        e.preventDefault();
                        _this.game.level.keys[37] = false;
                    }, false );
                    this.leftbutton.addEventListener('touchcancel', function(e) {
                        e.preventDefault();
                        _this.game.level.keys[37] = false;
                    }, false );
                }
                if ( this.rightbutton ) {
                    this.rightbutton.addEventListener('touchstart', function(e) {
                        e.preventDefault();
                        _this.game.level.keys[39] = true;
                    }, true );
                    this.rightbutton.addEventListener('touchend', function(e) {
                        e.preventDefault();
                        _this.game.level.keys[39] = false;
                    }, false );
                    this.rightbutton.addEventListener('touchcancel', function(e) {
                        e.preventDefault();
                        _this.game.level.keys[39] = false;
                    }, false );
                }
            }
        } else {
            
            this.game.canvas.addEventListener('mousedown', function(e) {
                e.preventDefault();
                localplay.domutils.fixEvent(e);
                var p = new Point(e.offsetX, e.offsetY);
                _this.previousmouseposition = p.duplicate();
                var sprite = _this.game.spriteatpoint(p);
                if ( sprite ) {
                    console.log( 'MobileEditor : sprite : ' + sprite.imageUrl + ' : ' + sprite.aabb.tostring() );
                    _this.selectedsprite = sprite;

                } else { // 
                    _this.selectedsprite = null;
                    
                }
                //_this.game.draw();
            }, true);
            
            this.game.canvas.addEventListener('mouseup', function(e) {
                e.preventDefault();
                localplay.domutils.fixEvent(e);
                _this.selectedsprite = null;
                _this.trackingmouse = false;
                _this.previousmouseposition = false;
                //_this.game.draw();
           }, true);
            
            this.game.canvas.addEventListener('mousemove', function(e) {
                e.preventDefault();
                localplay.domutils.fixEvent(e);
                if ( _this.previousmouseposition ) {
                    var p = new Point(e.offsetX, e.offsetY);
                    var d = p.subtract(_this.previousmouseposition);
                    if ( _this.selectedsprite ) {

                    } else {
                        //
                        // scroll viewport
                        // 
                        console.log( 'MobileEditController : scrolling viewport by ' + (-d.x) );
                        _this.game.level.scrollviewportby(-d.x);
                    }
                    //
                    //
                    //
                    _this.previousmouseposition = p;
                    //_this.game.draw();
                }
            }, true);
         }
        //
        // hook events
        //
        //
        this.boundclick = this.onclick.bind(this);
        this.boundkeydown = this.onkeydown.bind(this);
        this.boundkeyup = this.onkeyup.bind(this);
        this.boundresize = this.onresize.bind(this);
        this.boundstatechange = this.onstatechange.bind(this);
        window.addEventListener("keydown", this.boundkeydown);
        window.addEventListener("keyup", this.boundkeyup);
        window.addEventListener("resize", this.boundresize);
        this.game.level.addEventListener("statechange", this.boundstatechange);
        //
        // create ui
        //
        /*
        this.banner = document.createElement("div");
        this.banner.classList.add("gamebanner");
        this.banner.style.visibility = "hidden";
        this.game.canvas.offsetParent.appendChild(this.banner);
        this.onstatechange();
        */
        //
        //
        //
        this.game.level.reset();
        this.game.level.trackavatar = false;
    }
    //
    //
    //
    MobileEditController.prototype.hooktools = function () {
        var _this = this;
        //
        //
        //
        this.target = document.querySelector('#editor-image');
        //
        // tool buttons
        //
        var tools = document.querySelectorAll('.editor-tool');
        tools.forEach( function(tool) {
            tool.onclick = function(evt) {
                var selector = tool.id.split('.');
                if ( selector.length > 1 && selector[0] === 'editor' ) {
                    _this.selecttool(selector[1]);
                }
            };   
        });
        //
        // tool options
        //
        var options = document.querySelector('#editor-tool-options');
        if ( options ) {
            var observer = new MutationObserver( function(mutations, observer) {
                mutations.forEach( function( mutation ) {
                    switch(mutation.type) {
                      case 'childList':
                        //
                        // initialise
                        // TODO: move somewhere more coherent
                        //
                        console.log( 'hooking sliders');
                        var adjustments = options.querySelectorAll('input[type=range]');
                        adjustments.forEach( function( adjustment ) {
                            console.log( 'hooking slider : ' + adjustment.id);
                            function observeValue() {
                                console.log( 'setting slider adjustment : ' + adjustment.id + '=' + adjustment.value);
                                adjustment.style.setProperty('--adjustment',adjustment.value);
                                //
                                //
                                //
                                _this.target.style.setProperty('--' + adjustment.id, adjustment.value );
                            }
                            adjustment.addEventListener('change', observeValue);
                            adjustment.addEventListener('mousemove', observeValue);
                            adjustment.addEventListener('touchmove', observeValue);
                        });
                        break;
                      case 'attributes':
                        var content = options.getAttribute('content');
                        if ( content && content.length > 0 ) {
                            localplay.datasource.get('/'+content,{},{
                                datasourceonloadend: function( e ) {
                                    var datasource = e.target.datasource;
                                    if (((datasource.status >= 200 && datasource.status < 300) || datasource.status == 304)) {
                                        options.innerHTML = datasource.responseText;
                                    } else {
                                        options.innerHTML = e.statusText;
                                    }
                                },
                                datasourceonerror: function( e ) {
                                    options.innerHTML = e.statusText;
                                }
                            });
                        } else {
                            options.innerHTML = "";
                        }
                        break;
                    }
                });
            });
            observer.observe( options, { attributes: true, childList: true, subtree: false });
        }
    }
    MobileEditController.prototype.selecttool = function (toolselector) { 
        var _this = this;
        //
        //
        //
        var tools = document.querySelectorAll('.editor-tool');
        tools.forEach( function(tool) {
            var selector = tool.id.split('.');
            if ( selector.length > 1 && selector[0] === 'editor' ) {
                if ( selector[ 1 ] === toolselector ) {
                    tool.classList.add('selected');
                } else {
                    tool.classList.remove('selected');
                }
            }
        });
        //
        //
        //
        var tooloptions = document.querySelector('#editor-tool-options');
        if ( tooloptions ) {
            tooloptions.setAttribute('content', 'template/tools-' + toolselector );
        }
    }
    //
    // required controller methods
    //
    MobileEditController.prototype.draw = function () {
        /*
        //
        //
        //
        var context = this.game.canvas.getContext("2d");
        switch (this.game.level.state) {
            case localplay.game.level.states.clear:
                break;
            case localplay.game.level.states.loading:
                //
                // draw progress
                //
                if (this.loadingprogress !== this.game.level.loadingprogress) {
                    this.banner.innerHTML = "Loading " + this.game.level.loadingprogress + "%";
                    this.loadingprogress = this.game.level.loadingprogress
                }
                break;
            case localplay.game.level.states.ready:
                break;
            case localplay.game.level.states.playing:
                //
                // draw game state
                //
                context.save();
                //
                // pickups
                //
                context.shadowColor = 'rgba(0,0,0,0.25)';
                context.shadowOffsetX = 5;
                context.shadowOffsetY = 5;
                context.shadowBlur = 4;
                var x = 8;
                var pickups = this.game.level.avatar.pickups;
                for (var i = 0; i < pickups.length; i++) {
                    if (pickups[i].sprite) {
                        var image = pickups[i].sprite.image;
                        if (image && image.complete && image.naturalHeight > 0) {
                            var height = 32;
                            var width = image.naturalWidth * (height / image.naturalHeight);
                            context.drawImage(image, x, 8, width, height);
                            x += width + 4;
                        }
                    }
                }
                //
                // time
                //
                if (this.timelimit > 0 && this.progressindicator) {
                    this.progressindicator.value = this.game.level.timer.elapsed() / this.timelimit;
                }
                context.restore();

                break;
            case localplay.game.level.states.done:
                break;
        }
        */
    }

    MobileEditController.prototype.detach = function () {
        //
        //
        //
        this.game.canvas.offsetParent.removeChild(this.banner);
        //
        // unhook events
        //
        window.removeEventListener("keydown", this.boundkeydown);
        window.removeEventListener("keyup", this.boundkeyupup);
        window.removeEventListener("resize", this.boundresize);
        this.game.level.removeEventListener("statechange", this.boundstatechange);
    }

    MobileEditController.prototype.resumegame = function () {
        /*
        if (this.game.level.state === localplay.game.level.states.playing) {
            this.game.level.pause(false);
        }
        */
    }

    MobileEditController.prototype.showbanner = function (template, data) {
        /*
        if (!template || template.length === 0) {
            this.banner.style.visibility = "hidden";
        } else {
            var render = data ? Mustache.render(template, data) : template;
            this.banner.innerHTML = render;
            this.banner.style.visibility = "visible";
            //
            // hook all buttons
            //
            localplay.game.controller.hookbuttons(this.banner, "mobileedit", this.boundclick);
            //
            //
            //

        }
        */
    }

    MobileEditController.prototype.onstatechange = function (e) {
        try {
            switch (this.game.level.state) {
                case localplay.game.level.states.clear:
                    this.showbanner();
                    break;
                case localplay.game.level.states.loading:
                    this.showbanner(loading);
                    break;
                case localplay.game.level.states.ready:
                    this.timelimit = this.game.level.gamestate.getTimelimit();
                    this.showbanner();
                    this.showcontrols(false);
                    break;
                case localplay.game.level.states.playing:
                    this.showbanner();
                    this.showcontrols(true);
                    break;
                case localplay.game.level.states.done:
                    this.showcontrols(false);
                    this.showbanner(outro, this.game.level.gamestate.getDescription(this.game.level));
                    break;
            }
        } catch( error ) {
            console.log( 'MobileEditController.onstatechange : error : ' + error );
        }

    }

    MobileEditController.prototype.showcontrols = function (playing) {
        /*
        this.playbar.style.visibility                       = playing ? 'visible' : 'hidden';
        this.progressindicatorcontainer.style.visibility    = playing ? 'visible' : 'hidden';
        if ( this.playbutton ) {
            this.playbutton.style.visibility = playing ? 'hidden' : 'visible';
        }
        */
    }
    
    MobileEditController.prototype.showmenu = function (show) {
        //console.log( 'MobileEditController.showmenu(' + show + ')');
        if( show ) {
            this.game.level.pause(true);
            this.backdrop.style.opacity = 1.;
            this.menu.classList.add('open');
            this.menu.scrollTop = '0px';
        } else {
            this.backdrop.style.opacity = 0.;
            this.menu.classList.remove('open');
            this.menu.scrollTop = '0px';
        }
    }
    
    MobileEditController.prototype.hookbuttons = function (container, callback) {

        for (var i = 0; i < container.childNodes.length; i++) {
            if (container.childNodes[i].id && container.childNodes[i].id.indexOf("mobileedit") === 0) {
                container.childNodes[i].addEventListener("click", callback);
            }
            if (container.childNodes[i].childNodes.length > 0) {
                this.hookbuttons(container.childNodes[i], callback);
            }
        }

    }

    MobileEditController.prototype.onclick = function (e) {
        var _this = this;
        
        /*
        var selector = e.target.id.split(".");
        if (selector.length === 2) {
            switch (selector[1]) {
                case "replay":
                    this.game.level.reset();
                    this.game.level.play();
                    break;
                case "play":
                    this.game.level.play();
                    break;
                case "next":
                    var nextlevel = this.game.level.getnextlevel();
                    if (nextlevel.length >= 3) {
                        this.game.loadlevel(nextlevel[0]);
                    } else {
                        this.game.nextlevel();
                    }
                    this.loadingprogress = -1;
                    break;
            }
        }
        */
        return false;
    }

    MobileEditController.prototype.onkeydown = function (e) {
        if (this.game.level.state == localplay.game.level.states.done ) {
            switch (e.keyCode) {
                case 82: // R
                    this.game.level.reset();
                    this.game.level.play();
                    break;
                case 80: // P
                     this.game.previouslevel();
                    break;
                case 78: // N
                    this.game.nextlevel();
                    break;
                default:
                    this.game.level.onkeydown(e);
                    break;
            }
        } else {
            this.game.level.onkeydown(e);
        }
        return false;
    }

    MobileEditController.prototype.onkeyup = function (e) {
        this.game.level.onkeyup(e);
        return false;
    }

    MobileEditController.prototype.onresize = function (e) {
        //this.game.fittocontainer();
        console.log( 'MobileEditController.prototype.onresize : before : canvas.width=' + this.game.canvas.width + ' canvas.height=' + this.game.canvas.height );
        var aspect = this.game.canvas.offsetWidth / this.game.canvas.offsetHeight;
        this.game.canvas.width = Math.round(this.game.canvas.height * aspect);
        console.log( 'MobileEditController.prototype.onresize : after : canvas.width=' + this.game.canvas.width + ' canvas.height=' + this.game.canvas.height );
        //
        //
        //
        var scale = this.game.canvas.height / localplay.defaultsize.height;
        if (this.game.level.background) {
            this.game.level.background.setscale(scale);
            this.game.level.adjustviewport();
        }
        //
        //
        //
        if ( this.game.paused ) {
            this.game.level.draw();
            this.draw();
        }
        return false;
    }

    mobileedit.attachtogame = function(game) {
        //
        // TODO: detatch controller, probably need registry of who is attached to whom in localplay.gamecontroller
        //
        return new MobileEditController(game);
    }

    return mobileedit;
})();
