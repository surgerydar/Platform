/**
 *
 * @source: https://github.com/LocalPlay/PlayYourPlace/tree/master/htdocs/js/brightnesscontrastworker.js
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
/* eslint-env worker, es6 */
//
// web worker interface
//
self.addEventListener('message', function (e) {
    let brightness = e.data.brightness;
    let contrast = e.data.contrast;
    let saturation = e.data.saturation;
    let imageData = e.data.imagedata;
    let data = imageData.data;
    //
    //
    //
    let interpolate = function( a, b, factor ) {
        return a + ( ( b - a ) * factor );
    }
    //
    //
    //
    let fBrightness = Math.abs(brightness / 255.0);
    let fContrast = Math.abs(contrast / 255.0);
    let fSaturation = Math.abs(saturation / 255.0);
    for (var i = 0; i < data.length; i += 4) {
        for (var j = 0; j < 3; j++) {
            //
            //
            //
            var value = data[i + j];
            //
            // brightness
            //
            if (brightness > 0) {
                value = interpolate( value, 255, fBrightness );
            } else if ( brightness < 0 ) {
                value = interpolate( value, 0, fBrightness );
            }
            //
            // contrast
            //
            if (contrast > 0) {
                if (value < 128) {
                    value = interpolate(value,0,fContrast);
                } else {
                    value = interpolate(value,255,fContrast);
                }
            } else if ( contrast < 0 ) {
                value = interpolate( value, 128, fContrast);
            }
            //
            // clamp value
            //
            data[i + j] = Math.max( 0, Math.min( 255, Math.round( value ) ) );
        }
        //
        // saturation
        //
        let cMax = Math.max( data[i], Math.max(data[i+1], data[i+2]));
        let sMax = [ data[i] / cMax, data[i+1] / cMax, data[i+2] / cMax ];
        let sMin = Math.min(255, Math.round(0.2126 * data[i] + 0.7152 * data[i+1] + 0.0722 * data[i+2]));
        for ( j = 0; j < 3; j++ ) {
            value = data[i + j];
            if ( saturation > 0 ) {
                // iterpolate towards max saturation
                value = interpolate( value, 255 * sMax[j], fSaturation );
            } else if ( saturation < 0 ) {
                // interpolate towards grayscale
                value = interpolate( value, sMin, fSaturation );
            }
            data[i + j] = Math.max( 0, Math.min( 255, Math.round( value ) ) );
        }
    }
    //
    //
    //
    postMessage(e.data);
});
