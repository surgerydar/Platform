/**
 *
 * @source: https://github.com/LocalPlay/PlayYourPlace/tree/master/htdocs/js/localplay.game.background.js
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
/*eslint-env browser*/
/*global localplay*/
localplay.game.background = (function () {
    if (localplay.game.background) return localplay.game.background;

    var background = {};
    //
    //
    //
    /*
    {
        image: '/media/nnnnn',
        audio: '/audio/sadasdasff'
    }
    */
    //
    //
    //
    function Background(level, backgrounds) {
        this.level = level;
        this.scale = 1.0;
        this.offset = 0.0;
        this.width = localplay.defaultsize.width;
        this.height = localplay.defaultsize.height;
        this.loaded = false;
        this.images = [];
        this.audioplaying = false;
        this.players = [];
        this.backgrounds = [];
        this.opacity = 1.0;
        for (var i = 0; i < backgrounds.length; i++) {
            if ( typeof backgrounds[ i ] === 'string' ) {
                var path = localplay.normaliseurl(backgrounds[i]);
                this.addbackground(path);
            } else {
                this.addbackground(backgrounds[ i ].image,backgrounds[ i ].audio);
            }
        }
    }

    Background.prototype.playaudio = function () {
        if ( !this.audioplaying ) {
            this.audioplaying = true;   
            this.updateaudio();
        }
    }
    
   Background.prototype.stopaudio = function () {
        if ( this.audioplaying ) {
            this.audioplaying = false;   
            this.players.forEach( function( player ) {
                player.pause(); 
            });
        }
    }
    
    Background.prototype.updateaudio = function () {
        if ( this.audioplaying ) {
           if (this.loaded) {
                var x = 0;
                var dstx = 0.0;
                var viewport = this.level.world.viewport.duplicate();
                for (var i = 0; i < this.images.length && dstx < viewport.width; i++) {
                    if ( this.backgrounds[ i ].audio.duration > 0 ) {
                        var imagewidth = this.images[i].naturalWidth * this.scale;
                        if (x + imagewidth > viewport.x && x < viewport.x + viewport.width) {
                            var dstwidth = viewport.width - dstx;
                            //
                            // calculate src x and width in image coordinates
                            //
                            var scale = this.level.world.canvas ? this.level.world.canvas.height / this.images[i].naturalHeight : this.scale;
                            var srcx = Math.round( x < viewport.x ? (viewport.x - x) / scale : 0.0 );
                            var srcwidth = Math.round( Math.min(this.images[i].naturalWidth - srcx, dstwidth / scale) );
                            dstwidth = Math.round( srcwidth * scale );
                            dstx += dstwidth;
                            //
                            // calculate relative volume
                            //
                            var volume = ( srcwidth / this.images[i].naturalWidth ) * this.backgrounds[ i ].audio.volume;
                            if ( volume > 0 ) {
                                this.players[ i ].volume = volume;
                                this.players[ i ].play(); 
                            } else {
                                this.players[ i ].pause();
                            }
                        } else {
                            this.players[ i ].pause();
                        }
                    }
                    x += imagewidth;
                }
            }
        }
    }

    Background.prototype.setscale = function (scale) {
        this.scale = scale;
        this.recalculatesize();
    }

    Background.prototype.onloaded = function () {
        this.level.onobjectloaded(this);
    }

    Background.prototype.recalculatesize = function () {
        var loaded = true;
        var width = 0.0;
        var height = 0.0;
        //console.log( 'Background.recalculatesize >>>');
        for (var i = 0; i < this.images.length; i++) {
            if (!this.images[i].complete) {
                loaded = false;
                break;
            }
            
            var scale = this.level.world.canvas ? this.level.world.canvas.height / this.images[i].naturalHeight : this.scale;
            width += this.images[i].naturalWidth * scale;
            height = Math.max( this.images[i].naturalHeight * scale, height );
            //console.log('image[%d].naturalHeight=%d : scale=%f', i, this.images[i].naturalHeight, scale);
        }
        //console.log( '<<< Background.recalculatesize');
        if (loaded) {
            this.width  = width;
            this.height = height;
            if (!this.loaded) {
                this.loaded = true;
                this.onloaded();
            }
        }
    }

    Background.prototype.onimageloaded = function () {
        if (this.images.length > 0) {
            this.recalculatesize();
        } else {
            this.width = this.level.world.canvas.width;
            this.height = this.level.world.canvas.height;
        }
    }

    Background.prototype.update = function (time) {
        //
        // update scrolling and other behaviours
        //
        if (this.offset < this.width - this.level.world.canvas.width) {
            this.offset++;
        }
        //
        //
        //
        this.updateaudio();
    }

    Background.prototype.draw = function () {
        var context = this.level.world.context;
        if (this.loaded) {
            var x = 0;
            var dstx = 0.0;
            var viewport = this.level.world.viewport.duplicate();
            context.save();
            if ( this.opacity < 1.0 ) {
                context.clearRect(0, 0, this.level.world.canvas.width, this.level.world.canvas.height);
            }
            context.globalAlpha = this.opacity;
            for (var i = 0; i < this.images.length && dstx < viewport.width; i++) {
                var imagewidth = this.images[i].naturalWidth * this.scale;
                var imageheight = this.images[i].naturalHeight * this.scale;
                if (x + imagewidth > viewport.x) {
                    var dstwidth = viewport.width - dstx;
                    //
                    // calculate src x and width in image coordinates
                    //
                    var scale = this.level.world.canvas ? this.level.world.canvas.height / this.images[i].naturalHeight : this.scale;
                    var srcx = Math.round( x < viewport.x ? (viewport.x - x) / scale : 0.0 );
                    var srcwidth = Math.round( Math.min(this.images[i].naturalWidth - srcx, dstwidth / scale) );
                    dstwidth = Math.round( srcwidth * scale );
                    context.drawImage(this.images[i], srcx, 0, srcwidth, this.images[i].naturalHeight, dstx, 0.0, dstwidth, this.level.world.canvas.height);
                    dstx += dstwidth;
                }

                //if (dstx >= viewport.width) break;
                x += imagewidth;
            }
            context.restore();
            //
            // compensate for images not as wide as the standard canvas
            //
            if (dstx < this.level.world.canvas.width) {
                context.clearRect(dstx, 0, this.level.world.canvas.width - dstx, this.level.world.canvas.height);
            }
        } else {
            context.clearRect(0, 0, this.level.world.canvas.width, this.level.world.canvas.height);
        }
    }
    
    Background.prototype.getdominantbackground = function() {
        var dominant = -1;
        var maxWidth = 0;
        if (this.loaded) {
            var x = 0;
            var dstx = 0.0;
            var viewport = this.level.world.viewport.duplicate();
            for (var i = 0; i < this.images.length && dstx < viewport.width; i++) {
                var imagewidth = this.images[i].naturalWidth * this.scale;
                if (x + imagewidth > viewport.x) {
                    var dstwidth = viewport.width - dstx;
                    //
                    // calculate src x and width in image coordinates
                    //
                    var scale = this.level.world.canvas ? this.level.world.canvas.height / this.images[i].naturalHeight : this.scale;
                    var srcx = Math.round( x < viewport.x ? (viewport.x - x) / scale : 0.0 );
                    var srcwidth = Math.round( Math.min(this.images[i].naturalWidth - srcx, dstwidth / scale) );
                    dstwidth = Math.round( srcwidth * scale );
                    if ( dstwidth > maxWidth ) {
                        dominant = i;   
                    }
                    dstx += dstwidth;
                }
                x += imagewidth;
            }
        }
        return dominant;
    }
    
    Background.prototype.getbounds = function () {
        if (this.loaded) {
            return new Rectangle(0, 0, this.width, this.height);
        }
        return new Rectangle(0, 0, localplay.defaultsize.width, localplay.defaultsize.height);
    }

    Background.prototype.getnaturalbounds = function () {
        var bounds = this.getbounds();
        bounds.scale(1.0 / this.scale);
        return bounds;
    }

    function createPlayer() {
        var player = new Audio();
        player.loop = true;
        player.addEventListener('canplaythrough',function() {
            player.loop = true;
        });
        player.addEventListener('ended',function() {
            player.load();
        });
        return player;
    }
        
    Background.prototype.addbackground = function (imageUrl, audio) {
        var _this = this;
        var image = new Image();
        this.images.push(image);
        audio = audio || {name:'',mp3:'',ogg:'',duration:0,volume:1}
        this.backgrounds.push({ image: imageUrl, audio: audio});
        image.onload = function () {
            _this.onimageloaded();
        };
        image.src = imageUrl;
        //
        //
        //
        var player = createPlayer();
        this.players.push(player);
        if ( audio.duration > 0 ) {
            player.src = audio[localplay.domutils.getTypeForAudio()];
            player.load();   
        }
    }

    Background.prototype.insertbackground = function (i, imageUrl, audio) {
        var _this = this;
        var image = new Image();
        this.images.splice(i, 0, image);
        this.backgrounds.splice(i,0,{ image: imageUrl, audio: audio || {name:'',mp3:'',ogg:'',duration:0,volume:1}});
        image.addEventListener('load',function() {
            _this.onimageloaded();
        },{passive:true, once:true})
        image.src = imageUrl;
        //
        //
        //
        var player = createPlayer();
        this.players.splice(i, 0, player);
        if ( audio && audio.duration > 0 ) {
            player.src = audio[localplay.domutils.getTypeForAudio()];
            player.load();   
        }
    }
    
    
    Background.prototype.setaudio = function (i,audio) {
        if (i >= 0 && i < this.backgrounds.length) {
            this.backgrounds[i].audio = audio;
        }
    }
    
    Background.prototype.getaudio = function (i) {
        if (i >= 0 && i < this.backgrounds.length) {
            return this.backgrounds[i].audio;
        }
        return undefined;
    }
    
    Background.prototype.removebackground = function (i) {
        if (i >= 0 && i < this.images.length) {
            this.images.splice(i, 1);
            this.backgrounds.splice(i, 1);
            this.onimageloaded();
        }
    }
    Background.prototype.countimages = function () {
        return this.images.length;
    }
    //
    //
    //
    background.createbackground = function (level, backgrounds) {
        return new Background(level, backgrounds);
    }

    return background;
})();