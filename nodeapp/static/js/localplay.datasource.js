/**
 *
 * @source: https://github.com/LocalPlay/PlayYourPlace/tree/master/htdocs/js/localplay.datasource.js
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
//
// datasource module
// queries to server and eventually local storage
//
/*eslint-env browser*/
/*global localplay*/
localplay.datasource = (function () {
    if (localplay.datasource) return localplay.datasource;
    //
    // private utility functions
    //
    function responsetojson(response) {
        //
        // trim json string to remove invalid characters
        //
        var json = response;
        while (json.length > 0 && json[0] != '{' && json[0] != '[') json = json.substr(1);
        return json;
    }
    
    function responsetostring(response) {
        var json = responsetojson(response);
        try {
            /*
            { "status" : "OK|FAILED", "message" : "message text" }
            */
            var string = "";
            var object = JSON.parse(json);
            if (object.status == "OK") { // TODO: review this functionality
                string += "<h3>Success</h3>";
            } else {
                string += "<h3>Failure</h3>";
            }
            if (object.message) {
                string += object.message;
            }
            return string;
        } catch (error) {
            return response;
        }
    }
    //
    // Datasource interface
    //
    var datasource = {};

    datasource.transactions = [];

    datasource.put = function (target, param, delegate, data) {
        //
        // create request object
        //
        var xhr = this.createrequest('PUT', target, param, delegate);
        //
        //
        //
        if (data != null) {
            xhr.setRequestHeader("Content-type", "application/json");
            var json = JSON.stringify(data);
            console.log( 'datasource.put : ' + json.length + ' characters' );
            xhr.send(json);
        } else {
            xhr.send();
        }
    }
    //
    //
    //
    datasource.post = function (target, param, delegate, data) {
        //
        // create request object
        //
        var xhr = this.createrequest('POST', target, param, delegate);
        //
        //
        //
        if (data != null) {
            xhr.setRequestHeader("Content-type", "application/json");
            var json = JSON.stringify(data);
            console.log( 'datasource.put : ' + json.length + ' characters' );
            xhr.send(json);
        } else {
            xhr.send();
        }
    }
    //
    //
    //
    datasource.get = function (source, param, delegate) {
        //
        // create request object
        //
        var xhr = this.createrequest('GET', source, param, delegate);
        //
        // build request
        //
        xhr.send();
    }
    //
    //
    //
    datasource.delete = function (target, param, delegate) {
        //
        // create request object
        //
        var xhr = this.createrequest('DELETE', target, param, delegate);
        //
        // build request
        //
        xhr.send();
    }
    //
    //
    //
    datasource.createrequest = function (method, url, param, delegate) {
        var _this = this;
        //
        // create request object
        //
        var xhr = new XMLHttpRequest();
        this.transactions.push(xhr);
        //
        // add datasource specific data
        // 
        // TODO: perhaps protect this inside 'localplay' object
        //
        xhr.datasource = {
            delegate: (delegate != undefined) ? delegate : null,
            progress: 0,
            status: 0,
            statustext: ""
        };
        //
        // hook events
        //
        if (xhr.onloadend) {
            xhr.addEventListener('load', function (e) {
                _this.onload(e);
            }, false);
            xhr.addEventListener('loadend', function (e) {
                _this.onloadend(e);
            }, false);
        } else {
            xhr.addEventListener('load', function (e) {
                _this.onloadend(e);
            }, false);
        }

        xhr.addEventListener('loadstart', function (e) {
            _this.onloadstart(e);
        }, false);
        xhr.addEventListener('progress', function (e) {
            _this.onprogress(e);
        }, false);
        xhr.addEventListener('abort', function (e) {
            _this.onabort(e);
        }, false);
        xhr.addEventListener('timeout', function (e) {
            _this.ontimeout(e);
        }, false);
        xhr.addEventListener('error', function (e) {
            _this.onerror(e);
        }, false);
        //
        // build query string
        //
        var query = "";
        for (var key in param) {
            if (query.length == 0) {
                query += '?';
            } else {
                query += '&';
            }
            query += key + '=' + escape(param[key]);
        }
        //
        // open request
        //
        console.log('datasource.createrequest : ' + url + query);
        xhr.open(method, url + query, true);
        //
        //
        //
        return xhr;
    }
    //
    // 
    //
    datasource.stop = function (delegate) {
        if (delegate === undefined || delegate == null) {
            //
            // stop all downloads
            //
            var transactions = this.transactions;
            this.transactions = [];
            for (var i = 0; i < downloads.length; i++) {
                transactions[i].abort();
            }
        } else {
            //
            // stop downloads associated with delegate
            //
            for (var i = 0; i < this.downloads.length; i++) {
                if (this.downloads[i].datasource.delegate === delegate) {
                    this.downloads[i].abort();
                }
            }
        }
    }
    //
    //
    //
    datasource.remove = function (xhr) {
        var i = this.transactions.indexOf(xhr);
        if (i != -1) {
            this.transactions.splice(i, 1);
        }
    }
    //
    // event handling
    //
    datasource.onload = function (e) {
        var delegate = e.target.datasource.delegate;
        if (delegate != undefined && delegate != null && delegate.datasourceonload != undefined) {
            delegate.datasourceonload(e);
        }
    }

    datasource.onloadstart = function (e) {
        var delegate = e.target.datasource.delegate;
        if (delegate != undefined && delegate != null && delegate.datasourceonloadstart != undefined) {
            delegate.datasourceonloadstart(e);
        }
    }

    datasource.onloadend = function (e) {
        //
        // update status
        //
        var xhr = e.target;
        xhr.datasource.status = xhr.status;
        xhr.datasource.statustext = xhr.statusText;
        xhr.datasource.responseText = xhr.response === undefined ? xhr.responseText : xhr.response;
        xhr.datasource.response = responsetojson( xhr.datasource.responseText );
        //
        // inform delegate
        //
        var delegate = e.target.datasource.delegate;
        if (delegate != undefined && delegate != null && delegate.datasourceonloadend != undefined) {
            delegate.datasourceonloadend(e);
        }
        this.remove(e.target);
    }

    datasource.onprogress = function (e) {
        //
        // update progress
        //
        e.target.datasource.progress = e.loaded / (e.total > 0 ? e.total : 1);
        //
        // inform delegate
        //
        var delegate = e.target.datasource.delegate;
        if (delegate != undefined && delegate != null && delegate.datasourceonprogress != undefined) {
            delegate.datasourceonprogress(e);
        }

    }

    datasource.onabort = function (e) {
        var delegate = e.target.datasource.delegate;
        if (delegate != undefined && delegate != null && delegate.datasourceonabort != undefined) {
            delegate.datasourceonabort(e.target.datasource);
        }
    }

    datasource.ontimeout = function (e) {
        var delegate = e.target.datasource.delegate;
        if (delegate != undefined && delegate != null && delegate.downlaoderontimeout != undefined) {
            delegate.downlaoderontimeout(e.target.datasource);
        }
    }

    datasource.onerror = function (e) {
        var delegate = e.target.datasource.delegate;
        if (delegate != undefined && delegate != null && delegate.datasourceonerror != undefined) {
            delegate.datasourceonerror(e.target.datasource);
        }
    }
    //
    //
    //
    datasource.responsetostring = function (response) {
        var json = localplay.domutils.responseToJSON(response); // TODO: this will change to localplay.utils
        try {

            //{ "status" : "OK|FAILED", "message" : "message text" }

            var string = "";
            var object = JSON.parse(json);
            if (object.status == "OK") {
                string += "<h3>Success</h3>";
            } else {
                string += "<h3>Failure</h3>";
            }
            if (object.message) {
                string += object.message;
            }
            return string;
        } catch (error) {
            return response;
        }
    }

    //
    //
    //
    function DatasourceProgressBarDelegate(parent) {
        this.parent = parent;

        this.progress = document.createElement('progress');
        this.progress.max = '100';

        this.panel = document.createElement('div');
        this.panel.className = 'progress';

        this.prompt = document.createElement('p');

        this.panel.appendChild(this.prompt);
        this.panel.appendChild(this.progress);
        this.parent.appendChild(this.panel);
    }

    DatasourceProgressBarDelegate.prototype.datasourceonload = function (datasource) {

        this.prompt.innerText = datasource.statustext;
        this.parent.removeChild(this.panel);
    }

    DatasourceProgressBarDelegate.prototype.datasourceonprogress = function (datasource) {
        this.progress.value = (datasource.progress * 100.0);
    }

    DatasourceProgressBarDelegate.prototype.datasourceonerror = function (datasource) {
        this.parent.removeChild(this.panel);
        var response = uploader.xhr.response === undefined ? uploader.xhr.responseText : uploader.xhr.response;
        localplay.log(response);
    }

    function DatasourceProgressPanel(parent) {
        this.parent = parent;
        this.panel = document.createElement('div');
        this.panel.className = 'popup';
    }

    DatasourceProgressPanel.prototype.show = function () {

    }

    DatasourceProgressPanel.prototype.hide = function () {

    }

    function DatasourceProgressDialog(prompt, callback) {

        this.callback = callback;

        var wrapper = document.createElement("div");
        wrapper.style.width = '50vw';
        wrapper.style.height = '25vw';
        this.progress = document.createElement('progress');
        this.progress.max = '100';
        this.progress.style.width = '45vw'; // TODO: move this etc into css
        wrapper.appendChild(this.progress);

        this.dialog = localplay.dialogbox.createdialogbox(prompt, [wrapper]);
        this.dialog.show(true);
    }

    DatasourceProgressDialog.prototype.datasourceonloadend = function (e) {
        var xhr = e.target;

        this.dialog.close();

        try {
            var response = JSON.parse(xhr.datasource.response);
            // TODO: handle error
            if ( response.status === 'OK' ) {
                localplay.dialogbox.alert("Platform", response.message||'Success');
            } else {
                localplay.dialogbox.alert("Platform - error", response.error||'Error');
            }
        } catch (error) {
            localplay.dialogbox.alert("Platform - server error", xhr.datasource.response);
        }
        if (this.callback) {
            this.callback(e);
        }
    }

    DatasourceProgressDialog.prototype.datasourceonprogress = function (e) {
        var xhr = e.target;
        this.progress.value = (xhr.datasource.progress * 100.0).toString();
    }

    DatasourceProgressDialog.prototype.onerror = function (e) {
        var xhr = e.target;

        this.dialog.close();
        var dialog = localplay.dialogbox.alert("Platform", xhr.datasource.response);
        dialog.show();

        if (this.callback) {
            this.callback(e);
        }
    }
    //
    // progress dialog factory
    //
    datasource.createprogressdialog = function (prompt, callback) {
        return new DatasourceProgressDialog(prompt, callback);
    }
    //
    //
    //
    return datasource;
}());


