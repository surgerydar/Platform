;
//
// about editor module
//
localplay = localplay || {};
localplay.game = localplay.game || {};
localplay.game.abouteditor = localplay.game.abouteditor || (function () {
    var abouteditor = {};
    //
    //
    //
    var abouteditortemplate = ' \
        <div class="dialog-column" > \
             <div class="form-item"> \
                <label for="name" class="form-item"> Name  </label> \
                <input class="form-item" id="name" name="name" type="text" placeholder="What is your game called?" value="{{name}}" /> \
            </div> \
            <div class="form-item"> \
                <label for="about" class="form-item"> Description  </label> \
                <input class="form-item" id="about" name="about" type="text" placeholder="describe your game" value="{{about}}" /> \
            </div> \
            <div style="padding: 1.25vw 0 1.25vw 0;"> \
                <label for="instructions" class="form-item"> Instructions  </label> \
                <div id="instructions" contenteditable="true" class="ruled-field"> \
                    {{instructions}} \
                </div> \
            </div> \
        </div> \
        <div class="dialog-column" > \
            <div class="form-item"> \
                <label for="winmessage" class="form-item"> Message for winner </label>\
                <input class="form-item" id="winmessage" name="winmessage" type="text" placeholder="Message for winners" value="{{winmessage}}" /> \
            </div>\
            <div style="padding: 1.25vw 0 1.25vw 0;"> \
                <label for="winsound" class="form-item"> Sound for winner </label> <br />\
                <audio class="form-item" id="winsound" src="{{winsoundsrc}}" data-audio="{{winsound}}" editable="true"></audio> \
            </div> \
            <div class="form-item"> \
                <label for="losemessage" class="form-item"> Message for looser  </label>\
                <input class="form-item" id="losemessage" name="losemessage" type="text" placeholder="Message for losers" value="{{losemessage}}" /> \
            </div>\
            <div style="padding: 1.25vw 0 1.25vw 0;"> \
                <label for="losesound" class="form-item"> Sound for looser </label> <br />\
                <audio class="form-item" id="losesound" src="{{loosesoundsrc}}" data-audio="{{losesound}}" editable="true"></audio> \
            </div> \
        </div> \
    ';
    //
    //
    //
    function AboutEditor(level) {
        var _this = this;
        this.level = level;
        //
        //
        //
        this.metadata = {
            name: level.game.metadata.name,
            about: level.game.metadata.about||level.game.metadata.change,
            published: level.game.metadata.published,
            instructions: level.game.metadata.instructions,
            winmessage: level.winmessage,
            losemessage: level.losemessage,
            winsoundsrc: level.winsound[localplay.domutils.getTypeForAudio()],
            winsound: JSON.stringify( level.winsound ),
            loosesoundsrc: level.losesound[localplay.domutils.getTypeForAudio()],
            losesound: JSON.stringify( level.losesound )
        };
        //
        // container
        //
        this.container = document.createElement("div");
        this.container.classList.add('dialog-container');
        this.container.style.top = '2px';
        //
        //
        //
        this.container.innerHTML = Mustache.render( abouteditortemplate, this.metadata )
     }
    //
    // required editor methods
    //
    AboutEditor.prototype.initialise = function () {
        var _this = this;
        
        var instructions = this.container.querySelector('#instructions');
        if ( instructions ) {
            instructions.addEventListener('click', function() {
                instructions.focus();
            }, {passive:true});
        }
        localplay.audioplayer.attachAll( this.container, function( selector, control ) {
            var title = '';
            var audio = null;
            var player = null;
            switch (selector) {
                 case 'winsound':
                    title   = 'sound for Winners';
                    audio   = _this.level.winsound;
                    player  = _this.container.querySelector('#winsound\\.audio');
                    break;
                case 'losesound':
                    title   = 'sound for Losers';
                    audio   = _this.level.losesound;
                    player  = _this.container.querySelector('#losesound\\.audio');
                    break;
            }
            if (audio && player) {
                if ( control === 'volume' ) {
                    audio.volume = player.volume;
                } else {
                    var dialog = localplay.game.soundeditor.createaudiodialog('Select ' + title, audio.type, audio);
                    dialog.addEventListener('save', function () {
                        audio.id        = dialog.selection.id;
                        audio.type      = dialog.selection.type;
                        audio.name      = dialog.selection.name;
                        audio.mp3       = dialog.selection.mp3;
                        audio.ogg       = dialog.selection.ogg;
                        audio.duration  = dialog.selection.duration;
                        audio.volume    = 1.0;
                        player.setAttribute( 'data-audio', JSON.stringify(audio) );
                        //player.src      = audio[localplay.domutils.getTypeForAudio()];
                    });
                    dialog.show();
                }
            }
        });
    }
    AboutEditor.prototype.dealloc = function () {
    }
    //
    // generic asset bar functionality
    //
    AboutEditor.prototype.save = function () {
        for ( var key in this.metadata ) {
            var input = this.container.querySelector( '#' + key );
            if ( input ) {
                switch( key ) {
                    case 'winmessage' :
                        this.level.winmessage = input.value;
                        break;
                   case 'winsound' :
                        this.level.winsound = JSON.parse( input.getAttribute('data-audio') );
                        break;
                    case 'losemessage' :
                        this.level.losemessage = input.value;
                        break;
                   case 'losesound' :
                        this.level.losesound = JSON.parse( input.getAttribute('data-audio') );
                        break;
                    case 'instructions' :
                        this.level.game.metadata.instructions = input.innerHTML;
                        break;
                    default:
                        this.level.game.metadata[ key ] = input.value;
                }
            }
        }
        this.level.reserialise();
    }
    //
    //
    //
    abouteditor.createabouteditor = function (level) {
        return new AboutEditor(level);
    }
    abouteditor.createabouteditordialog = function(level) {
        var editor = abouteditor.createabouteditor(level);
        var dialog = localplay.dialogbox.createfullscreendialogbox( 'Edit game info', editor.container, [], [], function() {
            editor.save();
        });
        dialog.show();
        editor.initialise();
        return editor;
    }
    //
    //
    //
    return abouteditor;
})();
