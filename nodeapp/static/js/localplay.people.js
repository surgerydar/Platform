;
localplay.arcade = (function () {
    if (localplay.arcade) return localplay.arcade;
    return { 
        init: function(user) {
            //
            //
            //
            var titleBar    = document.querySelector('#title-bar');
            //
            // home button
            //
            var logo = document.querySelector('#title-logo');
            if ( logo ) {
                logo.addEventListener('click', function(e) {
                    location = '/';
                });
            }
            //
            // menu navigation
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
                    console.log( 'menu item : ' + e.target.id );
                    var selector = e.target.id.split('.');
                    if ( selector.length === 3 && selector[ 1 ] === 'people' ) {
                        location = '/arcade/' + selector[ 2 ] + '?title=' + e.target.innerHTML;
                    } else if ( selector.length == 2 ) {
                        switch( selector[ 1 ] ) {
                            case 'create' :
                                location = '/edit/create';
                                break;
                            case 'about' :
                                location = '/about';
                                break;
                            case 'login' :
                                location = '/login';
                                break;
                            case 'logout' :
                                location = '/logout';
                                break;
                        }
                    }
                });
            } 
            //
            // arcade handling
            //
            var arcadecontainer = document.querySelector('#arcade-container');
            if ( arcadecontainer ) {
                if ( titleBar ) {
                    arcadecontainer.style.top = ( titleBar.offsetHeight + 16 ) + 'px';
                    window.addEventListener('resize', function(e) {
                        arcadecontainer.style.top = ( titleBar.offsetHeight + 16 ) + 'px';
                    });
                }
                var arcadeView = localplay.listview.createlistview('arcade-container', '/arcades/' + arcade + '?listview=true', 20);
                arcadeView.onselect = function (item) {
                    location = '/play/' + item.data._id;
                };
            }
        }
    };
})();