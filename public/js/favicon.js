/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*
		favicon alert related functions
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

/*!
 * visibly - v0.7 Page Visibility API Polyfill
 * http://github.com/addyosmani
 * Copyright (c) 2011-2014 Addy Osmani
 * Dual licensed under the MIT and GPL licenses.
 *
 * Methods supported:
 * visibly.onVisible(callback)
 * visibly.onHidden(callback)
 * visibly.hidden()
 * visibly.visibilityState()
 * visibly.visibilitychange(callback(state));
 */

;(function () {

    window.visibly = {
        q: document,
        p: undefined,
        prefixes: ['webkit', 'ms','o','moz','khtml'],
        props: ['VisibilityState', 'visibilitychange', 'Hidden'],
        m: ['focus', 'blur'],
        visibleCallbacks: [],
        hiddenCallbacks: [],
        genericCallbacks:[],
        _callbacks: [],
        cachedPrefix:"",
        fn:null,

        onVisible: function (_callback) {
            if(typeof _callback == 'function' ){
                this.visibleCallbacks.push(_callback);
            }
        },
        onHidden: function (_callback) {
            if(typeof _callback == 'function' ){
                this.hiddenCallbacks.push(_callback);
            }
        },
        getPrefix:function(){
            if(!this.cachedPrefix){
                for(var l=0;b=this.prefixes[l++];){
                    if(b + this.props[2] in this.q){
                        this.cachedPrefix =  b;
                        return this.cachedPrefix;
                    }
                }
             }
        },

        visibilityState:function(){
            return  this._getProp(0);
        },
        hidden:function(){
            return this._getProp(2);
        },
        visibilitychange:function(fn){
            if(typeof fn == 'function' ){
                this.genericCallbacks.push(fn);
            }

            var n =  this.genericCallbacks.length;
            if(n){
                if(this.cachedPrefix){
                     while(n--){
                        this.genericCallbacks[n].call(this, this.visibilityState());
                    }
                }else{
                    while(n--){
                        this.genericCallbacks[n].call(this, arguments[0]);
                    }
                }
            }

        },
        isSupported: function (index) {
            return ((this._getPropName(2)) in this.q);
        },
        _getPropName:function(index) {
            return (this.cachedPrefix == "" ? this.props[index].substring(0, 1).toLowerCase() + this.props[index].substring(1) : this.cachedPrefix + this.props[index]);
        },
        _getProp:function(index){
            return this.q[this._getPropName(index)];
        },
        _execute: function (index) {
            if (index) {
                this._callbacks = (index == 1) ? this.visibleCallbacks : this.hiddenCallbacks;
                var n =  this._callbacks.length;
                while(n--){
                    this._callbacks[n]();
                }
            }
        },
        _visible: function () {
            window.visibly._execute(1);
            window.visibly.visibilitychange.call(window.visibly, 'visible');
        },
        _hidden: function () {
            window.visibly._execute(2);
            window.visibly.visibilitychange.call(window.visibly, 'hidden');
        },
        _nativeSwitch: function () {
            this[this._getProp(2) ? '_hidden' : '_visible']();
        },
        _listen: function () {
            try { /*if no native page visibility support found..*/
                if (!(this.isSupported())) {
                    if (this.q.addEventListener) { /*for browsers without focusin/out support eg. firefox, opera use focus/blur*/
                        window.addEventListener(this.m[0], this._visible, 1);
                        window.addEventListener(this.m[1], this._hidden, 1);
                    } else { /*IE <10s most reliable focus events are onfocusin/onfocusout*/
                        if (this.q.attachEvent) {
                            this.q.attachEvent('onfocusin', this._visible);
                            this.q.attachEvent('onfocusout', this._hidden);
                        }
                    }
                } else { /*switch support based on prefix detected earlier*/
                    this.q.addEventListener(this._getPropName(1), function () {
                        window.visibly._nativeSwitch.apply(window.visibly, arguments);
                    }, 1);
                }
            } catch (e) {}
        },
        init: function () {
            this.getPrefix();
            this._listen();
        }
    };

    this.visibly.init();
})();


/*!
 * Tinycon - A small library for manipulating the Favicon
 * Tom Moor, http://tommoor.com
 * Copyright (c) 2012 Tom Moor
 * @license MIT Licensed
 * @version 0.6.3
 */

