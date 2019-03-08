/**
 *
 * @source: https://github.com/LocalPlay/PlayYourPlace/tree/master/htdocs/js/brightnesscontrastworker.js
 *
 * @licstart  The following is the entire license notice for the 
 *  JavaScript code in this page.
 *
 *  Copyright (C) 2018 Platform
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
    let colour  = e.data.colour;
    let mask    = e.data.mask;
    let width   = colour.width;
    let height  = colour.height;
    let threshold = e.data.threshold;
    //
    // 
    //
    let bpp = 4;
    let rowbytes = bpp * colour.width;
    let pixels = colour.data;
    let alpha = mask.data;
    let seed = [0,0,0];
    let hsvseed = [0,0,0];
    let index = 0;
    //
    //
    //
    let rgbtohsv = function( rgb ) {
        let min = Math.min( rgb[ 0 ], Math.min( rgb[ 1 ], rgb[ 2 ] ) );
        let max = Math.max( rgb[ 0 ], Math.max( rgb[ 1 ], rgb[ 2 ] ) );
        let d = max - min;
        //
        //
        //
        let hsv = [ 0, 0, max ];
        if ( d === 0 || max <= 0 ) {
            hsv[ 0 ] = hsv[ 1 ] = 0;
        } else {
            hsv[ 1 ] = ( d / max );
            // hue segment
            if( rgb[ 0 ] === max ) {
                // between yellow & magenta
                hsv[ 0 ] = ( rgb[ 1 ] - rgb[ 2 ] ) / d;
            } else if( rgb[ 1 ] === max ) {
                // between cyan & yellow
                hsv[ 0 ] = 2.0 + ( rgb[ 2 ] - rgb[ 0 ] ) / d;  // between cyan & yellow
            } else if ( rgb[ 2 ] === max ) {
                // between magenta & cyan
                hsv[ 0 ] = 4.0 + ( rgb[ 0 ] - rgb[ 1 ] ) / d;  
            }
            // hue segment to degrees
            hsv[ 0 ] *= 60.0; 
        }
        return hsv;
    };
    let hsvd = function( hsv0, hsv1 ) {
        let d = [ hsv1[ 0 ] - hsv0[ 0 ], hsv1[ 1 ] - hsv0[ 1 ], hsv1[ 2 ] - hsv0[ 2 ]  ];
        return Math.sqrt( d[ 0 ] * d[ 0 ] + d[ 1 ] * d[ 1 ] + d[ 2 ] * d[ 2 ] );
    };
    //
    //
    //
    let test = function (x, y) {
        index = (y * rowbytes) + (x * bpp);
        let hsv = rgbtohsv( [ pixels[index], pixels[index + 1], pixels[index + 2] ] );
        return ( alpha[index+3] !== 0 && hsvd( hsv, hsvseed ) < threshold );
        /*
        return ( alpha[index+3] !== 0 && 
                Math.abs( pixels[index] - seed[ 0 ] ) <= threshold && 
                Math.abs( pixels[index + 1] - seed[ 1 ] ) <= threshold && 
                Math.abs( pixels[index + 2] - seed[ 2 ] ) <= threshold);
                */
    };
    let fill = function (x, y) {
        var stack = [];
        stack.push({ x: x, y: y });
        while (stack.length > 0) {
            let p = stack.pop();
            if (!(p.x < 0 || p.x >= colour.width || p.y < 0 || p.y >= colour.height)) {
                if (test(p.x, p.y)) {
                    index = (p.y * rowbytes) + (p.x * bpp);
                    alpha[index + 3] = 0;
                    stack.push({ x: p.x - 1, y: p.y });
                    stack.push({ x: p.x + 1, y: p.y });
                    stack.push({ x: p.x, y: p.y - 1 });
                    stack.push({ x: p.x, y: p.y + 1 });
                    
                    postMessage({
                        command: 'progress',
                        x: p.x,
                        y: p.y
                    });
                }
            }
        }
    };
    //
    // scan edges for seed colour
    //
    let x = 0;
    let y = 0;
    //
    // top
    //
    for (x = 0; x < width - 1; x++) {
        index = (y * rowbytes) + (x * bpp);
        seed[ 0 ] = pixels[index];
        seed[ 1 ] = pixels[index+1];
        seed[ 2 ] = pixels[index+2];
        hsvseed = rgbtohsv( seed );
        if (test(x, y)) {
            fill(x, y);
        }
    }
    //
    // right
    //
    x = colour.width - 1;
    for (y = 0; y < height - 1; y++) {
        index = (y * rowbytes) + (x * bpp);
        seed[ 0 ] = pixels[index];
        seed[ 1 ] = pixels[index+1];
        seed[ 2 ] = pixels[index+2];
        hsvseed = rgbtohsv( seed );
        if (test(x, y)) {
            fill(x, y);
        }
    }
    //
    // bottom
    //
    y = colour.height - 1;
    for (x = 1; x < width; x++) {
        index = (y * rowbytes) + (x * bpp);
        seed[ 0 ] = pixels[index];
        seed[ 1 ] = pixels[index+1];
        seed[ 2 ] = pixels[index+2];
        hsvseed = rgbtohsv( seed );
        if (test(x, y)) {
            fill(x, y);
        }
    }
    //
    // left
    //
    x = 0;
    for (y = 1; y < height; y++) {
        index = (y * rowbytes) + (x * bpp);
        seed[ 0 ] = pixels[index];
        seed[ 1 ] = pixels[index+1];
        seed[ 2 ] = pixels[index+2];
        hsvseed = rgbtohsv( seed );
        if (test(x, y)) {
            fill(x, y);
        }
    }
    //
    //
    //
    postMessage(e.data);
});
