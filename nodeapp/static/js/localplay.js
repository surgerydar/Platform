/**
 *
 * @source: https://github.com/LocalPlay/PlayYourPlace/tree/master/htdocs/js/localplay.js
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

//
// install localplay
//
var localplay = (function () {
    if (window.localplay) return window.localplay;
    var localplay = {};
    //
    // TODO: 
    //
    localplay.keycode = {
        ALT: 18,
        ESC: 27
    }
    localplay.defaultsize = {
        width: 1024,
        height: 723
    };
    localplay.colours = {
        orange:     'rgb(228,79,57)',
        lightgrey:  'rgb(214,214,214)',
        darkgrey:   'rgb(68,67,66)',
        darkblue:   'rgb(0,69,124)',
        lightblue:  'rgb(30,174,229)'
    };
    //
    // shims and polyfils
    //
    if (!("classList" in document.documentElement) && Object.defineProperty && typeof HTMLElement !== 'undefined') {
        Object.defineProperty(HTMLElement.prototype, 'classList', {
            get: function () {
                var self = this;
                function update(fn) {
                    return function (value) {
                        var classes = self.className.split(/\s+/),
                            index = classes.indexOf(value);

                        fn(classes, index, value);
                        self.className = classes.join(" ");
                    }
                }

                var ret = {
                    add: update(function (classes, index, value) {
                        ~index || classes.push(value);
                    }),

                    remove: update(function (classes, index) {
                        ~index && classes.splice(index, 1);
                    }),

                    toggle: update(function (classes, index, value) {
                        ~index ? classes.splice(index, 1) : classes.push(value);
                    }),

                    contains: function (value) {
                        return !!~self.className.split(/\s+/).indexOf(value);
                    },

                    item: function (i) {
                        return self.className.split(/\s+/)[i] || null;
                    }
                };

                Object.defineProperty(ret, 'length', {
                    get: function () {
                        return self.className.split(/\s+/).length;
                    }
                });

                return ret;
            }
        });
    }
    //
    // canvas animation timer
    //
    window.requestAnimFrame = (function (callback) {
        return window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
        function (callback) {
            window.setTimeout(callback, 1000 / 60);
        };
    })();
    if (!window.cancelAnimationFrame) {
        window.cancelAnimationFrame = function (id) {
            clearTimeout(id);
        };
    }
    //
    // fullscreen utilities
    //
    localplay.gofullscreen = function (element) {
        element = element ? element : document.documentElement;
        if (element.requestFullscreen) {
            element.requestFullscreen();
        } else if (element.mozRequestFullScreen) {
            element.mozRequestFullScreen();
        } else if (element.webkitRequestFullscreen) {
            element.webkitRequestFullscreen();
        }

    }
    localplay.cancelfullscreen = function () {
        if (document.cancelFullScreen) {
            document.cancelFullScreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitCancelFullScreen) {
            document.webkitCancelFullScreen();
        }
    }
    //
    //
    //
    localplay.touchsupport = function() {
        return ('ontouchstart' in document.documentElement);
    }
    //
    //
    //
    localplay.normaliseurl = function( url ) {
        if ( url.startsWith('/') || url.startsWith('data:') || url.startsWith('http:') || url.startsWith('https:') ) {
            return url;
        }
        return '/' + url;
    }
    localplay.mediaurl = function( url ) {
        var media = url.substring( url.lastIndexOf('/media') );
        var queryOffset = media.lastIndexOf('?');
        if ( queryOffset > 0 ) {
            media = media.substring(0,queryOffset);
        }
        return media;
    }
    localplay.navigateto = function( url ) {
        window.location = url;
        return true;
    }
    //
    //
    //
    var flagdialog = '\
        <div style="width: 300px; height: 256px;"> \
            <div class="menubar">\
                <div class="menubaritem" style="float: left;">\
                    Flag {{name}}</h3> \
                </div> \
                 <div id="button.cancel" class="menubaritem" style="float: right;" > \
                    <img class="menubaritem" src="/images/icons/close-cancel-01.png" /> \
                    &nbsp;Cancel \
                </div> \
           </div> \
            <div style="position: absolute; top: 52px; left: 16px; right: 16px; text-align: center;"> \
                <textarea id="flag.comment" style="width: 240px; height: 200px;" placeholder="Why do you want to flag this?" ></textarea>\
            </div> \
            <div style="position: absolute; left: 0px; bottom: 0px; right: 0px; height: 42px;">\
                <div id="button.flag" class="menubaritem" style="float: right;" > \
                    <img class="menubaritem" src="/images/icons/flag-02.png" /> \
                    &nbsp;Flag \
                </div> \
            </div> \
        </div> \
    ';

    localplay.flagitem = function (title,itemname,tablename,targetid,callback) {
        var data = {
            name: itemname
        };
        localplay.dialogbox.dialogboxwithtemplate(flagdialog, data, function (e) {
            var selector = localplay.domutils.getButtonSelector(e);
            if (selector.length == 2) {
                var command = selector[1];
                switch (command) {
                    case "flag":
                        {
                            var command = "putflag.php";
                            var data = {
                                tablename: tablename,
                                targetid: targetid,
                                comment: document.getElementById("flag.comment").value
                            };
                            localplay.datasource.put(command, data, {},
                                {
                                    datasourceonloadend: function (e) {
                                        var xhr = e.target;
                                        try {
                                            var response = JSON.parse(xhr.datasource.response);
                                            localplay.dialogbox.alert(title, response.message);
                                        } catch (error) {
                                            localplay.dialogbox.alert(title, "Unknown error!");
                                        }
                                        if (callback) {
                                            callback();
                                        }
                                    }
                                });

                        }
                        break;
                    default:
                        if (callback) {
                            callback();
                        }
                }
            }
            return true;
        });
    }
    localplay.clearitemflag = function (title, tablename, targetid, callback) {
        var command = "putflag.php";
        var data = {
            tablename: tablename,
            targetid: targetid,
            flag: 0
        };
        localplay.datasource.put(command, data, {},
            {
                datasourceonloadend: function (e) {
                    var xhr = e.target;
                    try {
                        var response = JSON.parse(xhr.datasource.response);
                        localplay.dialogbox.alert(title, response.message);
                    } catch (error) {
                        localplay.dialogbox.alert(title, "Unknown error!");
                    }
                    if (callback) {
                        callback();
                    }
                }
            });

    }
    //
    // generic popup tip
    //
    var tipbox = null;
    var tipstack = [];
    localplay.showtip = function (tip,target) {
        if (tip && tip.length > 0) {
            if (!tipbox) {
                tipbox = document.createElement("div");
                tipbox.className = "tipbox";
                document.body.appendChild(tipbox);
                tipbox.onclick = function () {
                    localplay.showtip();
                }
            }
            
            var titleBar = document.querySelector('#title-bar');
            var p = new Point(document.body.offsetWidth, titleBar ? titleBar.offsetHeight + 16: 0);
            if (target) {
                p = localplay.domutils.elementPosition(target);
                p.y = Math.max( titleBar.offsetHeight + 16, p.y );
                p.x += target.offsetWidth;
            }
            
            /*
            var p = new Point(document.body.scrollWidth, document.body.scrollHeight);
            if (target) {
                p = localplay.domutils.elementPosition(target);
                p.x += target.offsetWidth;
                p.y += target.offsetHeight;
            }
            */
            tipbox.innerHTML =  tip + '<img class="imagebutton" src="/images/icons/close-cancel-02.png" style="position: absolute; top: 2px; right: 2px;" /><br />';
            tipbox.style.top = p.y + "px";
            tipbox.style.right = ( 8 + ( document.body.offsetWidth - p.x )) + "px";
            //tipbox.style.bottom = Math.max( 0, ( document.body.scrollWidth - p.y ) ) + "px";
            tipbox.classList.remove("hidden");
        } else if (tipbox) {
            tipbox.classList.add("hidden");
            tipbox.innerHTML = "";
        }
    }
    localplay.savetip = function () {
        if (localplay.hastip()) {
            var tipboxstate = {
                position : new Point( tipbox.offsetLeft + tipbox.offsetWidth, tipbox.offsetTop ),
                content : new String(tipbox.innerHTML)
            }
            tipstack.push(tipboxstate);
        }
    }
    localplay.restoretip = function () {
        if (tipstack.length > 0) {
            var tipboxstate = tipstack.pop();
            tipbox.innerHTML = tipboxstate.content;
            tipbox.style.right = ( document.body.offsetWidth - tipboxstate.position.x ) + "px";
            tipbox.style.top = tipboxstate.position.y + "px";
            tipbox.classList.remove("hidden");
        }
    }
    localplay.hastip = function () {
        return tipbox && tipbox.innerHTML != "";
    }
    //
    //
    //
    localplay.bitbuffer = function(length,data) {
        class BitArray {
            constructor(length,data) {
                if ( data ) {
                    this.backingArray = Uint8Array.from(data);
                } else { 
                    this.backingArray = Uint8Array.from({length: Math.ceil(length/8)}, ()=>0)
                }
                this.length = length
            }
            get(n) {
                return (this.backingArray[n/8|0] & 1 << n % 8) > 0
            }
            on(n) {
                this.backingArray[n/8|0] |= 1 << n % 8
            }
            off(n) {
                this.backingArray[n/8|0] &= ~(1 << n % 8)
            }
            toggle(n) {
                this.backingArray[n/8|0] ^= 1 << n % 8
            }
        }
        return new BitArray( length, data );
    }
    //
    //
    //
    return localplay;
})();
//
//
//
