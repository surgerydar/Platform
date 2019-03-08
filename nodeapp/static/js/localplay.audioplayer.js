/*eslint-env browser*/
/*global localplay, Mustache*/
localplay.audioplayer = localplay.audioplayer || (function() {
    var audioplayer = {};
    
    var audioplayertemplate = ' \
        <div class="audio-player"> \
            <div class="audio-player-title"> \
                <div id="{{prefix}}.title" ></div> \
            </div> \
            <div class="audio-player-controls"> \
                <img id="{{prefix}}.play" src="/images/tools/play-white.png" class="menubaritem disabled" style="margin-right: 1vw;"/> \
                <div id="{{prefix}}.duration" class="audio-player-title"></div> \
                <img id="{{prefix}}.volume" src="/images/tools/audio-max-white.png" class="menubaritem" style="margin-left: 1vw;"/> \
                <img id="{{prefix}}.edit" src="/images/tools/pencil.png" class="menubaritem" style="margin-left: 1vw;"/> \
            </div> \
            <audio id="{{prefix}}.audio" /> \
        </div> \
    ';
    
    audioplayer.attach = function( audioElement, editCallback ) {
        var data = JSON.parse( audioElement.getAttribute('data-audio') );
        if ( data ) {
            var container = audioElement.parentElement;
            var selector = audioElement.id;
            var editable = audioElement.getAttribute('editable');
            //
            // render ui
            //
            audioElement.outerHTML = Mustache.render( audioplayertemplate, { prefix: selector } );
            //
            //
            //
            setTimeout( function() {
                var audio = container.querySelector( '#' + CSS.escape(selector + '.audio'));
                if ( audio ) {
                    var title = container.querySelector( '#' + CSS.escape(selector + '.title'));
                    if ( title ) {
                        title.innerHTML = data.name || "";
                    }
                    var play = container.querySelector( '#' + CSS.escape(selector + '.play'));
                    if ( play ) {
                        play.addEventListener('click', function() {
                            if ( audio.paused || audio.ended ) {
                                audio.addEventListener('canplay',function(){
                                    audio.play();
                                },{once:true});
                                audio.load();
                            } else {
                                audio.pause();
                            }
                        });
                        audio.addEventListener('canplay',function(e) {
                            play.classList.remove('disabled');    
                        },{ passive:true });
                        audio.addEventListener('play',function(e) {
                            play.src = '/images/tools/stop-white.png'
                        },{ passive:true });
                        audio.addEventListener('pause',function(e) {
                            play.src = '/images/tools/play-white.png';
                        },{ passive:true });
                    }
                    var duration = container.querySelector( '#' + CSS.escape(selector + '.duration'));
                    if ( duration ) {
                        audio.addEventListener('durationchange',function() {
                            if ( Number.isFinite(audio.duration) ) {
                                duration.innerHTML = parseFloat( Math.round( audio.duration * Math.pow(10, 2) ) / Math.pow(10,2) ).toFixed(2) + 's';   
                            } else if ( data.duration ) {
                                duration.innerHTML = parseFloat( Math.round( parseFloat(data.duration) * Math.pow(10, 2) ) / Math.pow(10,2) ).toFixed(2) + 's';   
                            } else {
                                duration.innerHTML = '??.??s';
                            }
                        },{ passive:true });
                    }
                    //
                    //
                    //
                    var volume = container.querySelector( '#' + CSS.escape(selector + '.volume'));
                    var setVolumeIndicator = function( value ) {
                        if ( volume ) {
                            if ( value < 0.25 ) {
                                volume.setAttribute('src','/images/tools/audio-off-white.png');    
                            } else if ( value < 0.5 ) {
                                volume.setAttribute('src','/images/tools/audio-min-white.png');   
                            } else if ( value < 0.75 ) {
                                volume.setAttribute('src','/images/tools/audio-mid-white.png');   
                            } else {
                                volume.setAttribute('src','/images/tools/audio-max-white.png');    
                            }
                        }
                    }
                    if ( volume ) {
                        volume.addEventListener('click',function() {
                            var value = audio.volume;
                            value += 0.25;
                            if ( value > 1.0 ) {
                                value = 0;
                            }
                            audio.volume = value;
                            editCallback(selector,'volume');
                            setVolumeIndicator(value);
                        },{passive:true}); 
                    }
                    var edit = container.querySelector( '#' + CSS.escape(selector + '.edit'));
                    if ( edit ) {
                        if ( !editable ) {
                            edit.style.visibility = 'hidden';
                        } else {
                            edit.addEventListener('click', function() {
                                editCallback(selector,'source');
                            });
                        }
                    }
                    //
                    //
                    //
                    var observer = new MutationObserver( function( mutations, observer) {
                        //
                        //
                        //
                        mutations.forEach( function( mutation ) {
                            if ( mutation.attributeName === 'data-audio' ) {
                                data = JSON.parse( audio.getAttribute('data-audio') );
                                if ( data ) {
                                    if ( title ) {
                                        title.innerHTML = data.name;      
                                    }
                                    if ( duration ) {
                                        if ( data.duration ) {
                                            duration.innerHTML = parseFloat( Math.round( parseFloat(data.duration) * Math.pow(10, 2) ) / Math.pow(10,2) ).toFixed(2) + 's';     
                                        } else {
                                            duration.innerHTML = '??.??s'
                                        }
                                    }
                                    audio.volume = data.volume !== undefined ? data.volume : 1.0;
                                    setVolumeIndicator(audio.volume);
                                    audio.src = data[ localplay.domutils.getTypeForAudio() ];
                                }                               
                            }    
                        });
                    });
                    observer.observe(audio, { attributes: true } );
                    //
                    // load audio
                    //
                    audio.setAttribute('data-audio', JSON.stringify(data));
                }
             },10);
        }
    };
    
    audioplayer.attachAll = function( container, editCallback ) {
        var audioElements = container.querySelectorAll('audio');
        audioElements.forEach( function( audioElement ) {
            audioplayer.attach( audioElement, editCallback );   
        });
    }
    return audioplayer;
})();