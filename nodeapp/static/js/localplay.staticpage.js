/*eslint-env browser*/
/*global localplay*/
localplay.staticpage = (function () {
    if (localplay.staticpage) return localplay.staticpage;
    return { 
        init: function() {
            //
            //
            //
            var logo = document.querySelector('#title-logo');
            if ( logo ) {
                logo.addEventListener('click', function() {
                    window.location = '/';
                });
            }
            //
            // 
            //
            var menubutton  = document.querySelector('#title-menu');
            var menu        = document.querySelector('#main-menu');
            var backdrop    = document.querySelector('#menu-backdrop');
            //
            // menu handling
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
                    //console.log( 'menu item : ' + e.target.id );
                    var selector = e.target.id.split('.');
                    if ( selector.length === 2 ) {
                        showmenu(false);
                        switch( selector[1] ) {
                            case "create":
                                window.location = '/edit/create'
                                break;
                            case "gallery":
                                window.location = '/arcade/latest?title=Latest';
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
         }
    };
})();