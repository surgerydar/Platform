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
/*eslint-env browser*/
/*global localplay, Mustache, Point*/
//
// mobileplayer module
//
localplay.game.controller.mobile = (function () {
    if (localplay.game.controller.mobile) return localplay.game.controller.mobile;
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
                <img id="mobileplayer.list" title="go to mobile" class="imagebutton" style="margin: 4px;" src="/images/list.png" /> \
                <img id="mobileplayer.new" title="create new level" class="imagebutton" style="margin: 4px;" src="/images/new.png" /> \
                <img id="mobileplayer.edit" title="edit" class="imagebutton" style="margin: 4px;" src="/images/edit.png" /> \
                <img id="mobileplayer.play" title="play" class="imagebutton" style="margin: 4px;" src="/images/play.png" />';
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
    var mobileplayer = {};
    //
    //
    //
    function MobileController(game) {
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
        //
        //
        this.logo = document.querySelector('#title-logo');
        if ( this.logo ) {
            this.logo.addEventListener('click', function() {
                window.location = '/';
            });
        }
        //
        // controls
        //
        this.progressindicatorcontainer = document.querySelector('#title-progress-container');
        this.progressindicator          = document.querySelector('#title-progress');
        this.playbar                    = document.querySelector('#play-bar');
        this.upbutton                   = document.querySelector('#play-bar-button-up');
        this.leftbutton                 = document.querySelector('#play-bar-button-left');
        this.rightbutton                = document.querySelector('#play-bar-button-right');
        this.playbutton                 = document.querySelector('#play-button');
        this.menubutton                 = document.querySelector('#title-menu');
        this.menu                       = document.querySelector('#main-menu');
        this.backdrop                   = document.querySelector('#menu-backdrop');
        //
        //
        //
        if ( this.playbutton ) {
            this.playbutton.addEventListener('click', function(e) {
                e.preventDefault();
                _this.game.level.play();
            });
        }
        if ( this.menubutton ) {
            this.menubutton.addEventListener('click', function(e) {
                e.preventDefault();
                _this.showmenu(true);
            });
        }
        if ( this.backdrop ) {
            this.backdrop.addEventListener('click', function(e) {
                e.preventDefault();
                _this.showmenu(false);
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
                        case 'play':
                            //_this.game.level.reset();
                            if ( _this.game.level.isplaying() ) {
                                _this.game.level.togglepause();
                            } else {
                                _this.game.level.play();
                            }
                            break;
                        case "edit":
                            window.location = '/edit/' + _this.game.levelid;
                            break;
                        case 'gallery':
                            //localplay.game.arcade.showarcadedialog();
                            window.location = '/arcade/latest?title=Latest';
                            break;
                        case 'about':
                            window.location = '/about';
                            break;
                        case 'help':
                            window.location = '/help';
                            break;
                        case 'terms':
                            window.location = '/terms';
                            break;
                        case 'login':
                            window.location = '/login';
                            break;
                        case 'logout':
                            window.location = '/logout';
                            break;
                    }
                }
            });
        }
        //
        // game controls
        //
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
            if ( this.upbutton ) {
                this.upbutton.addEventListener('mousedown', function(e) {
                    e.preventDefault();
                    _this.game.level.keys[32] = true;
                }, true );
                this.upbutton.addEventListener('mouseup', function(e) {
                    e.preventDefault();
                    _this.game.level.keys[32] = false;
                }, false );
            }
            if ( this.leftbutton ) {
                this.leftbutton.addEventListener('mousedown', function(e) {
                    e.preventDefault();
                    _this.game.level.keys[37] = true;
                }, true );
                this.leftbutton.addEventListener('mouseup', function(e) {
                    e.preventDefault();
                    _this.game.level.keys[37] = false;
                }, false );
            }
            if ( this.rightbutton ) {
                this.rightbutton.addEventListener('mousedown', function(e) {
                    e.preventDefault();
                    _this.game.level.keys[39] = true;
                }, true );
                this.rightbutton.addEventListener('mouseup', function(e) {
                    e.preventDefault();
                    _this.game.level.keys[39] = false;
                }, false );
            }
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
        this.banner = document.createElement("div");
        this.banner.classList.add("gamebanner");
        this.banner.style.visibility = "hidden";
        this.game.canvas.offsetParent.appendChild(this.banner);
        this.onstatechange();
        //
        // go fullscreen 
        // TODO: move this somewhere more suitable
        //
        this.game.level.reset();
    }
    //
    // required controller methods
    //
    MobileController.prototype.draw = function () {
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
                var p;
                if ( this.logo ) {
                    p = localplay.domutils.elementPosition(this.logo);
                    p.y += this.logo.offsetHeight + 20;
                } else {
                    p = new Point(8,8);
                }
                var height = 32;
                var pickups = this.game.level.avatar.pickups;
                for (var i = 0; i < pickups.length; i++) {
                    if (pickups[i].sprite) {
                        var image = pickups[i].sprite.image;
                        if (image && image.complete && image.naturalHeight > 0) {
                            
                            var width = image.naturalWidth * (height / image.naturalHeight);
                            context.drawImage(image, p.x, p.y, width, height);
                            p.x += width + 4;
                        }
                    }
                }
                //
                // time
                //
                if (this.timelimit > 0 && this.progressindicator) {
                    /*
                    var time = "TIME:" + this.game.level.timer.formattime(this.timelimit - this.game.level.timer.elapsed());//this.game.level.timer.elapsedstring();
                    context.font = '24px CabinSketch';
                    context.fillStyle = 'rgba( 0, 0, 0, 1.0 )';
                    context.fillText(time, 8, 64);
                    */
                    this.progressindicator.value = this.game.level.timer.elapsed() / this.timelimit;
                }
                context.restore();

                break;
            case localplay.game.level.states.done:
                break;
        }

    }

    MobileController.prototype.detach = function () {
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

    MobileController.prototype.resumegame = function () {
        if (this.game.level.state === localplay.game.level.states.playing) {
            this.game.level.pause(false);
        }
    }

    MobileController.prototype.showbanner = function (template, data) {
        if (!template || template.length === 0) {
            this.banner.style.visibility = "hidden";
        } else {
            var render = data ? Mustache.render(template, data) : template;
            this.banner.innerHTML = render;
            this.banner.style.visibility = "visible";
            //
            // hook all buttons
            //
            localplay.game.controller.hookbuttons(this.banner, "mobileplayer", this.boundclick);
            //
            //
            //

        }
    }

    MobileController.prototype.onstatechange = function () {
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
            console.log( 'MobileController.onstatechange : error : ' + error );
        }

    }

    MobileController.prototype.showcontrols = function (playing) {
        this.playbar.style.visibility                       = playing ? 'visible' : 'hidden';
        this.progressindicatorcontainer.style.visibility    = playing ? 'visible' : 'hidden';
        if ( this.playbutton ) {
            this.playbutton.style.visibility = playing ? 'hidden' : 'visible';
        }
    }
    
    MobileController.prototype.showmenu = function (show) {
        if( show ) {
            //var playmenuitem = document.getElementById('menu.play');
            this.backdrop.classList.add('open');
            this.menu.classList.add('open');
            this.menu.scrollTop = '0px';
            if ( this.game.level.isplaying() ) this.game.level.pause(true);
       } else {
            this.backdrop.classList.remove('open');
            this.menu.classList.remove('open');
            this.menu.scrollTop = '0px';
            if ( this.game.level.ispaused() ) this.game.level.pause(false);
        }
    }
    
    MobileController.prototype.hookbuttons = function (container, callback) {

        for (var i = 0; i < container.childNodes.length; i++) {
            if (container.childNodes[i].id && container.childNodes[i].id.indexOf("mobileplayer") === 0) {
                container.childNodes[i].addEventListener("click", callback);
            }
            if (container.childNodes[i].childNodes.length > 0) {
                this.hookbuttons(container.childNodes[i], callback);
            }
        }

    }

    MobileController.prototype.onclick = function (e) {
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

        return false;
    }

    MobileController.prototype.onkeydown = function (e) {
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

    MobileController.prototype.onkeyup = function (e) {
        this.game.level.onkeyup(e);
        return false;
    }

    MobileController.prototype.onresize = function () {
        //this.game.fittocontainer();
        console.log( 'MobileController.prototype.onresize : before : canvas.width=' + this.game.canvas.width + ' canvas.height=' + this.game.canvas.height );
        var aspect = this.game.canvas.offsetWidth / this.game.canvas.offsetHeight;
        this.game.canvas.width = Math.round(this.game.canvas.height * aspect);
        console.log( 'MobileController.prototype.onresize : after : canvas.width=' + this.game.canvas.width + ' canvas.height=' + this.game.canvas.height );
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

    mobileplayer.attachtogame = function(game) {
        //
        // TODO: detatch controller, probably need registry of who is attached to whom in localplay.gamecontroller
        //
        return new MobileController(game);
    }

    return mobileplayer;
})();
