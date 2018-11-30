;
localplay.homepage = (function () {
    if (localplay.homepage) return localplay.homepage;
    return { 
        init: function() {
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
                } else {
                    backdrop.classList.remove('open');
                    menu.classList.remove('open');
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
                                localplay.game.arcade.showarcadedialog();
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
            var originalHeaderFontsize = parseInt( contentHeader.style.fontSize );
            var originalBodyFontsize = parseInt( contentBody.style.fontSize );
            var headerWidth = Math.max( content.offsetWidth, content.scrollWidth );
            var contentHeight = Math.max( content.offsetHeight, content.scrollHeight );
            function fitContent() {
                //
                // resize content to fit
                //
                var newHeaderFontSize = Math.max( 18, Math.floor( originalHeaderFontsize * ( content.offsetWidth / headerWidth ) ) );
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
            window.addEventListener('resize', fitContent, false );
            fitContent();
        }
    };
})();