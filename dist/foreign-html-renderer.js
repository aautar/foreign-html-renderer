var ForeignHtmlRenderer = (function (exports) {
    'use strict';

    const PaperPlane = {};

    PaperPlane.ContentType = {
        APPLICATION_JSON: "application/json"
    };

    PaperPlane.convertBlobToString = function(_blob, _onConvert) {
        const reader = new FileReader();
        reader.readAsText(_blob); 
        reader.onloadend = function() {
            _onConvert(reader.result);
        };
    };

    /**
     * 
     * @param {Blob} _respBlob 
     * @returns {String|Object|Blob}
     */
    PaperPlane.parseXHRResponseData = function(_respBlob, _onParseComplete) {
        if(typeof _respBlob === 'undefined' || _respBlob === null || _respBlob.size === 0) {
            _onParseComplete(_respBlob);
            return;
        }

        if(_respBlob.type === PaperPlane.ContentType.APPLICATION_JSON) {
            var parsedResponseBody = {};
            
            PaperPlane.convertBlobToString(_respBlob, function(_blobTextual) {
                parsedResponseBody = JSON.parse(_blobTextual);
                _onParseComplete(parsedResponseBody);
            });

        } else if(_respBlob.type.split('/')[0] === 'text') {
            PaperPlane.convertBlobToString(_respBlob, function(_blobTextual) {
                _onParseComplete(_blobTextual);
            });
        } else {
            _onParseComplete(_respBlob);
        }
    };

    /**
     * @param {FormData} _data
     * @param {Map=} _httpHeaders
     * @returns {Object}
     */
    PaperPlane.makeFormDataRequestData = function(_data, _httpHeaders) {
        return {
            body: _data,
            headers: (_httpHeaders || new Map())
        };
    };

    /**
     * @param {Object} _data
     * @param {Map=} _httpHeaders
     * @returns {Object}
     */
    PaperPlane.makeJsonRequestData = function(_data, _httpHeaders) {
        _httpHeaders = _httpHeaders || (new Map());
        _httpHeaders.set("Content-Type", PaperPlane.ContentType.APPLICATION_JSON);

        return {
            body: JSON.stringify(_data),
            headers: _httpHeaders
        };
    };

    /**
     * @param {Blob} _blob
     * @param {Map=} _httpHeaders
     * @returns {Object}
     */
    PaperPlane.makeBlobRequestData = function(_blob, _httpHeaders) {
        _httpHeaders = _httpHeaders || (new Map());
        _httpHeaders.set("Content-Type", _blob.type);

        return {
            body: _blob,
            headers: _httpHeaders
        };
    };


    /**
     * @param {Map} _params
     * @returns {String}
     */
     PaperPlane.makeUrlQueryString = function(_params) {
        const queryParts = [];
        for (let [key, value] of _params) {
            queryParts.push(`${key}=${encodeURIComponent(value)}`);
        }

        return "?" + queryParts.join("&");
    };

    /**
     * @callback PaperPlane~responseCallback
     * @param {String|Object} responseData
     * @param {XMLHttpRequest} xhr
     */


    /**
     * 
     * @param {String} _method
     * @param {String} _url
     * @param {Object} _requestData
     * @param {PaperPlane~responseCallback} [_onSuccess]
     * @param {PaperPlane~responseCallback} [_onError]
     * @param {PaperPlane~responseCallback} [_onComplete]
     * @returns {XMLHttpRequest}
     */
    PaperPlane.xhr = function(
        _method, 
        _url,
        _requestData,
        _onSuccess,
        _onError,
        _onComplete,
        _clientSettings
    ) {
        const httpHeaders = _requestData.headers;
        _onSuccess = _onSuccess || (() => {});
        _onError = _onError || (() => {});        
        _onComplete = _onComplete || (() => {});    

        const internalErrorHander = function(_xhr, _errorMessageHint) {
            if(_errorMessageHint) {
                _onError(_errorMessageHint, xhr);
            } else {
                PaperPlane.parseXHRResponseData(xhr.response, function(_parsedResponse) {
                    _onError(_parsedResponse, xhr);
                });
            }
        };

        const xhr = new XMLHttpRequest();
        xhr.open(_method, _url);

        for (let [key,value] of httpHeaders) {
            xhr.setRequestHeader(key, value);
        }

        xhr.responseType = 'blob';

        if(_clientSettings && _clientSettings.timeout) {
            xhr.timeout = _clientSettings.timeout;
        } else {
            xhr.timeout = 30000;
        }

        xhr.onload = function() {
            if(xhr.status >= 400) {
                internalErrorHander();
            } else {
                PaperPlane.parseXHRResponseData(xhr.response, function(_parsedResponse) {
                    _onSuccess(_parsedResponse, xhr);
                });
            }
        };

        xhr.ontimeout = function() {
            internalErrorHander(xhr, "client timeout");
        };

        xhr.onerror = function() {
            internalErrorHander();
        };

        xhr.onloadend = function() {
            PaperPlane.parseXHRResponseData(xhr.response, function(_parsedResponse) {
                _onComplete(_parsedResponse, xhr);
            });
        };

        xhr.send(_requestData.body);

        return xhr;
    };

    /**
     * 
     * @param {String} _url
     * @param {Object} _requestData
     * @param {PaperPlane~responseCallback} _onSuccess
     * @param {PaperPlane~responseCallback} _onError
     * @param {PaperPlane~responseCallback} _onComplete
     * @returns {XMLHttpRequest}
     */
    PaperPlane.post = function(
        _url, 
        _requestData,
        _onSuccess, 
        _onError, 
        _onComplete
    ) {
        return PaperPlane.xhr(
            "POST",
            _url,
            _requestData,
            _onSuccess,
            _onError,
            _onComplete
        );
    };


    /**
     * 
     * @param {String} _url
     * @param {Object} _requestData
     * @param {PaperPlane~responseCallback} _onSuccess
     * @param {PaperPlane~responseCallback} _onError
     * @param {PaperPlane~responseCallback} _onComplete
     * @returns {XMLHttpRequest}
     */
    PaperPlane.put = function(
        _url, 
        _requestData,
        _onSuccess, 
        _onError, 
        _onComplete
    ) {
        return PaperPlane.xhr(
            "PUT",
            _url,
            _requestData,
            _onSuccess,
            _onError,
            _onComplete
        );

    };


    /**
     * 
     * @param {String} _url
     * @param {Object} _requestData
     * @param {PaperPlane~responseCallback} _onSuccess
     * @param {PaperPlane~responseCallback} _onError
     * @param {PaperPlane~responseCallback} _onComplete
     * @returns {XMLHttpRequest}
     */
    PaperPlane.delete = function(
        _url, 
        _requestData,
        _onSuccess, 
        _onError, 
        _onComplete
    ) {
        return PaperPlane.xhr(
            "DELETE",
            _url,
            _requestData,
            _onSuccess,
            _onError,
            _onComplete
        );
    };

    /**
     * @param {String} _url 
     * @param {Object} [_httpHeaders={}]
     * @param {PaperPlane~responseCallback} _onSuccess
     * @param {PaperPlane~responseCallback} _onError
     * @param {PaperPlane~responseCallback} _onComplete
     * @returns {XMLHttpRequest}
     */
    PaperPlane.get = function(
        _url, 
        _httpHeaders,
        _onSuccess, 
        _onError, 
        _onComplete
    ) {
        return PaperPlane.xhr(
            "GET",
            _url,
            {
                body: null,
                headers: _httpHeaders
            },
            _onSuccess,
            _onError,
            _onComplete
        ); 
    };

    /**
     * @param {String} _url 
     * @param {Object} [_httpHeaders={}]
     * @param {PaperPlane~responseCallback} _onSuccess
     * @param {PaperPlane~responseCallback} _onError
     * @param {PaperPlane~responseCallback} _onComplete
     * @returns {XMLHttpRequest}
     */
    PaperPlane.head = function(
        _url, 
        _httpHeaders,
        _onSuccess, 
        _onError, 
        _onComplete
    ) {
        return PaperPlane.xhr(
            "HEAD",
            _url,
            {
                body: null,
                headers: _httpHeaders
            },
            _onSuccess,
            _onError,
            _onComplete
        ); 
    };


    /**
     * 
     * @param {String} _url
     * @param {Object} _requestData
     * @returns {Boolean}
     */
    PaperPlane.postBeacon = function(_url, _requestData) {
        return navigator.sendBeacon(_url, _requestData.body);
    };

    /**
     * 
     * @param {StyleSheetList} styleSheets 
     */
    const ImageRenderer = function(styleSheets) {
        const self = this;

        /**
         * 
         * @param {Blob} blob 
         */
        const blobToBase64 = function(blob) {
            return new Promise(function(resolve) {
                const reader = new FileReader();
                reader.readAsDataURL(blob); 
                reader.onloadend = function() {
                    resolve(reader.result);
                };  
            });     
        };

        /**
         * 
         * @param {String} url 
         * @returns {Promise}
         */
        const getResourceAsBase64 = function(url) {
            return new Promise(function(resolve, reject) {
                PaperPlane.get(
                    url, 
                    new Map(), 
                    async (parsedResponse, xhr) => {
                        //
                        // Note: do not use the parsed response, we just want to work with the Blob
                        //
                        if(xhr.response.constructor.name !== 'Blob') {
                            resolve(
                                {
                                    "resourceUrl": url,
                                    "resourceBase64": null,
                                }
                            );
                        } else {
                            const resBase64 = await blobToBase64(xhr.response);
                            resolve(
                                {
                                    "resourceUrl": url,
                                    "resourceBase64": resBase64,
                                }
                            );
                        }
                    },
                    () => {
                        reject('xhr request failed');
                    }
                );
            });
        };

        /**
         * 
         * @param {String[]} urls 
         * @returns {Promise}
         */
        const getMultipleResourcesAsBase64 = function(urls) {
            const promises = [];
            for(let i=0; i<urls.length; i++) {
                promises.push( getResourceAsBase64(urls[i]) );
            }
            return Promise.all(promises);
        };

        /**
         * 
         * @param {String} str 
         * @param {Number} startIndex 
         * @param {String} prefixToken 
         * @param {String[]} suffixTokens
         * 
         * @returns {String|null} 
         */
        const parseValue = function(str, startIndex, prefixToken, suffixTokens) {
            const idx = str.indexOf(prefixToken, startIndex);
            if(idx === -1) {
                return null;
            }

            let val = '';
            for(let i=idx+prefixToken.length; i<str.length; i++) {
                if(suffixTokens.indexOf(str[i]) !== -1) {
                    break;
                }

                val += str[i];
            }

            return {
                "foundAtIndex": idx,
                "value": val
            }
        };

        /**
         * 
         * @param {String} cssRuleStr 
         * @returns {String[]}
         */
        const getUrlsFromCssString = function(cssRuleStr) {
            const urlsFound = [];
            let searchStartIndex = 0;

            while(true) {
                const url = parseValue(cssRuleStr, searchStartIndex, "url(", [')']);
                if(url === null) {
                    break;
                }

                searchStartIndex = url.foundAtIndex + url.value.length;
                urlsFound.push(removeQuotes(url.value));
            }

            return urlsFound;
        };    

        /**
         * 
         * @param {String} html 
         * @returns {String[]}
         */
        const getImageUrlsFromFromHtml = function(html) {
            const urlsFound = [];
            let searchStartIndex = 0;

            while(true) {
                const url = parseValue(html, searchStartIndex, 'src=', [' ', '>', '\t']);
                if(url === null) {
                    break;
                }

                searchStartIndex = url.foundAtIndex + url.value.length;
                urlsFound.push(removeQuotes(url.value));
            }

            return urlsFound;
        };

        /**
         * 
         * @param {String} str
         * @returns {String}
         */
        const removeQuotes = function(str) {
            return str.replace(/["']/g, "");
        };

        const escapeRegExp = function(string) {
            return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
        };

        /**
         * 
         * @param {String} contentHtml 
         * @param {Number} width
         * @param {Number} height
         * 
         * @returns {Promise<String>}
         */
        const buildSvgDataUri = async function(contentHtml, width, height) {

            return new Promise(async function(resolve, reject) {

                /* !! The problems !!
                *  1. CORS (not really an issue, expect perhaps for images, as this is a general security consideration to begin with)
                *  2. Platform won't wait for external assets to load (fonts, images, etc.)
                */ 

                // copy styles
                let cssStyles = "";
                let urlsFoundInCss = [];

                for (let i=0; i<styleSheets.length; i++) {
                    try {
                        const canAccessRules = styleSheets[i].cssRules;
                    } catch(err) {
                        console.warn("Inaccessible stylesheet: " + styleSheets[i].href);
                        continue;
                    }

                    for(let j=0; j<styleSheets[i].cssRules.length; j++) {
                        const cssRuleStr = styleSheets[i].cssRules[j].cssText;
                        urlsFoundInCss.push( ...getUrlsFromCssString(cssRuleStr) );
                        cssStyles += cssRuleStr;
                    }
                }

                const fetchedResourcesFromStylesheets = await getMultipleResourcesAsBase64(urlsFoundInCss);
                for(let i=0; i<fetchedResourcesFromStylesheets.length; i++) {
                    const r = fetchedResourcesFromStylesheets[i];
                    cssStyles = cssStyles.replace(new RegExp(escapeRegExp(r.resourceUrl),"g"), r.resourceBase64);
                }

                let urlsFoundInHtml = getImageUrlsFromFromHtml(contentHtml);
                const fetchedResources = await getMultipleResourcesAsBase64(urlsFoundInHtml);
                for(let i=0; i<fetchedResources.length; i++) {
                    const r = fetchedResources[i];
                    contentHtml = contentHtml.replace(new RegExp(escapeRegExp(r.resourceUrl),"g"), r.resourceBase64);
                }

                const styleElem = document.createElement("style");
                styleElem.innerHTML = cssStyles;

                const styleElemString = new XMLSerializer().serializeToString(styleElem);

                // create DOM element string that encapsulates styles + content
                const contentRootElem = document.createElement("div");
                contentRootElem.innerHTML = styleElemString + contentHtml;
                contentRootElem.setAttribute("xmlns", "http://www.w3.org/1999/xhtml");

                const contentRootElemString = new XMLSerializer().serializeToString(contentRootElem);

                // build SVG string
                const svg = `
                <svg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}'>
                    <g transform='translate(0, 0) rotate(0)'>
                        <foreignObject x='0' y='0' width='${width}' height='${height}'>
                            ${contentRootElemString}
                        </foreignObject>
                    </g>
                </svg>`;

                // convert SVG to data-uri
                const dataUri = `data:image/svg+xml;base64,${window.btoa(svg)}`;

                resolve(dataUri);                    
            });
        };

        /**
         * @param {String} html
         * @param {Number} width
         * @param {Number} height
         * 
         * @return {Promise<Image>}
         */
        this.renderToImage = async function(html, width, height) {
            return new Promise(async function(resolve, reject) {
                const img = new Image();
                img.src = await buildSvgDataUri(html, width, height);
        
                img.onload = function() {
                    resolve(img);
                };
            });
        };

        /**
         * @param {String} html
         * @param {Number} width
         * @param {Number} height
         * 
         * @return {Promise<Image>}
         */
        this.renderToCanvas = async function(html, width, height) {
            return new Promise(async function(resolve, reject) {
                const img = await self.renderToImage(html, width, height);

                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;

                const canvasCtx = canvas.getContext('2d');
                canvasCtx.drawImage(img, 0, 0, img.width, img.height);

                resolve(canvas);
            });
        };    

        /**
         * @param {String} html
         * @param {Number} width
         * @param {Number} height
         * 
         * @return {Promise<String>}
         */
        this.renderToBase64Png = async function(html, width, height) {
            return new Promise(async function(resolve, reject) {
                const canvas = await self.renderToCanvas(html, width, height);
                resolve(canvas.toDataURL('image/png'));
            });
        };

    };

    exports.ImageRenderer = ImageRenderer;

    Object.defineProperty(exports, '__esModule', { value: true });

    return exports;

}({}));
