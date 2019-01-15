//
// touch module
// simple single touch handling
//
;
localplay.touch = (function () {
    if (localplay.touch) return localplay.touch;
    //
    //
    //
    var touch = {};
    //
    //
    //
    function TouchHandler( target, delegate ) {
        
        if ( localplay.touchsupport() ) {
            //
            // handle touches
            //
            var ongoingTouches = [];
            function copyTouch(touch) {
                return { identifier: touch.identifier, pageX: touch.pageX, pageY: touch.pageY };
            }
            function ongoingTouchIndexById(idToFind) {
              for (var i = 0; i < ongoingTouches.length; i++) {
                var id = ongoingTouches[i].identifier;

                if (id == idToFind) {
                  return i;
                }
              }
              return -1;    // not found
            }
            //
            //
            //
            if ( delegate.pointerdown ) {
                target.addEventListener("touchstart", function (e) {
                    e.preventDefault();
                    var touches = e.changedTouches;
                    for (var i = 0; i < touches.length; i++) {
                        ongoingTouches.push(copyTouch(touches[i]));
                    }
                    var offset = localplay.domutils.elementPosition(target);
                    var p = new Point( ongoingTouches[0].pageX - offset.x, ongoingTouches[0].pageY - offset.y );
                    return delegate.pointerdown(p);
                });
            }
            if ( delegate.pointermove ) {
                target.addEventListener("touchmove", function (e) {
                    e.preventDefault();
                    var touches = e.changedTouches;
                    for (var i = 0; i < touches.length; i++) {
                        var idx = ongoingTouchIndexById(touches[i].identifier);
                        if (idx >= 0) {
                          ongoingTouches.splice(idx, 1, copyTouch(touches[i]));  
                        }
                    }
                    var offset = localplay.domutils.elementPosition(target);
                    var p = new Point( ongoingTouches[0].pageX - offset.x, ongoingTouches[0].pageY - offset.y );
                    return delegate.pointermove(p);
                });
            }
            if ( delegate.pointerup ) {
                target.addEventListener("touchend", function (e) {
                    e.preventDefault();
                    var touches = e.changedTouches;
                    var ret = false;
                    for (var i = 0; i < touches.length; i++) {
                        var idx = ongoingTouchIndexById(touches[i].identifier);
                        if (idx >= 0) {
                            if ( idx === 0 ) {
                                var offset = localplay.domutils.elementPosition(target);
                                var p = new Point( ongoingTouches[0].pageX - offset.x, ongoingTouches[0].pageY - offset.y );
                                ret = delegate.pointerup(p);
                            }
                            ongoingTouches.splice(idx, 1);  
                        }
                    }
                    return ret;
                });
                target.addEventListener("touchcancel", function (e) {
                    e.preventDefault();
                    var touches = e.changedTouches;
                    var ret = false;
                    for (var i = 0; i < touches.length; i++) {
                        var idx = ongoingTouchIndexById(touches[i].identifier);
                        if (idx >= 0) {
                            if ( idx === 0 ) {
                                var offset = localplay.domutils.elementPosition(target);
                                var p = new Point( ongoingTouches[0].pageX - offset.x, ongoingTouches[0].pageY - offset.y );
                                ret = delegate.pointerup(p);
                            }
                            ongoingTouches.splice(idx, 1);  
                        }
                    }
                    return ret;
                });
            }
         } else {
             if ( delegate.pointerdown ) {
                target.addEventListener("mousedown", function (e) {
                    localplay.domutils.fixEvent(e);
                    var p = new Point(e.offsetX,e.offsetY);
                    return delegate.pointerdown(p);
                });
             }
             if ( delegate.pointerup ) {
                 target.addEventListener("mouseup", function (e) {
                     localplay.domutils.fixEvent(e);
                     var p = new Point(e.offsetX,e.offsetY);
                     return delegate.pointerup(p);
                 });
                 target.addEventListener("mouseleave", function (e) {
                     localplay.domutils.fixEvent(e);
                     var p = new Point(e.offsetX,e.offsetY);
                     return delegate.pointerup(p);
                 });
             }
             if ( delegate.pointermove ) {
                 target.addEventListener("mousemove", function (e) {
                     localplay.domutils.fixEvent(e);
                     var p = new Point(e.offsetX,e.offsetY);
                     return delegate.pointermove(p);
                 });             
             }
         }
    }
    //
    //
    //
    touch.attach = function( target, delegate ) {
        new TouchHandler( target, delegate );
    }
    //
    //
    //
    return touch;
})();