(function(){

	var Tinycon = {};
	var currentFavicon = null;
	var originalFavicon = null;
	var faviconImage = null;
	var canvas = null;
	var options = {};
	var r = window.devicePixelRatio || 1;
	var size = 16 * r;
	var defaults = {
		width: 7,
		height: 9,
		font: 10 * r + 'px arial',
		colour: '#ffffff',
		background: '#F03D25',
		fallback: true,
		crossOrigin: true,
		abbreviate: true
	};

	var ua = (function () {
		var agent = navigator.userAgent.toLowerCase();
		// New function has access to 'agent' via closure
		return function (browser) {
			return agent.indexOf(browser) !== -1;
		};
	}());

	var browser = {
		ie: ua('msie'),
		chrome: ua('chrome'),
		webkit: ua('chrome') || ua('safari'),
		safari: ua('safari') && !ua('chrome'),
		mozilla: ua('mozilla') && !ua('chrome') && !ua('safari')
	};

	// private methods
	var getFaviconTag = function(){

		var links = document.getElementsByTagName('link');

		for(var i=0, len=links.length; i < len; i++) {
			if ((links[i].getAttribute('rel') || '').match(/\bicon\b/)) {
				return links[i];
			}
		}

		return false;
	};

	var removeFaviconTag = function(){

		var links = document.getElementsByTagName('link');
		var head = document.getElementsByTagName('head')[0];

		for(var i=0, len=links.length; i < len; i++) {
			var exists = (typeof(links[i]) !== 'undefined');
			if (exists && (links[i].getAttribute('rel') || '').match(/\bicon\b/)) {
				head.removeChild(links[i]);
			}
		}
	};

	var getCurrentFavicon = function(){

		if (!originalFavicon || !currentFavicon) {
			var tag = getFaviconTag();
			originalFavicon = currentFavicon = tag ? tag.getAttribute('href') : '/favicon.ico';
		}

		return currentFavicon;
	};

	var getCanvas = function (){

		if (!canvas) {
			canvas = document.createElement("canvas");
			canvas.width = size;
			canvas.height = size;
		}

		return canvas;
	};

	var setFaviconTag = function(url){
		removeFaviconTag();

		var link = document.createElement('link');
		link.type = 'image/x-icon';
		link.rel = 'icon';
		link.href = url;
		document.getElementsByTagName('head')[0].appendChild(link);
	};

	var log = function(message){
		if (window.console) window.console.log(message);
	};

	var drawFavicon = function(label, colour) {

		// fallback to updating the browser title if unsupported
		if (!getCanvas().getContext || browser.ie || browser.safari || options.fallback === 'force') {
			return updateTitle(label);
		}

		var context = getCanvas().getContext("2d");
		var colour = colour || '#000000';
		var src = getCurrentFavicon();

		faviconImage = document.createElement('img');
		faviconImage.onload = function() {

			// clear canvas
			context.clearRect(0, 0, size, size);

			// draw the favicon
			context.drawImage(faviconImage, 0, 0, faviconImage.width, faviconImage.height, 0, 0, size, size);

			// draw bubble over the top
			if ((label + '').length > 0) drawBubble(context, label, colour);

			// refresh tag in page
			refreshFavicon();
		};

		// allow cross origin resource requests if the image is not a data:uri
		// as detailed here: https://github.com/mrdoob/three.js/issues/1305
		if (!src.match(/^data/) && options.crossOrigin) {
			faviconImage.crossOrigin = 'anonymous';
		}

		faviconImage.src = src;
	};

	var updateTitle = function(label) {

		if (options.fallback) {
			// Grab the current title that we can prefix with the label
			var originalTitle = document.title;

			// Strip out the old label if there is one
			if (originalTitle[0] === '(') {
				originalTitle = originalTitle.slice(originalTitle.indexOf(' '));
			}

			if ((label + '').length > 0) {
				document.title = '(' + label + ') ' + originalTitle;
			} else {
				document.title = originalTitle;
			}
		}
	};

	var drawBubble = function(context, label, colour) {

		// automatic abbreviation for long (>2 digits) numbers
		if (typeof label == 'number' && label > 99 && options.abbreviate) {
			label = abbreviateNumber(label);
		}

		// bubble needs to be larger for double digits
		var len = (label + '').length-1;

		var width = options.width * r + (6 * r * len),
			height = options.height * r;

		var top = size - height,
            left = size - width - r,
            bottom = 16 * r,
            right = 16 * r,
            radius = 2 * r;

		// webkit seems to render fonts lighter than firefox
		context.font = (browser.webkit ? 'bold ' : '') + options.font;
		context.fillStyle = options.background;
		context.strokeStyle = options.background;
		context.lineWidth = r;

		// bubble
		context.beginPath();
        context.moveTo(left + radius, top);
		context.quadraticCurveTo(left, top, left, top + radius);
		context.lineTo(left, bottom - radius);
        context.quadraticCurveTo(left, bottom, left + radius, bottom);
        context.lineTo(right - radius, bottom);
        context.quadraticCurveTo(right, bottom, right, bottom - radius);
        context.lineTo(right, top + radius);
        context.quadraticCurveTo(right, top, right - radius, top);
        context.closePath();
        context.fill();

		// bottom shadow
		context.beginPath();
		context.strokeStyle = "rgba(0,0,0,0.3)";
		context.moveTo(left + radius / 2.0, bottom);
		context.lineTo(right - radius / 2.0, bottom);
		context.stroke();

		// label
		context.fillStyle = options.colour;
		context.textAlign = "right";
		context.textBaseline = "top";

		// unfortunately webkit/mozilla are a pixel different in text positioning
		context.fillText(label, r === 2 ? 29 : 15, browser.mozilla ? 7*r : 6*r);
	};

	var refreshFavicon = function(){
		// check support
		if (!getCanvas().getContext) return;

		setFaviconTag(getCanvas().toDataURL());
	};

	var abbreviateNumber = function(label) {
		var metricPrefixes = [
			['G', 1000000000],
			['M',    1000000],
			['k',       1000]
		];

		for(var i = 0; i < metricPrefixes.length; ++i) {
			if (label >= metricPrefixes[i][1]) {
				label = round(label / metricPrefixes[i][1]) + metricPrefixes[i][0];
				break;
			}
		}

		return label;
	};

	var round = function (value, precision) {
		var number = new Number(value);
		return number.toFixed(precision);
	};

	// public methods
	Tinycon.setOptions = function(custom){
		options = {};

		for(var key in defaults){
			options[key] = custom.hasOwnProperty(key) ? custom[key] : defaults[key];
		}
		return this;
	};

	Tinycon.setImage = function(url){
		currentFavicon = url;
		refreshFavicon();
		return this;
	};

	Tinycon.setBubble = function(label, colour) {
		label = label || '';
		drawFavicon(label, colour);
		return this;
	};

	Tinycon.reset = function(){
		setFaviconTag(originalFavicon);
	};

	Tinycon.setOptions(defaults);
	window.Tinycon = Tinycon;

	if(typeof define === 'function' && define.amd) {
		define(Tinycon);
	}

})();
