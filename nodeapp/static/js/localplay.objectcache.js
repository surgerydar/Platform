/*eslint-env browser*/
/*global localplay*/
localplay.objectcache = (function () {
    var objectcache = {};
    //
    //
    //
    var cache = [];
    //
    //
    //
    objectcache.get = function( url ) {
        //
        // find existing
        //
        var count = cache.length;
        for ( var i = 0; i < count; i++ ) {
            if ( cache[ i ].url === url ) {
                return cache[ i ].image;
            }
        }
        //
        // add new
        //
        var entry = {
            url: url,
            image: new Image(),
            loader: new Image()
        };
        entry.loader.onload = function() {
            //
            // apply crop
            //
            
            //
            // apply mask
            //
            
            //
            // apply colour adjustments
            //
            
            //
            //
            //
            var canvas = document.createElement("canvas");
            canvas.width = entry.loader.naturalWidth;
            canvas.height = entry.loader.naturalHeight;
            var context = canvas.getContext("2d");
            context.drawImage(entry.loader, 0, 0, canvas.width, canvas.height);
            //
            // signal to all sprites
            //
            entry.image.src = canvas.toDataURL("image/png");
            delete entry.loader;
        }
        cache.push( entry );
        entry.loader.src = url;
        return entry.image;
    }
    objectcache.getTriangles = function( url ) {
        //
        // find existing
        //
        var count = cache.length;
        for ( var i = 0; i < count; i++ ) {
            if ( cache[ i ].url === url ) {
                return cache[ i ].triangles;
            }
        }
        return [];
    }
    objectcache.getPoints = function( url ) {
        //
        // find existing
        //
        var count = cache.length;
        for ( var i = 0; i < count; i++ ) {
            if ( cache[ i ].url === url ) {
                return cache[ i ].points;
            }
        }
        return [];
    }
    //
    //
    //
    return objectcache;
})();