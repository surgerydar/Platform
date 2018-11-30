//
// touch module
//
;
localplay.touch = (function () {
    if (localplay.touch) return localplay.touch;
    //
    //
    //
    var touch = {};
   /*
    function TouchHandler( target ) {
        this.target = target;
        if ( localplay.touchsupport() ) {
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
            target.addEventListener("touchstart", function(e) {
                e.preventDefault();
                var touches = e.changedTouches;
                for (var i = 0; i < touches.length; i++) {
                    ongoingTouches.push(copyTouch(touches[i]));
                }
                var p = new Point( ongoingTouches[0].pageX - _this.canvasoffset.x, ongoingTouches[0].pageY - _this.canvasoffset.y );
                _this.pointerdown(p);
            });
            this.container.addEventListener("touchmove", function(e) {
                e.preventDefault();
                var touches = e.changedTouches;
                for (var i = 0; i < touches.length; i++) {
                    var idx = ongoingTouchIndexById(touches[i].identifier);
                    if (idx >= 0) {
                      ongoingTouches.splice(idx, 1, copyTouch(touches[i]));  
                    }
                }
                var p = new Point( ongoingTouches[0].pageX - _this.canvasoffset.x, ongoingTouches[0].pageY - _this.canvasoffset.y );
                _this.pointermove(p);
            });
            this.container.addEventListener("touchend", function(e) {
                e.preventDefault();
                var touches = e.changedTouches;
                for (var i = 0; i < touches.length; i++) {
                    var idx = ongoingTouchIndexById(touches[i].identifier);
                    if (idx >= 0) {
                        if ( idx === 0 ) {
                            var p = new Point( ongoingTouches[0].pageX - _this.canvasoffset.x, ongoingTouches[0].pageY - _this.canvasoffset.y );
                            _this.pointerup(p);
                        }
                        ongoingTouches.splice(idx, 1);  
                    }
                }
            });
            this.container.addEventListener("touchend", function(e) {
                e.preventDefault();
                var touches = e.changedTouches;
                for (var i = 0; i < touches.length; i++) {
                    var idx = ongoingTouchIndexById(touches[i].identifier);
                    if (idx >= 0) {
                        if ( idx === 0 ) {
                            var p = new Point( ongoingTouches[0].pageX - _this.canvasoffset.x, ongoingTouches[0].pageY -  _this.canvasoffset.y );
                            _this.pointerup(p);
                        }
                        ongoingTouches.splice(idx, 1);  
                    }
                }
            });
         } else {
            this.boundmousedown = this.onmousedown.bind(this);
            this.boundmouseup = this.onmouseup.bind(this);
            this.boundmousemove = this.onmousemove.bind(this);
            this.boundkeydown = this.onkeydown.bind(this);
            this.boundkeyup = this.onkeyup.bind(this);
            this.container.addEventListener("mousedown", this.boundmousedown);
            this.container.addEventListener("mouseup", this.boundmouseup);
            this.container.addEventListener("mousemove", this.boundmousemove);
            window.addEventListener("keydown", this.boundkeydown);
            window.addEventListener("keyup", this.boundkeyup);
        }
    }
    */
    
    return touch;
})();