/**
 *
 * @source: https://github.com/LocalPlay/PlayYourPlace/tree/master/htdocs/js/localplay.game.controller.js
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
// editor module
//
localplay.game.controller = (function () {
    if (localplay.game.controller) return localplay.game.controller;

    var controllers = [];

    function findgame(game) {

        for (var i = 0; i < controllers.length; i++) {
            if (controllers[i].game === game) return i;
        }

        return -1;
    }

    function findcontroller(game) {

        for (var i = 0; i < controllers.length; i++) {
            if (controllers[i].game === game) return i;
        }

        return -1;
    }

    var controller = {};
    //
    // attach controller to game
    //
    controller.attachcontroller = function (g, c) {
        var i = findgame(g);
        if (i > -1) {
            this.detachcontroller(g);
        }
        controllers.push({ game: g, controller: c });
        g.controller = c;
    }
    //
    // detach controller from game
    //
    controller.detachcontroller = function (g) {
        var i = findgame(g);
        if (i > -1) {
            controllers[i].controller.detach();
            g.controller = null;
            controllers.splice(i, 1);
        }
    }
    //
    // common utility methods
    //
    controller.hookbuttons = function (container, selector, callback) {

        for (var i = 0; i < container.childNodes.length; i++) {
            if (container.childNodes[i].id && container.childNodes[i].id.indexOf(selector) === 0) {
                container.childNodes[i].addEventListener("click", callback);
            }
            if (container.childNodes[i].childNodes.length > 0) {
                this.hookbuttons(container.childNodes[i], selector, callback);
            }
        }

    }

    return controller;
})();
