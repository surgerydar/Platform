/**
 *
 * @source: https://github.com/LocalPlay/PlayYourPlace/tree/master/htdocs/js/localplay.menu.js
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
localplay.mainmenu = (function () {
    if (localplay.mainmenu) return localplay.mainmenu;
    //
    //
    //
    var mainmenu = {};
    //
    //
    //
    mainmenu.attach = function( actions ) {
        var menubutton  = document.querySelector('#title-menu');
        var menu        = document.querySelector('#main-menu');
        var backdrop    = document.querySelector('#menu-backdrop');
        var logo        = document.querySelector( '#title-logo' );
        //
        //
        //
        if ( logo ) {
            logo.addEventListener('click', function(e) {
                window.location = '/';
            });
        }
        //
        // 
        //
        function showmenu( show ) {
            if( show ) {
                backdrop.classList.add('open');
                menu.classList.add('open');
                menu.scrollTop = '0px';
            } else {
                backdrop.classList.remove('open');
                menu.classList.remove('open');
                menu.scrollTop = '0px';
            }
        }
        if ( menubutton ) {
            menubutton.addEventListener('click', function(e) {
                e.preventDefault();
                showmenu(true);
            });
        }
        if ( backdrop ) {
            backdrop.addEventListener('click', function(e) {
                e.preventDefault();
                showmenu(false);
            });
        }
        //
        //
        //
        if ( menu ) {
            menu.addEventListener('click', function(e) {
                e.preventDefault();
                console.log( 'menu item : ' + e.target.id );
                var selector = e.target.id.split('.');
                if ( selector.length === 2 ) {
                    showmenu(false);
                    if ( action[ selector[1] ] ) action[ selector[1] ]();
                 }
            });
        } 
    }
    
    mainmenu.dettachmenu = function (target) {
        if (target.menupopup) {
            document.body.removeChild(target.menupopup);
            target.menupopup = null;
        }
    }

    return menu;

})();