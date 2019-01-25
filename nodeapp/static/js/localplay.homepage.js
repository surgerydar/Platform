;
localplay.homepage = (function () {
    if (localplay.homepage) return localplay.homepage;
    return { 
        init: function() {
            //
            //
            //
            var logo = document.querySelector('#title-logo');
            if ( logo ) {
                logo.addEventListener('click', function(e) {
                    location = '/';
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
                    console.log( 'menu item : ' + e.target.id );
                    var selector = e.target.id.split('.');
                    if ( selector.length === 2 ) {
                        showmenu(false);
                        switch( selector[1] ) {
                            case "create":
                                window.location = '/edit/create'
                                break;
                            case "gallery":
                                //localplay.game.arcade.showarcadedialog();
                                location = '/arcade/latest?title=Latest';
                                break;
                            case 'people':
                                localplay.creator.showpeopledialog();
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
            // resize body text
            //
            /*
            var content = document.querySelector('#homepage-content');
            if ( content ) {
                var contentHeader = document.querySelector('#homepage-header');
                if ( contentHeader ) {
                    while( contentHeader.offsetWidth > content.offsetWidth ) {
                        contentHeader.style.fontSize = contentHeader.style.fontSize / 2.0;
                    }
                }
                var contentBody = document.querySelector('#homepage-body');
            }
            */
            var content = document.querySelector('#homepage-content');
            var contentHeader = document.querySelector('#homepage-header');
            var contentBody = document.querySelector('#homepage-body');
            function fitContent() {
                //
                //
                //
                var originalHeaderFontsize = parseInt( contentHeader.style.fontSize );
                var originalBodyFontsize = parseInt( contentBody.style.fontSize );
                var headerWidth = Math.max( content.offsetWidth, content.scrollWidth );
                var contentHeight = Math.max( content.offsetHeight, content.scrollHeight );
                if ( headerWidth >= content.offsetWidth ) {
                    //
                    // resize content to fit
                    //
                    var newHeaderFontSize = Math.max( 18, Math.floor( originalHeaderFontsize * ( ( content.offsetWidth - 20 ) / headerWidth ) ) );
                    var vScale = content.offsetHeight / ( contentHeight - ( originalHeaderFontsize - newHeaderFontSize ) );
                    var newBodyFontsize = Math.max( 12, Math.min( newHeaderFontSize - 8, Math.floor( originalBodyFontsize * vScale ) ) );
                    //
                    //
                    //
                    console.log( 'fitContent : header : ' + originalHeaderFontsize + ' ==> ' + newHeaderFontSize + ' : body : ' + originalBodyFontsize + ' ==> ' + newBodyFontsize );
                    //
                    //
                    //
                    contentHeader.style.fontSize = newHeaderFontSize + 'px';
                    contentBody.style.fontSize = newBodyFontsize + 'px';
                }
                resizeTimer = -1;
            }
            var resizeTimer = -1;
            window.addEventListener('resize', function() {
                if ( resizeTimer <= 0 ) {
                    contentHeader.style.fontSize = '64px';
                    contentBody.style.fontSize = '48px';
                    resizeTimer = setTimeout(fitContent,1);
                }
            }, { passive: true } );
            resizeTimer = setTimeout(fitContent,100);
        }
    };
})();