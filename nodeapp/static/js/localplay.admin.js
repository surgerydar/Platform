/*eslint-env browser*/
/*global localplay*/
localplay.admin = (function () {
    if (localplay.homepage) return localplay.homepage;
    return { 
        init: function() {
            var titleBar = document.querySelector('#title-bar');
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
                            default:
                                window.location = '/' + selector[1];
                                break;
                        }
                    }
                });
            }
            //
            // find container
            //
            var container = document.querySelector('#admin-container');
            //
            //
            //
            window.addEventListener('resize', function() {
                container.style.top = ( titleBar.offsetHeight + 16 ) + 'px';  
            });
            //
            //
            //
            function performAction( action, url, payload ) {
                localplay.datasource[ action ]( url, {}, {
                    datasourceonloadend: function (e) {
                        container.innerHTML = e.target.datasource.responseText;
                    },

                    datasourceonerror: function (datasource) {

                    }
                },payload);
            }
            //
            // 
            //
            var observer = new MutationObserver( function( mutations, observer) {
                //
                //
                //
                function hookAction( element ) {
                    var action          = element.getAttribute('data-action');
                    var url             = element.getAttribute('data-url');
                    var confirmAction   = element.getAttribute('data-confirm');
                    if ( action && url ) {
                        element.addEventListener('click', function(e) {
                            e.preventDefault();
                            //
                            // check for payload
                            //
                            var payload = element.getAttribute('data-payload');
                            try {
                                if ( payload ) payload = JSON.parse(payload);
                            } catch( error ) {
                                console.error( 'malformed payload : ' + payload + ' : error : ' + error);
                                payload = null;
                            }
                            //
                            //
                            //
                            if ( confirmAction ) {
                                if ( confirm('do you want to ' + action + ' this item?') ) {
                                    performAction(action,url,payload);    
                                }
                            } else {
                                performAction(action,url,payload);
                            }
                            
                            return false;
                        });
                    }
                }
                //
                // hook header items
                //
                var header = document.querySelector('#admin-listview-header');
                if ( header ) {
                    var headerbuttons = header.querySelectorAll('[id^="button"]'); 
                    headerbuttons.forEach(function(button) {
                        hookAction(button);    
                    });
                    var search = header.querySelector('[id^="search"]');
                    if ( search ) {
                        var searchUrl = search.getAttribute('data-url');
                        if ( searchUrl ) {
                            search.addEventListener('keyup',function(e) {
                                e.preventDefault();
                                if (e.keyCode == 13) {
                                    var filterUrl = searchUrl;
                                    if ( search.value.length > 0 ) {
                                        filterUrl += '?filter=' + search.value;    
                                    }
                                    performAction('get',filterUrl ); 
                                }
                                return false;
                            });
                        }
                    }
                }
                //
                // hook listitems
                //
                var items = container.querySelectorAll('.admin-list-item, .admin-imagelist-buttons');
                items.forEach( function( item ) {
                    //
                    //
                    //
                    hookAction(item);
                    //
                    //
                    //
                    var itembuttons = item.querySelectorAll('[id^="button"]'); 
                    itembuttons.forEach( function(button) {
                        hookAction(button);
                    });
                    //
                    //
                    //
                    var itemradiobuttons = item.querySelectorAll('input[type=radio]');
                    itemradiobuttons.forEach( function(button) {
                        hookAction(button);
                    });
                    
                });
                //
                // hook list item images
                //
                var itemImages = container.querySelectorAll('.listitemimage');
                itemImages.forEach(function(itemImage) {
                    var selectUrl = itemImage.getAttribute('data-select');
                    if ( selectUrl ) {
                        var selectName = itemImage.getAttribute('data-name');
                        itemImage.addEventListener('click',function() {
                            window.open( selectUrl, selectName );
                        });
                    }
                });
                //
                // hook forms
                //
                var forms = container.querySelectorAll('form');
                forms.forEach( function( form ) {
                    form.addEventListener('submit',function(e) {
                        e.preventDefault();
                        //
                        //
                        //
                        var action = form.getAttribute('method');
                        var url = form.getAttribute('action');
                        if ( action && url ) {
                            //
                            // extract JSON from form data
                            //
                            var formData = new FormData(form);
                            var data = {};
                            formData.forEach(function(value,key) {
                                data[key] = value;    
                            });
                            //
                            //
                            //
                            performAction(action,url,data);
                        }
                        //
                        //
                        //
                        return false;
                    });    
                    //
                    // hook form buttons
                    //
                    var formbuttons = form.querySelectorAll('[id^="button"]'); 
                    formbuttons.forEach( function(button) {
                        hookAction(button);
                    });
                });
                //
                // execute any scripts
                // TODO: security risk, should validate all scripts
                //
                var scripts = container.querySelectorAll('script');
                scripts.forEach( function(script) {
                    eval(script.text);    
                });
            });
            observer.observe(container, { childList: true } );
            //
            //
            //
            performAction('get','/admin/groups');
        }
    };
})();