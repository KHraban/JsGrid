//JsGrid v 1.0 by Konstantin Hraban (konstantinhraban@gmail.com)
(function(win){
    if(!win)
        return;
    //closure for private static members. Returns plugin instance constructor
    var JsGrid =  (function () {
        //private static members
        var doc = win.document,
            modules = {},
            newJsGrid,
            defaultSettings,
            utils,
            constants = {
                styles: {
                    styleSheet: "jsgrid-css",
                    longString: "jsgrid-longstring",
                    tooltip: "jsgrid-tooltip",
                    modal: "jsgrid-modal",
                    modalPopup: "jsgrid-modal-popup",
                    modalControls: "jsgrid-modal-controls",
                    modalSpecificControls: "jsgrid-modal-specific-controls",
                    modalControlsOk: "jsgrid-modal-controls-ok",
                    modalControlsCancel: "jsgrid-modal-controls-cancel",
                    modalContent: "jsgrid-modal-content",
                    modalContentTitle: "jsgrid-modal-content-title",
                    modalContentMessages: "jsgrid-modal-content-messages",
                    modalContentLeft: "jsgrid-modal-content-left",
                    modalContentRight: "jsgrid-modal-content-right",
                    resizeEl: "jsgrid-resize-el",
                    selectedRow: "jsgrid-selected-row",
                    sortIndicator: "jsgrid-sortindicator",
                    navigator: "jsgrid-navigator",
                    actionsContainer: "jsgrid-actionscontainer",
                    addAction: "jsgrid-actions-add",
                    deleteAction: "jsgrid-actions-delete",
                    editAction: "jsgrid-actions-edit",
                    searchAction: "jsgrid-actions-search",
                    linkAction: "jsgrid-actions-link",
                    reloadAction: "jsgrid-actions-reload",
                    firstPageLink: "jsgrid-links-first",
                    prevPageLink: "jsgrid-links-prev",
                    pageSelector: "jsgrid-select-pagenumber",
                    nextPageLink: "jsgrid-links-next",
                    lastPageLink: "jsgrid-links-last",
                    rowsPerPageSelector: "jsgrid-select-rowsperpage",
                    pageLabel: "jsgrid-pagelabel",
                    ofTotalLabel: "jsgrid-oftotallabel",
                    dragStart: "jsgrid-dragged",
                    disabled: "jsgrid-disabled"
                },
                strings: {
                    dateTypeYearPostfix: "-year",
                    dateTypeMonthPostfix: "-month",
                    dateTypeDayPostfix: "-day",
                    addActionText: "\u271A",
                    deleteActionText: "\u2716",
                    editActionText: "\u270E",
                    searchActionText: "\u003F",
                    linkActionText: "\u21C4",
                    reloadActionText: "\u27F3",
                    firstPageActionText: "\u00AB",
                    previousPageActionText: "\u2039",
                    nextPageActionText: "\u203A",
                    lastPageActionText: "\u00BB",
                    descendingOrderIndicator: "\u25B2",
                    ascendingOrderIndicator: "\u25BC",
                    modalOkButtonText: "\u2714",
                    modalCancelButtonText: "\u2718"
                },
                errorMessages: {
                    unsupportedBrowserMessage: "You are using an older version of the browser, which is not supported"
                }
            },
            dataTypes = {
                int: "int",
                float: "float",
                date: "date",
                bool: "bool",
                string: "string",
                longString: "longString"
            },
        // grid's events available for pub/sub
            eventTypes = {
                //data load events
                dataLoadStarted: "dataLoadStarted",
                dataLoadFinished: "dataLoadFinished",
                //row events
                rowSelected: "rowSelected",
                //modal events
                modalOkClicked: "modalOkClicked",
                modalCancelClicked: "modalCancelClicked",
                //search events
                searchFiltersApplied: "searchFiltersApplied",
                searchFiltersRemoved: "searchFiltersRemoved",
                //pager events
                firstPageClicked: "firstPageClicked",
                prevPageClicked: "prevPageClicked",
                nextPageClicked: "nextPageClicked",
                lastPageClicked: "lastPageClicked",
                pageNumberChanged: "pageNumberChanged",
                rowsPerPage: "rowsPerPage"
            };
        //default parameters will complete missing ones from the client call
        defaultSettings = {
            tableId: "",//table tag's id
            locale: "",//see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl#Locale_negotiation for details
            caption: "",//caption string
            draggableColumns: false,
            columnModel: [//array of objects
                {
                    name: "",//unique string identifier will be used to submit cell's value to server
                    required: false,//whether the field is required for submit
                    label: "",//column caption
                    width: 100,//width in px (used for resizing)
                    minWidth: 100,
                    maxWidth: 1000,
                    type: "string", //string by default, int, float, date, bool(checkbox), longString(will use textarea for edit), select as [{value: "", text: ""}] array obj
                    editable: false,//ability to edit the value
                    resizable: false,//ability to resize column,
                    footer: {
                        formatString: "",
                        aggregationMethod: ""//MIN, MAX, SUM, AVG
                    }
                }
            ],
            //function(collectionRequestBuilder), which will be called each time new page is requested
            //It will be called for each data request, in case pager is present, and never otherwise.
            //Should use collectionRequestBuilder, to append page request params & perform request
            collectionRequestProcessor: null,
            dataReader: {
                dataType: "json",//"json", "xml" and "text"(raw data)
                //function(data, collectionBuilder), which will be called each time new data is received
                //Should use collectionBuilder, to construct and populate rows
                dataProcessor: null
            },
            //footer row with action buttons & pager
            navigator: {
                displayActions: false,
                actions: {
                    addAction: false,
                    deleteAction: false,
                    editAction: false,
                    searchAction: false,
                    linkAction: false,
                    reloadAction: false
                },
                displayPager: false,
                pager: {
                    rowsPerPage: [10],
                    itemsCount: -1
                }
            },
            searchTemplate: [
                //{name: "name", prompt: "Some text", type: "same types as columns"},
            ],
            resources: {
                addActionTitle: "Add",
                deleteActionTitle: "Delete",
                editActionTitle: "Edit",
                searchActionTitle: "Search",
                linkActionTitle: "Links",
                reloadActionTitle: "Reload",
                firstPageActionTitle: "First page",
                previousPageActionTitle: "Previous page",
                nextPageActionTitle: "Next page",
                lastPageActionTitle: "Last page",
                pageLabel: "Page",
                ofLabel: "of",
                filtersAppliedLabel: "(Filters applied)",
                noFiltersAppliedLabel: "(No filters applied)",
                editRecordTitle: "Edit Record",
                addRecordTitle: "Add Record",
                searchTitle: "Search",
                monthLabel: "Month",
                dayLabel: "Day",
                yearLabel: "Year",
                defaultOptionText: "Select option",
                resetSearchFiltersLabel : "Reset all",
                deleteRowConfirmationMessage: "Do you really want to delete the row?",
                isNumberInstructionMessage: "the value can only be a valid number, e.g. 1, 3.14 or 2010",
                isAlphaNumInstructionMessage: "the value can only contain characters and numbers, no special symbols",
                isNotEmptyInstructionMessage: "the value cannot be empty",
                invalidValueMessage: "Invalid value for"
            },
            //function(statusCode, statusText), which will be called each time when http response code is other then 200
            requestErrorHandler: null

        };
        //supported data types
        defaultSettings.dataReader.dataTypes = {
            json: "json",
            xml: "xml",
            text: "text"
        };
        //aggregation methods
        defaultSettings.columnModel.aggregationMethods = {
            min: "min",
            max: "max",
            sum: "sum",
            avg: "avg"
        };
        //utility functions, that are not related to grid's functionality
        utils = (function () {
            return {
                //create namespace objects from a dot-delimited string (ex.: "three.nested.levels")
                namespace: function (parent ,namespaceString) {
                    if(!parent || typeof  namespaceString !== "string")
                        return;
                    var parts = namespaceString.split("."),
                        i;
                    //create properties
                    for(i = 0; i < parts.length; i += 1)
                    {
                        if(typeof parent[parts[i]] === "undefined")
                            parent[parts[i]] = {};
                        parent = parent[parts[i]];
                    }
                    return parent;
                },
                //check for array-ness
                isArray: function (arg) {
                    return Object.prototype.toString.call(arg) === "[object Array]";
                },
                //format string with curly braces as placeholders (ex.: ("Hello {0} {1}!", ["cruel", "world"]) => "Hello cruel world!")
                format: function (str, argsArray) {
                    var i;
                    if(Array.isArray(argsArray))
                        for(i = 0; i < argsArray.length; i += 1)
                            str = str.replace("{" + i + "}", argsArray[i].toString());
                    return str;
                },
                extendDeep: function(parent, child) {
                    var i;
                    child = child || {};
                    for (i in parent) {
                        if (parent.hasOwnProperty(i)) {
                            //do not create empty objects/arrays for nulls
                            if (parent[i] !== null && typeof parent[i] === "object") {
                                child[i] = child[i] || (Array.isArray(parent[i]) ? [] : {});
                                utils.extendDeep(parent[i], child[i]);
                            } else {
                                if(typeof child[i] === "undefined")//do not replace
                                    child[i] = parent[i];
                            }
                        }
                    }
                    return child;
                }
            };
        }());//utils module
        //DOM module
        utils.namespace(modules, "dom");
        modules.dom = (function() {
            var domApi;
            domApi = {
                addClass: function (el, className) {
                    if (el.classList)
                        el.classList.add(className);
                    else
                        el.className += " " + className;
                },
                removeClass: function (el, className) {
                    if (el.classList)
                        el.classList.remove(className);
                    else //from http://youmightnotneedjquery.com/
                        el.className = el.className.replace(new RegExp("(^|\\b)" + className.split(" ").join("|") + "(\\b|$)", "gi"), "");
                },
                siblings: function (el) {
                    Array.prototype.filter.call(el.parentNode.children, function(child){
                        return child && child.nodeType === 1 && child !== el;
                    });
                },
                matches: function(el, selector) {
                    return (el.matches || el.matchesSelector || el.msMatchesSelector || el.mozMatchesSelector || el.webkitMatchesSelector || el.oMatchesSelector).call(el, selector);
                },
                empty: function (el) {
                    while (el.firstChild)
                        el.removeChild(el.firstChild);
                },
                addStyleSheet: function (id) {
                    var style;
                    if(typeof id !== "string")
                        throw new Error("\"id\" must be cpecified");
                    //name will be used for HTML element "name" attribute -> need to adhere to W3C specs
                    if(!/^[a-zA-Z][\w:.-]*$/.test(id))
                        throw new Error("ID tokens must begin with a letter ([A-Za-z]) and may be followed by any number of letters, " +
                            "digits ([0-9]), hyphens (\"-\"), underscores (\"_\"), colons (\":\"), and periods (\".\")");
                    style = win.document.getElementById(id);
                    if(style)
                        return style.sheet;
                    style = document.createElement("style");
                    style.id = id;
                    // WebKit hack :(
                    style.appendChild(document.createTextNode(""));
                    win.document.head.appendChild(style);
                    return style.sheet;
                },
                addStyleSheetRule: function (stylesheetId, rule) {
                    var style = win.document.getElementById(stylesheetId);
                    if(!style || typeof style.sheet.insertRule !== "function")
                        return;
                    style.sheet.insertRule(rule,style.sheet.length);
                }
            };
            return domApi;
        }());//DOM module
        //ajax module
        utils.namespace(modules, "ajax");
        modules.ajax = (function() {
            var defaultRequestOptions = {
                method: null,
                headers: {},//request headers
                timeout: null,//in milliseconds - the request will be canceled when timeout exceeds
                data: null,//data to pass with the request
                errorHandler: null,//request error handling function
                progressHandler: null,//the function be called each time request.readyState changes its value
                timeoutHandler: null//the function to be called when timeout exceeds
            };

            //turn data's properties into html form encoded values, utilizing application/x-www-form-urlencoded format
            function encodeFormData(data) {
                //For application/x-www-form-urlencoded, spaces are to be replaced by '+',
                // so one may wish to follow a encodeURIComponent replacement with an additional replacement of "%20" with "+".
                var name,
                    pairs = [],
                    regexp = /%20/g;
                if (!data || typeof data !== "object")
                    return "";
                for (name in data)
                    if (data.hasOwnProperty(name) && typeof data[name] !== "undefined")
                    {
                        if(data[name] === null)
                            pairs.push(encodeURIComponent(name).replace(regexp, "+") + "=");
                        else if(data[name] instanceof Date)
                            pairs.push(encodeURIComponent(name).replace(regexp, "+") + "=" + encodeURIComponent(data[name].toISOString()).replace(regexp, "+"));
                        else
                            pairs.push(encodeURIComponent(name).replace(regexp, "+") + "=" + encodeURIComponent(data[name].toString()).replace(regexp, "+"));
                    }
                return pairs.join("&");
            }

            //send Ajax request
            function sendRequest(url, callback, options) {
                var request = new XMLHttpRequest(),
                    header,
                    encodedParams;
                if(typeof url !== "string" || typeof callback !== "function")
                    return;
                options = options || defaultRequestOptions;
                encodedParams = encodeFormData(options.data);
                //trim all parameters
                url = url.split("?")[0];
                if(options.method === "GET")
                {
                    //append search parameters
                    if (encodedParams.length > 0)
                        url += "?" + encodedParams;
                }
                //terminate request when timeout exceeds
                if(typeof options.timeout === "number")
                    setTimeout(function () {
                        request.abort();
                        if(typeof options.timeoutHandler === "function")
                            options.timeoutHandler(url);
                    }, options.timeout);

                request.open(options.method, url, true);
                if(typeof options.headers === "object")
                    for(header in options.headers)
                        if(options.headers.hasOwnProperty(header))
                            request.setRequestHeader(header, options.headers[header]);
                request.onreadystatechange = function() {
                    if(request.readyState === 4)
                    {
                        if (request.status === 200)
                            if(typeof callback === "function")
                                callback(getResponse(request));
                            else if (typeof options.errorHandler === "function")
                                options.errorHandler(request.status, request.statusText);
                    }
                    else if(typeof options.progressHandler === "function")
                        options.progressHandler(request.readyState);
                };
                if(options.method === "POST" || options.method === "PUT")
                {
                    request.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
                    request.send(encodedParams);
                }
                else
                    request.send(null);
            }

            //return appropriate response from Ajax request
            function getResponse(ajaxRequest) {
                switch (ajaxRequest.getResponseHeader("Content-Type"))
                {
                    case "text/xml":
                    case "application/xml":
                        return ajaxRequest.responseXML;
                        break;
                    case "text/json":
                    case "application/json":
                        return JSON.parse(ajaxRequest.responseText);
                        break;
                    default:
                        return ajaxRequest.responseText;
                        break;
                }
            }

            return {
                getText: function (url, callback, options) {
                    options = options || defaultRequestOptions;
                    options.method = "GET";
                    sendRequest(url, callback, options);//gets response as text by default
                },
                post: function (url, callback, options) {
                    options = options || defaultRequestOptions;
                    options.method = "POST";
                    sendRequest(url, callback, options);
                },
                put: function (url, callback, options) {
                    options = options || defaultRequestOptions;
                    options.method = "PUT";
                    sendRequest(url, callback, options);
                },
                delete: function (url, callback, options) {
                    options = options || defaultRequestOptions;
                    options.method = "DELETE";
                    sendRequest(url, callback, options);
                },
                getJSON: function (url, callback, options) {
                    options = options || defaultRequestOptions;
                    options.method = "GET";
                    if(typeof options.headers !== "object")
                        options.headers = {};
                    options.headers["Accept"] = "text/json, application/json";
                    sendRequest(url, callback, options);
                },
                getXML: function (url, callback, options) {
                    options = options || defaultRequestOptions;
                    options.method = "GET";
                    if(typeof options.headers !== "object")
                        options.headers = {};
                    options.headers["Accept"] = "text/xml, application/xml";
                    options.responseType = "xml";
                    sendRequest(url, callback, options);
                }
            };
        }());//ajax module
        //event module
        utils.namespace(modules, "event");
        modules.event = (function() {
            var eventUtils = {
                addListener: null,
                removeListener: null,
                delegate: null,
                stop: function (event) {
                    if(!event)
                        return;
                    event.preventDefault();
                    event.stopPropagation();
                }
            };
            // init-time branching
            if (typeof win.addEventListener === "function")
            {
                eventUtils.addListener = function (el, type, fn) {
                    if(el)
                        el.addEventListener(type, fn, false);
                };
                eventUtils.removeListener = function (el, type, fn) {
                    if(el)
                        el.removeEventListener(type, fn, false);
                };
                eventUtils.delegate = function (parentElement, childSelector, type, fn) {
                    if(!parentElement || typeof childSelector !== "string")
                        return;
                    parentElement.addEventListener(type, function (e) {
                        //requires revalidation in case of DOM changing
                        var children = parentElement.querySelectorAll(childSelector),
                            i, count = children.length;
                        for(i = 0; i < count; i += 1)
                            if(children[i] === e.target)
                                fn(e, i);
                    }, false);
                }
            }
            else if (typeof win.document.attachEvent === "function")
            { // IE
                eventUtils.addListener = function (el, type, fn) {
                    if(el)
                        el.attachEvent("on" + type, fn);
                };
                eventUtils.removeListener = function (el, type, fn) {
                    if(el)
                        el.detachEvent("on" + type, fn);
                };
                eventUtils.delegate = function (parentElement, childSelector, type, fn) {
                    if(!parentElement || typeof childSelector !== "string")
                        return;
                    parentElement.attachEvent("on" + type, function (e) {
                        //requires revalidation in case of DOM changing
                        var children = parentElement.querySelectorAll(childSelector),
                            i, count = children.length;
                        for(i = 0; i < count; i += 1)
                            if(children[i] === e.target)
                                fn(e, i);
                    });
                }
            }
            else throw new Error("The browser does not support both \"addEventListener\" and \"attachEvent\"");
            return eventUtils;
        }());//event module

        //instance constructor
        newJsGrid = function(userSettings) {
            var i,
                table = doc.getElementById(userSettings.tableId),
                domModule = modules.dom,
                eventModule = modules.event,
                ajaxModule = modules.ajax,
                collectionUrl,
                rows = [],// Array of Row items, currently displayed in the grid
                links = {},// Link items dictionary. Links to other resources related to the "items" collection.
                selectedRowIndex = -1,
                rowsPerPage = -1,
                pageNumber = -1,
                pagesCount = -1,
                subscribers = {},
                observer,
                validator,
                requestOptions = {
                    data: {},
                    headers: {}
                },
                //Object constructor for storing & manipulating table's row data
                Row = function(href) {
                    var _href = "",// String. A permanent link to the item as a standalone resource.
                        _cells = [],// Array of {name: "columnName", value: "cell data"} object literals.
                        _links = {},// Link items dictionary. Hypermedia links to other resources related to the item.
                        _childRows = [],// Array of child modules.data.Row items, for multilevel grid
                        _hiddenValues = {};//"Hidden" values, which will be submitted to server, but not displayed in the grid
                    if(!(this instanceof Row))
                        return new Row(href);
                    if(!href && typeof href !== "string")
                        throw new Error("parameter \"href\" should be a non zero length string");
                    _href = href;
                    //ability to iterate over added hidden values. Returned is {name: "hidden value name", value: "value"} object
                    this.getHiddenValuesIterator = function () {
                        return this.objectIterator(_hiddenValues);
                    };
                    //ability to iterate over added cells. Returned is {name: "cell name", value: "cell value"} object
                    this.getCellsIterator = function () {
                        return this.objectIterator(_cells);
                    };
                    //ability to iterate over added links. Returned is {name: "link name", value: link} object
                    this.getLinksIterator = function () {
                        return this.objectIterator(_links);
                    };
                    this.getHref = function () {
                        return _href;
                    };
                    //accepted values are: string, number, boolean, Date
                    this.addCell = function (name, value) {
                        if(this.validateCellData(name, value))
                            _cells.push({name: name, value: value});
                    };
                    this.getCell = function (name) {
                        var i,
                            count = _cells.length,
                            result = null;
                        name = typeof name === "string" ? name : "";
                        if(name)
                            for( i = 0; i < count; i += 1)
                                if(_cells[i].name === name)
                                    result = _cells[i].value;
                        return result;
                    };
                    this.setCell = function (name, value) {
                        var i, count = _cells.length;
                        if(this.validateCellData(name, value))
                            for( i = 0; i < count; i += 1)
                                if(_cells[i].name === name)
                                    _cells[i].value = value;
                    };
                    this.addLink = function (name, value) {
                        if(!name || typeof name !== "string")
                            throw new Error("parameter \"name\" should be a non zero length string");
                        if(!(value instanceof Link))
                            throw new Error("parameter \"value\" should be created with the help of \"createLink\" function");
                        _links[name] = value;
                    };
                    this.getLink = function (name) {
                        if(!name || typeof name !== "string")
                            throw new Error("parameter \"name\" should be a non zero length string");
                        return _links[name];
                    };
                    this.addHiddenValue = function (name, value) {
                        var i, count = userSettings.columnModel.length;
                        if(!name || typeof name !== "string")
                            throw new Error("parameter \"name\" should be a non zero length string");
                        if(!value || typeof value !== "string")
                            throw new Error("parameter \"value\" should be a non zero length string");
                        for (i = 0; i < count; i += 1)
                            if(userSettings.columnModel[i].name === name)
                                throw new Error("parameter \"name\" can not be the same as one of the columnModel column's name, since they will overlap during data submit process");
                        _hiddenValues[name] = value;
                    };
                    this.getHiddenValue = function (name) {
                        if(!name || typeof name !== "string")
                            throw new Error("parameter \"name\" should be a non zero length string");
                        return _hiddenValues[name];
                    };
                },
                //Object constructor for linking additional resources to table's data
                Link = function(href) {
                    var _href,//String. A permanent link to the item as a standalone resource.
                        _prompt,//String. Human-readable description
                        _rel,//String. Link relation
                        _render = this.renderTypes.link;//String. What html markup to generate for the link
                    if(!(this instanceof Link))
                        return new Link(href);
                    if(!href || typeof href !== "string")
                        throw new Error("parameter \"href\" should be a non zero length string");
                    _href = href;
                    this.getHref = function () {
                        return _href;
                    };
                    this.setPrompt = function (prompt) {
                        if(!prompt || typeof prompt !== "string")
                            throw new Error("parameter \"prompt\" should be a non zero length string");
                        _prompt = prompt;
                    };
                    this.setRel = function (rel) {
                        if(!rel || typeof rel !== "string")
                            throw new Error("parameter \"rel\" should be a non zero length string");
                        _rel = rel;
                    };
                    this.setRender = function (render) {
                        if(render !== this.renderTypes.link || render !== this.renderTypes.image)
                            throw new Error("parameter \"render\" should be either \"link\" or \"image\"");
                        _render = render;
                    };
                    this.renderHtml = function () {
                        var link;
                        switch (_render)
                        {
                            case this.renderTypes.link:
                                link = win.document.createElement("a");
                                break;
                            case this.renderTypes.image:
                                link = win.document.createElement("img");
                                break;
                            default :
                                link = win.document.createElement("a");
                                break;
                        }
                        link.setAttribute("href", _href);
                        if(_rel)
                            link.setAttribute("rel", _rel);
                        if(_render === this.renderTypes.link && _prompt)
                            link.appendChild(win.document.createTextNode(_prompt));
                        link.target = "_blank";
                        return link;
                    };
                };
            Row.prototype.validateCellData = function (name, value) {
                var columnType, valueType = typeof value;
                if(!name || typeof name !== "string")
                    throw new Error("column's \"name\" should be a non zero length string");
                columnType = (function (name) {
                    var i, count = userSettings.columnModel.length;
                    for (i = 0; i < count; i += 1)
                        if(userSettings.columnModel[i].name === name)
                            return userSettings.columnModel[i].type;
                    throw new Error("No column with a \"name\": \"" + name + "\" exists");
                }(name));
                //select
                if(Array.isArray(columnType))
                {
                    (function (options, val) {
                        var i, count = options.length, optionWithSuchValueExists = false;
                        for (i = 0; i < count; i += 1)
                            if(options[i].value && options[i].value === val)
                            {
                                optionWithSuchValueExists = true;
                                break;
                            }
                        if(!optionWithSuchValueExists)
                            throw new Error("Column: \"" + name + "\" has no predefined option for value: \"" + val +"\"");
                    }(columnType, value));
                }
                else
                {
                    if(typeof columnType !== "string")
                        throw new Error("Column's type should be either string or array of {value: \"\", text: \"\"} options for \"select\" type");
                    switch (columnType)
                    {
                        case dataTypes.int:
                            if(valueType !== "number")
                                throw new Error("Column \"" + name + "\" should contain number values only");
                            break;
                        case dataTypes.float:
                            if(valueType !== "number")
                                throw new Error("Column \"" + name + "\" should contain number values only");
                            break;
                        case dataTypes.bool:
                            if(valueType !== "boolean")
                                throw new Error("Column \"" + name + "\" should contain boolean values only");
                            break;
                        case dataTypes.date:
                            if(!(value instanceof Date))
                                throw new Error("Column \"" + name + "\" should contain Date values only");
                            break;
                        case dataTypes.string:
                            if(valueType !== "string")
                                throw new Error("Column \"" + name + "\" should contain string values only");
                            break;
                        case dataTypes.longString:
                            if(valueType !== "string")
                                throw new Error("Column \"" + name + "\" should contain string values only");
                            break;
                        default:
                            throw new Error("Only \"string\", \"number\", \"boolean\", or \"Date\" column values are supported");
                            break;
                    }
                }
                return true;
            };
            Row.prototype.objectIterator = function (obj) {
                var keys = Object.keys(obj),
                    index = 0,
                    length = keys.length;

                return {
                    next: function() {
                        var element;
                        if (!this.hasNext())
                            return null;
                        element = obj[keys[index]];
                        index += 1;
                        return {name: keys[index], value: element};
                    },
                    hasNext: function() {
                        return index < length;
                    },
                    reset: function() {
                        var element;
                        index = 0;
                        element = obj[keys[index]];
                        return {name: keys[index], value: element};
                    },
                    current: function() {
                        return {name: keys[index], value: obj[keys[index]]};
                    }
                }
            };
            Link.prototype.renderTypes = {
                link: "link",
                image: "image"
            };

            if(!(this instanceof newJsGrid))
                return new JsGrid(userSettings);

            //plugin's specific logic
            function setupSettings(settings) {
                var i,
                    columnsCount,
                    modelColumn,
                    defaultModelColumn = defaultSettings.columnModel[0];
                //populate userSettings with missing values
                settings.locale = (function(){
                    //check if userSettings.locale is valid. Set default otherwise
                    try {
                        (new Date()).toLocaleString(userSettings.locale);
                    }
                    catch (ex) {
                        return navigator.language || navigator.browserLanguage;
                    }
                    return userSettings.locale;
                }());
                utils.extendDeep(defaultSettings, settings);
                settings.columnModel = Array.isArray(settings.columnModel) ? settings.columnModel : [];
                columnsCount = userSettings.columnModel.length;
                for(i = 0; i < columnsCount; i += 1)
                {
                    modelColumn = settings.columnModel[i];
                    if(typeof modelColumn.name !== "string")
                        throw new Error("Each column object should have unique \"name\" property specified");
                    //name will be used for HTML element "name" attribute -> need to adhere to W3C specs
                    if(!/^[a-zA-Z][\w:.-]*$/.test(modelColumn.name))
                        throw new Error("NAME tokens must begin with a letter ([A-Za-z]) and may be followed by any number of letters, " +
                            "digits ([0-9]), hyphens (\"-\"), underscores (\"_\"), colons (\":\"), and periods (\".\")");
                    modelColumn = utils.extendDeep(defaultModelColumn, modelColumn);
                }
            }
            function buildTable () {
                var docFragment = doc.createDocumentFragment(),
                    tableWidth = 0,
                    caption,
                    modelColumn,
                //colgroup
                    colgroup = doc.createElement("colgroup"),
                    col,
                //header elements
                    thRow = doc.createElement("tr"),
                    thead = doc.createElement("thead"),
                    th,
                    resizeDiv,
                    sortEl,
                //footer elements
                    footersExist = false,//if not a single footer present, do not add footer row
                    tfoot = doc.createElement("tfoot"),
                    tfRow = doc.createElement("tr"),
                    tfTd,
                //body
                    tbody = doc.createElement("tbody"),
                //actions & pager row
                    navigator = doc.createElement("td"),
                //actions
                    actions,
                    actionsContainer = doc.createElement("span"),
                    addAction = doc.createElement("a"),
                    deleteAction = doc.createElement("a"),
                    editAction = doc.createElement("a"),
                    searchAction = doc.createElement("a"),
                    linkAction = doc.createElement("a"),
                    reloadAction = doc.createElement("a"),
                //pager
                    itemsCount,
                    rowsPerPage,
                    pageLabel = doc.createElement("span"),
                    ofTotalLabel = doc.createElement("span"),
                    firstPage = doc.createElement("a"),
                    lastPage = doc.createElement("a"),
                    prevPage = doc.createElement("a"),
                    nextPage = doc.createElement("a"),
                    pageSelector = doc.createElement("select"),
                    pageSelectorOption,
                    rowsPerPageSelector = doc.createElement("select"),
                    rowsPerPageSelectorOption,
                //counter
                    i;
                //caption
                if(userSettings.caption)
                {
                    caption = doc.createElement("caption");
                    caption.appendChild(doc.createTextNode(userSettings.caption.toString()));
                    docFragment.appendChild(caption);
                }
                //colgroup, header & footer
                if(Array.isArray(userSettings.columnModel))
                {
                    for (i = 0; i < userSettings.columnModel.length; i += 1)
                    {
                        modelColumn = userSettings.columnModel[i];
                        //colgroup
                        col = doc.createElement("col");
                        col.style.width = (modelColumn.width > modelColumn.minWidth ?
                                modelColumn.width : modelColumn.minWidth) + "px";
                        tableWidth += modelColumn.width;
                        colgroup.appendChild(col);
                        //header
                        th = doc.createElement("th");
                        sortEl = doc.createElement("span");
                        if(modelColumn.label)
                            sortEl.appendChild(doc.createTextNode(modelColumn.label));
                        th.appendChild(sortEl);
                        if(modelColumn.resizable)
                        {
                            resizeDiv = doc.createElement("div");
                            resizeDiv.className = constants.styles.resizeEl;
                            resizeDiv.innerHTML = "&nbsp";//to make div visible
                            th.appendChild(resizeDiv);
                        }
                        thRow.appendChild(th);
                        //footer
                        tfTd = doc.createElement("td");
                        if(modelColumn.footer.formatString || modelColumn.footer.aggregationMethod)
                            footersExist = true;
                        tfRow.appendChild(tfTd);
                    }
                    thead.appendChild(thRow);
                    if(footersExist)
                    {
                        tfoot.appendChild(tfRow);
                        setupFooter();
                    }
                    docFragment.appendChild(colgroup);
                    docFragment.appendChild(thead);
                    docFragment.appendChild(tfoot);
                    docFragment.appendChild(tbody);
                    //exact size required for column resizing to work
                    //see https://css-tricks.com/fixing-tables-long-strings/ for details
                    table.style.width = tableWidth + "px";
                }
                //navigator
                if(userSettings.navigator)
                {
                    navigator.setAttribute("colspan", userSettings.columnModel.length.toString());
                    navigator.className = constants.styles.navigator;
                    actions = userSettings.navigator.actions;
                    //actions
                    if(userSettings.navigator.displayActions)
                    {
                        actionsContainer.style.float = "left";
                        actionsContainer.className = constants.styles.actionsContainer;
                        if(actions.addAction)
                        {
                            addAction.href = "#";
                            addAction.title = userSettings.resources.addActionTitle;
                            addAction.className = constants.styles.addAction;
                            addAction.appendChild(doc.createTextNode(constants.strings.addActionText));
                            actionsContainer.appendChild(addAction);
                        }
                        if(actions.deleteAction)
                        {
                            deleteAction.href = "#";
                            deleteAction.title = userSettings.resources.deleteActionTitle;
                            deleteAction.className = constants.styles.deleteAction;
                            deleteAction.appendChild(doc.createTextNode(constants.strings.deleteActionText));
                            actionsContainer.appendChild(deleteAction);
                        }
                        if(actions.editAction)
                        {
                            editAction.href = "#";
                            editAction.title = userSettings.resources.editActionTitle;
                            editAction.className = constants.styles.editAction;
                            editAction.appendChild(doc.createTextNode(constants.strings.editActionText));
                            actionsContainer.appendChild(editAction);
                        }
                        if(actions.searchAction && userSettings.searchTemplate.length > 0)
                        {
                            searchAction.href = "#";
                            searchAction.title = userSettings.resources.searchActionTitle;
                            searchAction.className = constants.styles.searchAction;
                            searchAction.appendChild(doc.createTextNode(constants.strings.searchActionText + " " + userSettings.resources.noFiltersAppliedLabel));
                            actionsContainer.appendChild(searchAction);
                        }
                        if(actions.linkAction)
                        {
                            linkAction.href = "#";
                            linkAction.title = userSettings.resources.linkActionTitle;
                            linkAction.className = constants.styles.linkAction;
                            linkAction.appendChild(doc.createTextNode(constants.strings.linkActionText));
                            actionsContainer.appendChild(linkAction);
                        }
                        if(actions.reloadAction)
                        {
                            reloadAction.href = "#";
                            reloadAction.title = userSettings.resources.reloadActionTitle;
                            reloadAction.className = constants.styles.reloadAction;
                            reloadAction.appendChild(doc.createTextNode(constants.strings.reloadActionText));
                            actionsContainer.appendChild(reloadAction);
                        }
                        navigator.appendChild(actionsContainer);
                    }
                    if(userSettings.navigator.displayPager)
                    {
                        itemsCount = userSettings.navigator.pager.itemsCount;
                        rowsPerPage = userSettings.navigator.pager.rowsPerPage;
                        pagesCount = Math.ceil(itemsCount/rowsPerPage[0]);
                        //pager
                        firstPage.href = "#";
                        firstPage.className = constants.styles.firstPageLink;
                        firstPage.title = userSettings.resources.firstPageActionTitle;
                        firstPage.appendChild(doc.createTextNode(constants.strings.firstPageActionText));
                        navigator.appendChild(firstPage);
                        prevPage.href = "#";
                        prevPage.className = constants.styles.prevPageLink;
                        prevPage.title = userSettings.resources.previousPageActionTitle;
                        prevPage.appendChild(doc.createTextNode(constants.strings.previousPageActionText));
                        navigator.appendChild(prevPage);
                        if(typeof itemsCount === "number" && itemsCount > 1)
                        {
                            pageLabel.className = constants.styles.pageLabel;
                            pageLabel.appendChild(doc.createTextNode(" | " + userSettings.resources.pageLabel + " "));
                            navigator.appendChild(pageLabel);
                            pageSelector.className = constants.styles.pageSelector;
                            navigator.appendChild(pageSelector);
                            for (i = 1; i <= pagesCount; i += 1) {
                                pageSelectorOption = doc.createElement("option");
                                pageSelectorOption.appendChild(doc.createTextNode(i.toString()));
                                pageSelectorOption.value = i.toString();
                                pageSelector.appendChild(pageSelectorOption);
                            }
                            ofTotalLabel.className = constants.styles.ofTotalLabel;
                            ofTotalLabel.appendChild(doc.createTextNode(" " + userSettings.resources.ofLabel + " " + pagesCount + " | "));
                            navigator.appendChild(ofTotalLabel);
                            //rows per page selector is only meaningful if we already know items' count and therefore pages' count
                            if(Array.isArray(rowsPerPage))
                            {
                                rowsPerPageSelector.className = constants.styles.rowsPerPageSelector;
                                navigator.appendChild(rowsPerPageSelector);
                                for (i = 0; i < rowsPerPage.length; i += 1) {
                                    rowsPerPageSelectorOption = doc.createElement("option");
                                    rowsPerPageSelectorOption.appendChild(doc.createTextNode(rowsPerPage[i].toString()));
                                    rowsPerPageSelectorOption.value = rowsPerPage[i].toString();
                                    rowsPerPageSelector.appendChild(rowsPerPageSelectorOption);

                                }
                            }
                        }
                        nextPage.href = "#";
                        nextPage.className = constants.styles.nextPageLink;
                        nextPage.title = userSettings.resources.nextPageActionTitle;
                        nextPage.appendChild(doc.createTextNode(constants.strings.nextPageActionText));
                        navigator.appendChild(nextPage);
                        lastPage.href = "#";
                        lastPage.className = constants.styles.lastPageLink;
                        lastPage.title = userSettings.resources.lastPageActionTitle;
                        lastPage.appendChild(doc.createTextNode(constants.strings.lastPageActionText));
                        navigator.appendChild(lastPage);
                    }
                    tfoot.appendChild(doc.createElement("tr"));
                    tfoot.lastChild.appendChild(navigator);
                }

                //required for column resizing to work
                domModule.addStyleSheet(constants.styles.styleSheet);

                domModule.addStyleSheetRule(constants.styles.styleSheet,"#" + userSettings.tableId +" { table-layout: fixed; }");
                domModule.addStyleSheetRule(constants.styles.styleSheet,"#" + userSettings.tableId +" th { overflow: hidden; white-space: nowrap; text-overflow: ellipsis; position: relative; border: 0px; }");
                domModule.addStyleSheetRule(constants.styles.styleSheet,"#" + userSettings.tableId +" td { overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }");
                //required for resize pointers to be displayed correctly
                domModule.addStyleSheetRule(constants.styles.styleSheet,"." + constants.styles.resizeEl + "{ cursor: col-resize; float: right; position: absolute; top: 0; right: 0; bottom: 0; border-right: 1px solid black; }");
                //pager
                domModule.addStyleSheetRule(constants.styles.styleSheet ,"#" + userSettings.tableId + " tfoot a { margin: 0 5px 0 5px; text-decoration: none; }");
                domModule.addStyleSheetRule(constants.styles.styleSheet ,"#" + userSettings.tableId + " tfoot td { text-align: center; }");

                domModule.empty(table);
                table.appendChild(docFragment);
            }
            function applyFormatting (value, formatType, locale) {
                var result;
                formatType = formatType || dataTypes.string;
                locale = locale || navigator.language || navigator.browserLanguage;
                if(Array.isArray(formatType))//select
                {
                    (function (val, options) {
                        var i, count = options.length;
                        for(i = 0; i < count; i += 1)
                            if(options[i].value === val)
                            {
                                result = doc.createTextNode(options[i].text);
                                break;
                            }
                    }(value, formatType));
                }
                else
                {
                    switch (formatType)
                    {
                        case dataTypes.int:
                            result = parseInt(value, 10);
                            if(isNaN(result))
                                result = doc.createTextNode("");
                            else
                                result = doc.createTextNode(result.toLocaleString(locale));
                            break;
                        case dataTypes.float:
                            result = parseFloat(value);
                            if(isNaN(result))
                                result = doc.createTextNode("");
                            else
                                result = doc.createTextNode(result.toLocaleString(locale));
                            break;
                        case dataTypes.date:
                            result = value instanceof Date ?
                                doc.createTextNode(value.toLocaleDateString(locale)) : doc.createTextNode("");
                            break;
                        case dataTypes.bool:
                            result = doc.createElement("input");
                            result.setAttribute("type", "checkbox");
                            result.setAttribute("disabled", "");
                            if(!!value)
                                result.setAttribute("checked", "checked");
                            break;
                        default://string
                            result = doc.createTextNode(value.toLocaleString(locale));
                            break;
                    }
                }
                return result;
            }
            function setupResizableColumns () {
                var thead = doc.querySelector("#" + userSettings.tableId +" thead");
                eventModule.delegate(thead, "div." + constants.styles.resizeEl, "mousedown", function (e, childIndex) {
                    var mouseDownX = e.clientX,
                        columns = doc.querySelectorAll("#" + userSettings.tableId +" col"),
                        column = columns[childIndex],
                        oldWidth = (function () {
                            var width;
                            if(!column)
                                throw new Error("No column with such index exists");
                            width = parseInt(column.style.minWidth, 10);
                            if(isNaN(width))
                                width = parseInt(getComputedStyle(column).width);
                            return width;
                        }()),
                        modelColumn = userSettings.columnModel[childIndex],
                        mouseMove = function (e) {
                            var newWidth = oldWidth - (mouseDownX - e.clientX),
                                maxWidth = modelColumn.maxWidth,
                                minWidth  = modelColumn.minWidth,
                                tableWidth = 0,
                                i,
                                count = columns.length;
                            //check min/max width constraints
                            if((maxWidth && maxWidth < newWidth) || (minWidth && minWidth > newWidth))
                                return;
                            for(i = 0; i < count; i += 1)
                                tableWidth += parseInt(columns[i].style.width, 10);
                            table.style.width = tableWidth + (newWidth - parseInt(column.style.width, 10)) + "px";
                            column.style.width = newWidth + "px";
                            eventModule.stop(e);
                        },
                        mouseUp = function (e) {
                            eventModule.removeListener(doc, "mousemove", mouseMove);
                            eventModule.removeListener(doc, "mouseup", mouseUp);
                            eventModule.removeListener(doc,"mouseout", mouseOut);
                            eventModule.stop(e);
                        },
                        mouseOut = function (e) {
                            var from = e.relatedTarget || e.toElement;
                            if (!from || from.nodeName == "HTML")
                                mouseUp(e);
                        };
                    eventModule.addListener(doc, "mousemove", mouseMove);
                    eventModule.addListener(doc, "mouseup", mouseUp);
                    //cancel resizing when leaving browser window
                    eventModule.addListener(doc,"mouseout", mouseOut);
                    modules.event.stop(e);
                });
            }
            function setupDraggableColumns () {
                var thead = doc.querySelector("#" + userSettings.tableId + " thead");
                eventModule.delegate(thead, "th", "mousedown", function (e, index) {
                    var th = e.target,
                        siblingsOffset = 0,
                        prevStepOffset = 0,//tracks drag direction
                        nextTh = (function (node) {
                            var result = node.nextSibling;
                            while(result && result.nodeType !== 1 && result.nodeName !== "TH")
                                result = result.nextSibling;
                            return result;
                        }(th)),
                        prevTh = (function (node) {
                            var result = node.previousSibling;
                            while(result && result.nodeType !== 1 && result.nodeName !== "TH")
                                result = result.previousSibling;
                            return result;
                        }(th)),
                        newIndex = index,
                        mouseDownX = e.clientX,
                        mouseMove = function (e) {
                            var offset = mouseDownX - e.clientX,
                                nextThWidth,
                                nextThRight,
                                prevThWidth,
                                prevThRight;
                            th.style.right = offset + "px";
                            //drag right
                            if(offset < prevStepOffset && nextTh)
                            {
                                nextThWidth = nextTh.offsetWidth;
                                nextThRight = parseInt(nextTh.style.right);
                                //dragging right according to initial column position
                                if(offset < 0 && Math.abs(offset) > siblingsOffset + nextThWidth)
                                {
                                    nextTh.style.right = (isNaN(nextThRight) ? 0 : nextThRight) + th.offsetWidth + "px";
                                    siblingsOffset += nextThWidth;
                                    prevTh = nextTh;
                                    nextTh = (function (node) {
                                        var result = node.nextSibling;
                                        if(result === th)
                                            result = result.nextSibling;
                                        while(result && result.nodeType !== 1 && result.nodeName !== "TH")
                                            result = result.nextSibling;
                                        return result;
                                    }(nextTh));
                                    newIndex += 1;
                                }
                                //dragging right after dragging left,
                                //when according to initial position it is still dragging left
                                else if(offset > 0 && offset < Math.abs(siblingsOffset) - nextThWidth)
                                {
                                    nextTh.style.right = "0px";
                                    siblingsOffset += nextThWidth;
                                    prevTh = nextTh;
                                    nextTh = (function (node) {
                                        var result = node.nextSibling;
                                        if(result === th)
                                            result = result.nextSibling;
                                        while(result && result.nodeType !== 1 && result.nodeName !== "TH")
                                            result = result.nextSibling;
                                        return result;
                                    }(nextTh));
                                    newIndex += 1;
                                }
                            }
                            //drag left
                            else if(offset > prevStepOffset && prevTh)
                            {
                                prevThWidth = prevTh.offsetWidth;
                                prevThRight = parseInt(prevTh.style.right);
                                //dragging left according to initial column position
                                if(offset > 0 && offset > Math.abs(siblingsOffset - prevThWidth))
                                {
                                    prevTh.style.right = (isNaN(prevThRight) ? 0 : prevThRight) - th.offsetWidth + "px";
                                    siblingsOffset -= prevThWidth;
                                    nextTh = prevTh;
                                    prevTh = (function (node) {
                                        var result = node.previousSibling;
                                        if(result === th)
                                            result = result.previousSibling;
                                        while(result && result.nodeType !== 1 && result.nodeName !== "TH")
                                            result = result.previousSibling;
                                        return result;
                                    }(prevTh));
                                    newIndex -= 1;
                                }
                                //dragging left after dragging right,
                                //when according to initial position it is still dragging right
                                else if(offset < 0 && Math.abs(offset) < siblingsOffset - prevThWidth)
                                {
                                    prevTh.style.right = "0px";
                                    siblingsOffset -= prevTh.offsetWidth;
                                    nextTh = prevTh;
                                    prevTh = (function (node) {
                                        var result = node.previousSibling;
                                        if(result === th)
                                            result = result.previousSibling;
                                        while(result && result.nodeType !== 1 && result.nodeName !== "TH")
                                            result = result.previousSibling;
                                        return result;
                                    }(prevTh));
                                    newIndex -= 1;
                                }
                            }
                            prevStepOffset = offset;
                            eventModule.stop(e);
                        },
                        mouseUp = function (e) {
                            var ths = doc.querySelectorAll("#" + userSettings.tableId + " th"),
                                i,
                                count = ths.length;
                            domModule.removeClass(th, constants.styles.dragStart);
                            for(i = 0; i < count; i += 1)
                                ths[i].style.right = "0px";
                            //swap model columns
                            if(index !== newIndex)
                            {
                                userSettings.columnModel.splice(newIndex, 0, userSettings.columnModel.splice(index, 1)[0]);
                                //swap columns
                                reorderTableColumns(table, index, newIndex);
                            }
                            //remove listeners
                            eventModule.removeListener(doc, "mousemove", mouseMove);
                            eventModule.removeListener(doc, "mouseup", mouseUp);
                            eventModule.removeListener(doc,"mouseout", mouseOut);
                            eventModule.stop(e);
                        },
                        mouseOut = function (e) {
                            var from = e.relatedTarget || e.toElement;
                            if (!from || from.nodeName == "HTML")
                                mouseUp(e);
                        };
                    domModule.addClass(th, constants.styles.dragStart);
                    eventModule.addListener(doc, "mousemove", mouseMove);
                    eventModule.addListener(doc, "mouseup", mouseUp);
                    //cancel dragging when leaving browser window
                    eventModule.addListener(doc,"mouseout", mouseOut);
                    modules.event.stop(e);
                });
            }
            function setupSortableColumns () {
                var thead = doc.querySelector("#" + userSettings.tableId + " thead"),
                    tbody = table.querySelector("tbody"),
                    sortedColumnIndex = -1,
                    ascendingOrder = true;
                eventModule.delegate(thead, "th > span", "click", function (e, index) {
                    var docFragment = doc.createDocumentFragment(),
                        sortIndicator = table.querySelector("." + constants.styles.sortIndicator),
                        i,
                        count = rows.length;
                    rows.sort(function (a, b) {
                        var name = userSettings.columnModel[index].name,
                            aValue = a.getCell(name),
                            bValue = b.getCell(name);
                        if(aValue < bValue)
                            return -1;
                        else if(aValue > bValue)
                            return 1;
                        else return 0;
                    });
                    //reset order for new column
                    if(sortedColumnIndex !== index)
                        ascendingOrder = true;
                    sortedColumnIndex = index;
                    //remove old
                    if(sortIndicator)
                        sortIndicator.remove();
                    //sort
                    if(ascendingOrder)
                    {
                        ascendingOrder = false;
                        sortIndicator = doc.createElement("span");
                        sortIndicator.className = constants.styles.sortIndicator;
                        sortIndicator.appendChild(doc.createTextNode(" " + constants.strings.descendingOrderIndicator));
                        e.target.appendChild(sortIndicator);
                    }
                    else
                    {
                        ascendingOrder = true;
                        rows.reverse();
                        sortIndicator = doc.createElement("span");
                        sortIndicator.className = constants.styles.sortIndicator;
                        sortIndicator.appendChild(doc.createTextNode(" " + constants.strings.ascendingOrderIndicator));
                        e.target.appendChild(sortIndicator);
                    }
                    for(i = 0; i < count; i += 1)
                        docFragment.appendChild(createTrElement(rows[i]));
                    domModule.empty(tbody);
                    tbody.appendChild(docFragment);
                    //reset selected rows
                    if(selectedRowIndex !== -1)
                    {
                        selectedRowIndex = -1;
                        observer.publish(eventTypes.rowSelected,[selectedRowIndex]);
                    }
                });
            }
            function setupSelectableRows () {
                eventModule.delegate(table, "tbody td", "click", function (e, index) {
                    var selectedRow = table.querySelector("." + constants.styles.selectedRow),
                        targetRow = e.target.parentNode;
                    if(selectedRow)
                        domModule.removeClass(selectedRow, constants.styles.selectedRow);
                    if(selectedRow === targetRow)
                    {
                        selectedRowIndex = -1;
                        observer.publish(eventTypes.rowSelected,[selectedRowIndex]);
                        return;
                    }
                    selectedRowIndex = Math.floor(index / userSettings.columnModel.length);
                    domModule.addClass(targetRow, constants.styles.selectedRow);
                    observer.publish(eventTypes.rowSelected,[selectedRowIndex]);
                });
            }
            function setupFooter() {
                observer.subscribe(function () {
                    var i, count = userSettings.columnModel.length,
                        modelColumn,
                        tfTd,
                        res;
                    for(i = 0; i < count; i += 1)
                    {
                        modelColumn = userSettings.columnModel[i];
                        tfTd = table.querySelector("tfoot td:nth-child(" + (i + 1) + ")");
                        domModule.empty(tfTd);
                        if(modelColumn.footer.aggregationMethod && (modelColumn.type === dataTypes.int || modelColumn.type === dataTypes.float))
                        {
                            res = aggregate(modelColumn.name, modelColumn.footer.aggregationMethod.toLowerCase());
                            if(modelColumn.footer.formatString)
                                tfTd.appendChild(doc.createTextNode(utils.format(modelColumn.footer.formatString, [res])));
                            else
                                tfTd.appendChild(doc.createTextNode(res));
                        }
                        else if(modelColumn.footer.formatString)
                            tfTd.appendChild(doc.createTextNode(modelColumn.footer.formatString));

                    }
                }, eventTypes.dataLoadFinished);
            }
            function aggregate(columnName, method) {
                var result = 0, i, count = rows.length;
                switch (method)
                {
                    case defaultSettings.columnModel.aggregationMethods.avg:
                        for(i = 0; i < count; i += 1)
                            result += rows[i].getCell(columnName);
                        result /= count;
                        break;
                    case defaultSettings.columnModel.aggregationMethods.max:
                        if(count > 0)
                            result = rows[0].getCell(columnName);
                        for(i = 0; i < count; i += 1)
                            if(rows[i].getCell(columnName) > result)
                                result = rows[i].getCell(columnName);
                        break;
                    case defaultSettings.columnModel.aggregationMethods.min:
                        if(count > 0)
                            result = rows[0].getCell(columnName);
                        for(i = 0; i < count; i += 1)
                            if(rows[i].getCell(columnName) < result)
                                result = rows[i].getCell(columnName);
                        break;
                    case defaultSettings.columnModel.aggregationMethods.sum:
                        for(i = 0; i < count; i += 1)
                            result += rows[i].getCell(columnName);
                        break;
                    default:
                        throw new Error("Aggregation method was not recognized");
                        break;
                }
                return result;
            }
            function createTrElement (row) {
                var i,
                    colModel = userSettings.columnModel,
                    count = userSettings.columnModel.length,
                    name,
                    tr = doc.createElement("tr"),
                    td,
                    cellData;
                for(i = 0; i < count; i += 1)
                {
                    name = colModel[i].name;
                    if(!name)
                        throw new Error("No column name have been specified for one of the columns in \"columnModel\" settings");
                    cellData = applyFormatting(row.getCell(name), colModel[i].type, userSettings.locale);
                    td = doc.createElement("td");
                    if(colModel[i].type === dataTypes.longString)
                        td.className = constants.styles.longString;
                    td.appendChild(cellData);
                    tr.appendChild(td);
                }
                return tr;
            }
            function reorderTableColumns (tableEl, oldPosition, newPosition) {
                if(!(tableEl instanceof Element)
                    || tableEl.nodeName !== "TABLE"
                    || typeof  oldPosition !== "number"
                    || typeof  newPosition !== "number"
                    || oldPosition === newPosition)
                    return;
                var cols = tableEl.querySelectorAll("colgroup col"),
                    rows = tableEl.querySelectorAll("tr"),
                    cells,
                    i,
                    count = rows.length,
                    firstEl,
                    secondEl;
                if(cols.length > 0)
                {
                    firstEl = cols[oldPosition];
                    secondEl = cols[newPosition];
                    if(firstEl && secondEl)
                    {
                        if(newPosition > oldPosition)
                            firstEl.parentNode.insertBefore(firstEl, secondEl.nextSibling);
                        else
                            firstEl.parentNode.insertBefore(firstEl, secondEl);
                    }
                }
                for(i = 0; i < count; i += 1)
                {
                    cells = rows[i].querySelectorAll("td");
                    if(cells.length === 0)
                        cells = rows[i].querySelectorAll("th");
                    firstEl = cells[oldPosition];
                    secondEl = cells[newPosition];
                    if(firstEl && secondEl)
                    {
                        if(newPosition > oldPosition)
                            firstEl.parentNode.insertBefore(firstEl, secondEl.nextSibling);
                        else
                            firstEl.parentNode.insertBefore(firstEl, secondEl);
                    }
                }
            }
            function setupAddAction () {
                var addAction = table.querySelector("." + constants.styles.addAction);
                if(!addAction)
                    return;
                eventModule.addListener(addAction, "click", function (e) {
                    eventModule.stop(e);
                    if(domModule.matches(e.target, "." + constants.styles.disabled))
                        return;
                    setupDataEditModalTemplate();
                });
            }
            function setupDeleteAction () {
                var deleteAction = table.querySelector("." + constants.styles.deleteAction);
                if(!deleteAction)
                    return;
                domModule.addClass(deleteAction, constants.styles.disabled);
                observer.subscribe(function (rowIndex) {
                    if(rowIndex === -1)
                        domModule.addClass(deleteAction, constants.styles.disabled);
                    else
                        domModule.removeClass(deleteAction, constants.styles.disabled);
                }, eventTypes.rowSelected);
                eventModule.addListener(deleteAction, "click", function (e) {
                    eventModule.stop(e);
                    if(domModule.matches(e.target, "." + constants.styles.disabled))
                        return;
                    setupDeleteDataModalTemplate();
                });
            }
            function setupEditAction () {
                var editAction = table.querySelector("." + constants.styles.editAction);
                if(!editAction)
                    return;
                domModule.addClass(editAction, constants.styles.disabled);
                observer.subscribe(function (rowIndex) {
                    if(rowIndex === -1)
                        domModule.addClass(editAction, constants.styles.disabled);
                    else
                        domModule.removeClass(editAction, constants.styles.disabled);
                }, eventTypes.rowSelected);
                eventModule.addListener(editAction, "click", function (e) {
                    eventModule.stop(e);
                    if(domModule.matches(e.target, "." + constants.styles.disabled))
                        return;
                    setupDataEditModalTemplate(rows[selectedRowIndex]);
                });
            }
            function setupSearchAction () {
                var searchAction = table.querySelector("." + constants.styles.searchAction);
                if(!searchAction)
                    return;
                eventModule.addListener(searchAction, "click", function (e) {
                    eventModule.stop(e);
                    if(domModule.matches(e.target, "." + constants.styles.disabled))
                        return;
                    setupDataSearchModalTemplate();
                });
                observer.subscribe(function () {
                    domModule.empty(searchAction);
                    searchAction.appendChild(doc.createTextNode(constants.strings.searchActionText + " " + userSettings.resources.filtersAppliedLabel));
                }, eventTypes.searchFiltersApplied);
                observer.subscribe(function () {
                    domModule.empty(searchAction);
                    searchAction.appendChild(doc.createTextNode(constants.strings.searchActionText + " " + userSettings.resources.noFiltersAppliedLabel));
                }, eventTypes.searchFiltersRemoved);
            }
            function setupLinkAction () {
                var linkAction = table.querySelector("." + constants.styles.linkAction);
                if(!linkAction)
                    return;
                domModule.addClass(linkAction, constants.styles.disabled);
                observer.subscribe(function (rowIndex) {
                    if(rowIndex === -1 || !rows[rowIndex].getLinksIterator().hasNext())
                        domModule.addClass(linkAction, constants.styles.disabled);
                    else
                        domModule.removeClass(linkAction, constants.styles.disabled);
                }, eventTypes.rowSelected);
                eventModule.addListener(linkAction, "click", function (e) {
                    eventModule.stop(e);
                    if(domModule.matches(e.target, "." + constants.styles.disabled))
                        return;
                    setupLinksModalTemplate(rows[selectedRowIndex]);
                });
            }
            function setupReloadAction () {
                var reloadAction = table.querySelector("." + constants.styles.reloadAction);
                if(!reloadAction)
                    return;
                eventModule.addListener(reloadAction, "click", function (e) {
                    eventModule.stop(e);
                    if(domModule.matches(e.target, "." + constants.styles.disabled))
                        return;
                    //reset selected rows
                    if(selectedRowIndex !== -1)
                    {
                        selectedRowIndex = -1;
                        observer.publish(eventTypes.rowSelected,[selectedRowIndex]);
                    }
                    getCollection(getCollection.triggers.dataLoad);
                });
            }
            function setupPagerControls () {
                var firstPageLink = table.querySelector("." + constants.styles.firstPageLink),
                    prevPageLink = table.querySelector("." + constants.styles.prevPageLink),
                    nextPageLink = table.querySelector("." + constants.styles.nextPageLink),
                    lastPageLink = table.querySelector("." + constants.styles.lastPageLink),
                    pageNumberSelector = table.querySelector("." + constants.styles.pageSelector),
                    rowsPerPageSelector = table.querySelector("." + constants.styles.rowsPerPageSelector),
                    pageSelector = table.querySelector("." + constants.styles.pageSelector),
                    ofTotalLabel = table.querySelector("." + constants.styles.ofTotalLabel),
                    pageSelectorOption;
                if(pageNumberSelector)
                {
                    pagesCount = parseInt(pageNumberSelector.options[pageNumberSelector.options.length - 1].value, 10);
                    pageNumber = 1;
                    domModule.addClass(firstPageLink, constants.styles.disabled);
                    domModule.addClass(prevPageLink, constants.styles.disabled);
                    eventModule.addListener(pageNumberSelector,"change", function (e) {
                        pageNumber = parseInt(e.target.options[e.target.selectedIndex].value, 10);
                        if(pageNumber === 1)
                        {
                            domModule.addClass(firstPageLink, constants.styles.disabled);
                            domModule.addClass(prevPageLink, constants.styles.disabled);
                            domModule.removeClass(nextPageLink, constants.styles.disabled);
                            domModule.removeClass(lastPageLink, constants.styles.disabled);
                        }
                        else if(pageNumber === pagesCount)
                        {
                            domModule.removeClass(firstPageLink, constants.styles.disabled);
                            domModule.removeClass(prevPageLink, constants.styles.disabled);
                            domModule.addClass(nextPageLink, constants.styles.disabled);
                            domModule.addClass(lastPageLink, constants.styles.disabled);
                        }
                        else
                        {
                            domModule.removeClass(firstPageLink, constants.styles.disabled);
                            domModule.removeClass(prevPageLink, constants.styles.disabled);
                            domModule.removeClass(nextPageLink, constants.styles.disabled);
                            domModule.removeClass(lastPageLink, constants.styles.disabled);
                        }
                        //reset selected rows
                        if(selectedRowIndex !== -1)
                        {
                            selectedRowIndex = -1;
                            observer.publish(eventTypes.rowSelected,[selectedRowIndex]);
                        }
                        getCollection(getCollection.triggers.page);
                    });
                }
                if(firstPageLink)
                {
                    eventModule.addListener(firstPageLink, "click", function (e) {
                        eventModule.stop(e);
                        if(domModule.matches(firstPageLink, "." + constants.styles.disabled))
                            return;
                        if(pageNumber > 1)
                            pageNumber = 1;
                        if(pageNumberSelector)
                            pageNumberSelector.selectedIndex = 0;
                        domModule.addClass(firstPageLink, constants.styles.disabled);
                        domModule.addClass(prevPageLink, constants.styles.disabled);
                        domModule.removeClass(nextPageLink, constants.styles.disabled);
                        domModule.removeClass(lastPageLink, constants.styles.disabled);
                        //reset selected rows
                        if(selectedRowIndex !== -1)
                        {
                            selectedRowIndex = -1;
                            observer.publish(eventTypes.rowSelected,[selectedRowIndex]);
                        }
                        getCollection(getCollection.triggers.firstPage);
                    });
                }
                if(prevPageLink)
                {
                    eventModule.addListener(prevPageLink, "click", function (e) {
                        eventModule.stop(e);
                        if(domModule.matches(prevPageLink, "." + constants.styles.disabled))
                            return;
                        if(pageNumber >= 2)
                        {
                            pageNumber -= 1;
                            if(pageNumberSelector)
                                pageNumberSelector.selectedIndex -= 1;
                        }
                        if(pageNumber === 1)
                        {
                            domModule.addClass(firstPageLink, constants.styles.disabled);
                            domModule.addClass(prevPageLink, constants.styles.disabled);
                        }
                        domModule.removeClass(nextPageLink, constants.styles.disabled);
                        domModule.removeClass(lastPageLink, constants.styles.disabled);
                        //reset selected rows
                        if(selectedRowIndex !== -1)
                        {
                            selectedRowIndex = -1;
                            observer.publish(eventTypes.rowSelected,[selectedRowIndex]);
                        }
                        getCollection(getCollection.triggers.prevPage);
                    });
                }
                if(nextPageLink)
                {
                    eventModule.addListener(nextPageLink, "click", function (e) {
                        eventModule.stop(e);
                        if(domModule.matches(nextPageLink, "." + constants.styles.disabled))
                            return;
                        if(pageNumber >= 1 && pageNumber < pagesCount)
                        {
                            pageNumber += 1;
                            if(pageNumberSelector)
                                pageNumberSelector.selectedIndex += 1;
                        }
                        if(pageNumber >= 1 && pageNumber === pagesCount)
                        {
                            domModule.addClass(nextPageLink, constants.styles.disabled);
                            domModule.addClass(lastPageLink, constants.styles.disabled);
                        }
                        domModule.removeClass(firstPageLink, constants.styles.disabled);
                        domModule.removeClass(prevPageLink, constants.styles.disabled);
                        //reset selected rows
                        if(selectedRowIndex !== -1)
                        {
                            selectedRowIndex = -1;
                            observer.publish(eventTypes.rowSelected,[selectedRowIndex]);
                        }
                        getCollection(getCollection.nextPageClicked);
                    });
                }
                if(lastPageLink)
                {
                    eventModule.addListener(lastPageLink, "click", function (e) {
                        eventModule.stop(e);
                        if(domModule.matches(lastPageLink, "." + constants.styles.disabled))
                            return;
                        if(pageNumber >= 1)
                            pageNumber = pagesCount;
                        if(pageNumberSelector)
                            pageNumberSelector.selectedIndex = pagesCount - 1;
                        domModule.addClass(nextPageLink, constants.styles.disabled);
                        domModule.addClass(lastPageLink, constants.styles.disabled);
                        domModule.removeClass(firstPageLink, constants.styles.disabled);
                        domModule.removeClass(prevPageLink, constants.styles.disabled);
                        //reset selected rows
                        if(selectedRowIndex !== -1)
                        {
                            selectedRowIndex = -1;
                            observer.publish(eventTypes.rowSelected,[selectedRowIndex]);
                        }
                        getCollection(getCollection.triggers.lastPage);
                    });
                }
                if(rowsPerPageSelector)
                {
                    rowsPerPage = parseInt(rowsPerPageSelector.options[rowsPerPageSelector.selectedIndex].value, 10);
                    eventModule.addListener(rowsPerPageSelector,"change", function (e) {
                        rowsPerPage = parseInt(e.target.options[e.target.selectedIndex].value, 10);
                        if(pageSelector)
                        {
                            pageNumber = 1;
                            pagesCount = Math.ceil(userSettings.navigator.pager.itemsCount/rowsPerPage);
                            ofTotalLabel.replaceChild(doc.createTextNode(" " + userSettings.resources.ofLabel + " " + pagesCount + " | "), ofTotalLabel.firstChild);
                            domModule.empty(pageSelector);
                            for (i = 1; i <= pagesCount; i += 1) {
                                pageSelectorOption = doc.createElement("option");
                                pageSelectorOption.appendChild(doc.createTextNode(i.toString()));
                                pageSelectorOption.value = i.toString();
                                pageSelector.appendChild(pageSelectorOption);
                            }
                            domModule.addClass(firstPageLink, constants.styles.disabled);
                            domModule.addClass(prevPageLink, constants.styles.disabled);
                            domModule.removeClass(nextPageLink, constants.styles.disabled);
                            domModule.removeClass(lastPageLink, constants.styles.disabled);
                        }
                        //reset selected rows
                        if(selectedRowIndex !== -1)
                        {
                            selectedRowIndex = -1;
                            observer.publish(eventTypes.rowSelected,[selectedRowIndex]);
                        }
                        getCollection(getCollection.triggers.rowsPerPage);
                    });
                }
            }
            function setupModal () {
                //check, if already created by another grid instance
                if(doc.querySelector("div." + constants.styles.modal))
                    return;
                var modal = doc.createElement("div"),
                    popup = doc.createElement("div"),
                    content = doc.createElement("div"),
                    controls = doc.createElement("div"),
                    specificControls = doc.createElement("div"),
                    okButton = doc.createElement("button"),
                    cancelButton = doc.createElement("button");
                modal.className = constants.styles.modal;
                popup.className = constants.styles.modalPopup;
                content.className = constants.styles.modalContent;
                controls.className = constants.styles.modalControls;
                specificControls.className = constants.styles.modalSpecificControls;
                okButton.className = constants.styles.modalControlsOk;
                cancelButton.className = constants.styles.modalControlsCancel;
                //styles from http://www.w3schools.com/howto/howto_css_modals.asp
                domModule.addStyleSheetRule(constants.styles.styleSheet, "." + constants.styles.modal + "{ display: none; position: fixed; z-index: 999; " +
                    "left: 0; top: 0; width: 100%; height: 100%; overflow: auto; " +
                    "background-color: rgb(0,0,0); background-color: rgba(0,0,0, 0.4);}");
                domModule.addStyleSheetRule(constants.styles.styleSheet, "." + constants.styles.modalPopup + "{ background-color: #fefefe; margin: auto; padding: 20px; border: 1px solid #888; width: 80%;" +
                    " position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); }");
                domModule.addStyleSheetRule(constants.styles.styleSheet, "." + constants.styles.modalContentLeft + "{ float:left; width: 20%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap }");
                domModule.addStyleSheetRule(constants.styles.styleSheet, "." + constants.styles.modalSpecificControls + "{ float: left; }");
                okButton.appendChild(doc.createTextNode(constants.strings.modalOkButtonText));
                cancelButton.appendChild(doc.createTextNode(constants.strings.modalCancelButtonText));
                controls.appendChild(specificControls);
                controls.appendChild(okButton);
                controls.appendChild(cancelButton);

                popup.appendChild(content);
                popup.appendChild(controls);
                eventModule.addListener(okButton, "click", function (e) {
                    observer.publish(eventTypes.modalOkClicked);
                });
                eventModule.addListener(cancelButton, "click", function (e) {
                    observer.publish(eventTypes.modalCancelClicked);
                });
                modal.appendChild(popup);
                doc.body.appendChild(modal);
            }
            function setupTooltip () {
                //check, if already created by another grid instance
                if(doc.querySelector("div." + constants.styles.tooltip))
                    return;
                var tooltip = doc.createElement("div");
                tooltip.style.position = "absolute";
                tooltip.style.display = "none";
                tooltip.className = constants.styles.tooltip;
                doc.body.appendChild(tooltip);
            }
            function setupLongStringTooltips() {
                var tooltip = doc.querySelector("." + constants.styles.tooltip),
                    timer;
                if(!tooltip)
                    setupTooltip();
                function mouseout(e) {
                    tooltip.style.display = "none";
                    win.clearTimeout(timer);
                    domModule.empty(tooltip);
                    eventModule.removeListener(e.target, "mouseout", mouseout);
                };
                eventModule.delegate(table, "td." + constants.styles.longString, "mouseover",function (e) {
                    timer = win.setTimeout(function () {
                        tooltip.appendChild(doc.createTextNode(e.target.textContent));
                        tooltip.style.position = "absolute";
                        tooltip.style.left = e.clientX + win.pageXOffset + 15 + "px";
                        tooltip.style.top = e.clientY + win.pageYOffset + 15 + "px";
                        tooltip.style.display = "block";
                    }, 500);
                    eventModule.addListener(e.target, "mouseout", mouseout);
                });

            }
            function setupDataEditModalTemplate (dataRow) {
                var modal = doc.querySelector("." + constants.styles.modal),
                    content = doc.querySelector("." + constants.styles.modalContent),
                    row,
                    docFragment = doc.createDocumentFragment(),
                    title = doc.createElement("span"),
                    messages = doc.createElement("div"),
                    currentYear = (new Date()).getFullYear(), year, month, day,
                    cellData,
                    leftDiv, rightDiv, userInput, option, selectTypeOption, requiredTag,
                    i, j, count = userSettings.columnModel.length, modelColumn;
                function okClicked() {
                    //collect form data
                    var count = userSettings.columnModel.length, el,
                        year, month, day,
                        data = {},
                        hiddenValuesIterator,
                        ul, li;
                    for (i = 0; i < count; i += 1)
                    {
                        modelColumn = userSettings.columnModel[i];
                        if(Array.isArray(modelColumn.type))//select
                        {
                            el = content.querySelector("[name=\"" + modelColumn.name + "\"]");
                            data[modelColumn.name] = el.options[el.selectedIndex].value;
                        }
                        else if(modelColumn.type === dataTypes.date)
                        {
                            el = content.querySelector("[name=\"" + modelColumn.name + constants.strings.dateTypeMonthPostfix + "\"]");
                            month = el.options[el.selectedIndex].value;
                            el = content.querySelector("[name=\"" + modelColumn.name + constants.strings.dateTypeDayPostfix + "\"]");
                            day = el.options[el.selectedIndex].value;
                            el = content.querySelector("[name=\"" + modelColumn.name + constants.strings.dateTypeYearPostfix + "\"]");
                            year = el.options[el.selectedIndex].value;
                            data[modelColumn.name] = (year.length > 0 && month.length > 0 && day.length > 0) ? new Date(year, month, day) : "";
                        }
                        else if(modelColumn.type === dataTypes.bool)
                        {
                            el = content.querySelector("[name=\"" + modelColumn.name + "\"]");
                            data[modelColumn.name] = el.checked;
                        }
                        else//longString, string, float, int
                        {
                            el = content.querySelector("[name=\"" + modelColumn.name + "\"]");
                            data[modelColumn.name] = el.value.trim();
                        }
                    }
                    validator.validate(data);
                    if(validator.hasErrors())
                    {
                        domModule.empty(messages);
                        ul = doc.createElement("ul");
                        messages.appendChild(ul);
                        count = validator.messages.length;
                        for (i = 0; i < count; i += 1)
                        {
                            li = doc.createElement("li");
                            li.appendChild(doc.createTextNode(validator.messages[i]));
                            ul.appendChild(li);
                        }
                        messages.appendChild(ul);
                        messages.style.display = "block";
                        return;
                    }
                    if(dataRow)
                    {
                        //add Row's hidden values to submitted data
                        hiddenValuesIterator = dataRow.getHiddenValuesIterator();
                        while(hiddenValuesIterator.hasNext())
                        {
                            data[hiddenValuesIterator.current().name] = hiddenValuesIterator.current().value;
                            hiddenValuesIterator.next();
                        }
                        //call to edit. perform PUT to edit item
                        if(dataRow.getHref())
                            ajaxModule.put(dataRow.getHref(), function (resp) {
                                updateRowFromFormData(selectedRowIndex, data);
                            }, { data: data, errorHandler: typeof userSettings.requestErrorHandler === "function" ? userSettings.requestErrorHandler : null });
                    }
                    else//create new. Perform POST to append
                        ajaxModule.post(collectionUrl, function (resp) {
                            updateRowFromFormData(-1, data);
                        }, { data: data, errorHandler: typeof userSettings.requestErrorHandler === "function" ? userSettings.requestErrorHandler : null});
                    //reset validator
                    validator.reset();
                    //remove listeners,since the pop up is closing
                    observer.unsubscribe(okClicked, eventTypes.modalOkClicked);
                    observer.unsubscribe(cancelClicked, eventTypes.modalCancelClicked);
                    domModule.empty(content);
                    modal.style.display = "none";
                }
                function cancelClicked() {
                    domModule.empty(content);
                    modal.style.display = "none";
                    //reset validator
                    validator.reset();
                    //remove listeners,since the pop up is closing
                    observer.unsubscribe(okClicked, eventTypes.modalOkClicked);
                    observer.unsubscribe(cancelClicked, eventTypes.modalCancelClicked);
                }
                if(!content)
                    return;
                //add listeners
                observer.subscribe(okClicked, eventTypes.modalOkClicked);
                observer.subscribe(cancelClicked, eventTypes.modalCancelClicked);
                //add title
                title.appendChild(doc.createTextNode(!!dataRow ? userSettings.resources.editRecordTitle : userSettings.resources.addRecordTitle));
                docFragment.appendChild(title);
                //add validation messages pop up
                messages.className = constants.styles.modalContentMessages;
                messages.style.display = "none";
                docFragment.appendChild(messages);
                //create cell edit controls
                for (i = 0; i < count; i += 1)
                {
                    modelColumn = userSettings.columnModel[i];
                    //create validation rules
                    validator.messageLabelMappings[modelColumn.name] = modelColumn.label;
                    validator.config[modelColumn.name] = [];
                    row = doc.createElement("div");
                    //create label
                    leftDiv = doc.createElement("div");
                    leftDiv.className = constants.styles.modalContentLeft;
                    leftDiv.appendChild(doc.createTextNode(modelColumn.label));
                    if(modelColumn.required)
                    {
                        requiredTag = doc.createElement("span");
                        requiredTag.style.color = "red";
                        requiredTag.appendChild(doc.createTextNode(" *"));
                        leftDiv.appendChild(requiredTag);
                        //"required" validation rule
                        validator.config[modelColumn.name].push(validator.validationTypes.isNotEmpty);
                    }
                    //create input controls
                    rightDiv = doc.createElement("div");
                    rightDiv.className = constants.styles.modalContentRight;
                    if(Array.isArray(modelColumn.type))//select
                    {
                        userInput = doc.createElement("select");
                        userInput.name = modelColumn.name;
                        if(dataRow)
                            cellData = dataRow.getCell(modelColumn.name);
                        option = doc.createElement("option");
                        option.value = "";
                        option.appendChild(doc.createTextNode(userSettings.resources.defaultOptionText));
                        userInput.appendChild(option);
                        for (j = 0; j < modelColumn.type.length; j += 1)
                        {
                            selectTypeOption = modelColumn.type[j];
                            option = doc.createElement("option");
                            if(typeof selectTypeOption.value !== "undefined")
                                option.value = selectTypeOption.value.toString();
                            if(typeof selectTypeOption.text !== "undefined")
                                option.appendChild(doc.createTextNode(selectTypeOption.text.toString()));
                            if(dataRow && cellData === option.value)
                                option.selected = true;
                            userInput.appendChild(option);
                        }
                        if(!modelColumn.editable)
                            userInput.setAttribute("disabled", "");
                        rightDiv.appendChild(userInput);
                    }
                    else if(modelColumn.type === dataTypes.longString)
                    {
                        userInput = doc.createElement("textarea");
                        userInput.name = modelColumn.name;
                        userInput.style.resize = "horizontal";
                        userInput.style.maxWidth = "100%";
                        userInput.rows = 2;
                        if(dataRow)
                            userInput.value = dataRow.getCell(modelColumn.name);
                        if(!modelColumn.editable)
                            userInput.setAttribute("disabled", "");
                        rightDiv.appendChild(userInput);
                        //no string validation is performed
                    }
                    else if(modelColumn.type === dataTypes.date)
                    {
                        if(dataRow)
                        {
                            year = dataRow.getCell(modelColumn.name).getFullYear();
                            month = dataRow.getCell(modelColumn.name).getMonth();
                            day = dataRow.getCell(modelColumn.name).getDate();
                        }
                        else
                            year = month = day = -1;
                        rightDiv.appendChild(doc.createTextNode(userSettings.resources.monthLabel + ": "));
                        userInput = doc.createElement("select");
                        userInput.name = modelColumn.name + constants.strings.dateTypeMonthPostfix;
                        option = doc.createElement("option");
                        option.value = "";
                        option.appendChild(doc.createTextNode(userSettings.resources.defaultOptionText));
                        userInput.appendChild(option);
                        for (j = 0; j < 12; j += 1)
                        {
                            option = doc.createElement("option");
                            option.value = j;
                            option.appendChild(doc.createTextNode((j + 1).toString()));
                            if(j === month)
                                option.setAttribute("selected", "");
                            userInput.appendChild(option);
                        }
                        if(!modelColumn.editable)
                            userInput.setAttribute("disabled", "");
                        rightDiv.appendChild(userInput);

                        rightDiv.appendChild(doc.createTextNode(" " + userSettings.resources.dayLabel + ": "));
                        userInput = doc.createElement("select");
                        userInput.name = modelColumn.name + constants.strings.dateTypeDayPostfix;
                        option = doc.createElement("option");
                        option.value = "";
                        option.appendChild(doc.createTextNode(userSettings.resources.defaultOptionText));
                        userInput.appendChild(option);
                        for (j = 1; j < 32; j += 1)
                        {
                            option = doc.createElement("option");
                            option.value = j;
                            option.appendChild(doc.createTextNode(j.toString()));
                            if(j === day)
                                option.setAttribute("selected", "");
                            userInput.appendChild(option);
                        }
                        if(!modelColumn.editable)
                            userInput.setAttribute("disabled", "");
                        rightDiv.appendChild(userInput);

                        rightDiv.appendChild(doc.createTextNode(" " + userSettings.resources.yearLabel + ": "));
                        userInput = doc.createElement("select");
                        userInput.name = modelColumn.name + constants.strings.dateTypeYearPostfix;
                        option = doc.createElement("option");
                        option.value = "";
                        option.appendChild(doc.createTextNode(userSettings.resources.defaultOptionText));
                        userInput.appendChild(option);
                        for (j = 1900; j < currentYear + 50; j += 1)
                        {
                            option = doc.createElement("option");
                            option.value = j;
                            option.appendChild(doc.createTextNode(j.toString()));
                            if(j === year)
                                option.setAttribute("selected", "");
                            userInput.appendChild(option);
                        }
                        if(!modelColumn.editable)
                            userInput.setAttribute("disabled", "");
                        rightDiv.appendChild(userInput);
                        //no date validation is performed, since date is created with the help of "select" controls
                    }
                    else if(modelColumn.type === dataTypes.bool)
                    {
                        userInput = doc.createElement("input");
                        userInput.name = modelColumn.name;
                        userInput.type = "checkbox";
                        if(!modelColumn.editable)
                            userInput.setAttribute("disabled", "");
                        if(dataRow && !!dataRow.getCell(modelColumn.name))
                            userInput.checked = true;
                        rightDiv.appendChild(userInput);
                        //no checkbox validation is required
                    }
                    else//text, float, int
                    {
                        userInput = doc.createElement("input");
                        userInput.name = modelColumn.name;
                        userInput.type = "text";
                        if(dataRow)
                            userInput.value = dataRow.getCell(modelColumn.name);
                        if(!modelColumn.editable)
                            userInput.setAttribute("disabled", "");
                        rightDiv.appendChild(userInput);
                        //number type validation
                        if(modelColumn.type === dataTypes.int || modelColumn.type === dataTypes.float)
                            validator.config[modelColumn.name].push(validator.validationTypes.isNumber);
                    }
                    //append cell edit controls
                    row.appendChild(leftDiv);
                    row.appendChild(rightDiv);
                    docFragment.appendChild(row);
                }
                content.appendChild(docFragment);
                modal.style.display = "block";
            }
            function updateRowFromFormData(rowIndex, data) {
                var row, i, count = userSettings.columnModel.length,
                    tr, td, cellData,
                    columnType, columnName, dataEntry;
                if(!data || typeof data !== "object")
                    return;
                if(rowIndex < 0)//create new
                {
                    //reset row selection
                    selectedRowIndex = -1;
                    observer.publish(eventTypes.rowSelected,[selectedRowIndex]);
                    //reload data
                    getCollection(getCollection.triggers.dataLoad);
                    return;
                }
                //update existing
                tr = table.querySelector("tbody tr:nth-child(" + (rowIndex + 1) + ")");
                row = rows[rowIndex];
                if(!tr)
                    return;
                for(i = 0; i < count; i += 1)
                {
                    columnType = userSettings.columnModel[i].type;
                    columnName = userSettings.columnModel[i].name;
                    dataEntry = data[columnName];
                    if(typeof dataEntry === "undefined")
                        continue;
                    if(Array.isArray(columnType))
                        row.setCell(columnName, dataEntry);
                    else
                        switch (columnType)
                        {
                            case dataTypes.bool:
                                if(typeof dataEntry === "boolean")
                                    row.setCell(columnName, dataEntry);
                                else if(dataEntry === "true" || dataEntry === "false")
                                    row.setCell(columnName, dataEntry === "true");
                                break;
                            case dataTypes.date:
                                if(dataEntry instanceof Date)
                                    row.setCell(columnName, dataEntry);
                                break;
                            case dataTypes.float:
                                row.setCell(columnName, parseFloat(dataEntry));
                                break;
                            case dataTypes.int:
                                row.setCell(columnName, parseInt(dataEntry));
                                break;
                            default:
                                row.setCell(columnName, dataEntry.toString());
                                break;
                        }
                    td = tr.querySelector("td:nth-child(" + (i + 1) + ")");
                    cellData = applyFormatting(row.getCell(columnName), columnType, userSettings.locale);
                    domModule.empty(td);
                    td.appendChild(cellData);
                }
                rows[rowIndex] = row;
            }
            function setupDataSearchModalTemplate () {
                var modal = doc.querySelector("div." + constants.styles.modal),
                    content = doc.querySelector("." + constants.styles.modalContent),
                    specificControls = modal.querySelector("." + constants.styles.modalSpecificControls),
                    resetAllButton = doc.createElement("button"),
                    title = doc.createElement("span"),
                    year, month, day,
                    i, j, count = userSettings.searchTemplate.length, searchItem,
                    row, leftDiv, rightDiv, userInput, selectTypeOption, option,
                    docFragment = doc.createDocumentFragment(),
                    currentYear = (new Date).getFullYear();
                function resetClicked() {
                    for(i = 0; i < count; i += 1)
                    {
                        searchItem = userSettings.searchTemplate[i];
                        if(Array.isArray(searchItem.type))
                        {
                            userInput = content.querySelector("[name=\"" + searchItem.name + "\"]");
                            userInput.selectedIndex = 0;
                        }
                        else if(searchItem.type === dataTypes.date)
                        {
                            userInput = content.querySelector("[name=\"" + searchItem.name + constants.strings.dateTypeMonthPostfix + "\"]");
                            userInput.selectedIndex = 0;
                            userInput = content.querySelector("[name=\"" + searchItem.name + constants.strings.dateTypeDayPostfix + "\"]");
                            userInput.selectedIndex = 0;
                            userInput = content.querySelector("[name=\"" + searchItem.name + constants.strings.dateTypeYearPostfix + "\"]");
                            userInput.selectedIndex = 0;

                        }
                        else if(searchItem.type === dataTypes.bool)
                        {
                            userInput = content.querySelector("[name=\"" + searchItem.name + "\"]");
                            userInput.indeterminate = true;
                        }
                        else
                        {
                            userInput = content.querySelector("[name=\"" + searchItem.name + "\"]");
                            userInput.value = "";
                        }
                    }
                }
                function okClicked() {
                    var val, searchFiltersApplied = false;
                    for(i = 0; i < count; i += 1)
                    {
                        searchItem = userSettings.searchTemplate[i];
                        if(!searchItem.name)
                            continue;
                        if(Array.isArray(searchItem.type))
                        {
                            userInput = content.querySelector("[name=\"" + searchItem.name + "\"]");
                            val = userInput.options[userInput.selectedIndex].value;
                            if(val.length > 0)
                            {
                                searchFiltersApplied = true;
                                searchItem.value = val;
                            }
                            else
                                delete searchItem.value;
                        }
                        else if(searchItem.type === dataTypes.date)
                        {
                            userInput = content.querySelector("[name=\"" + searchItem.name + constants.strings.dateTypeMonthPostfix + "\"]");
                            month = userInput.options[userInput.selectedIndex].value;
                            userInput = content.querySelector("[name=\"" + searchItem.name + constants.strings.dateTypeDayPostfix + "\"]");
                            day = userInput.options[userInput.selectedIndex].value;
                            userInput = content.querySelector("[name=\"" + searchItem.name + constants.strings.dateTypeYearPostfix + "\"]");
                            year = userInput.options[userInput.selectedIndex].value;
                            if(year.length > 0 && month.length > 0 && day.length > 0)
                            {
                                searchFiltersApplied = true;
                                searchItem.value = new Date(year, month, day);
                            }
                            else
                                delete searchItem.value;
                        }
                        else if(searchItem.type === dataTypes.bool)
                        {
                            userInput = content.querySelector("[name=\"" + searchItem.name + "\"]");
                            if(!userInput.indeterminate)
                            {
                                searchFiltersApplied = true;
                                searchItem.value = userInput.checked;
                            }
                            else
                                delete searchItem.value;
                        }
                        else//longString, string, float, int
                        {
                            userInput = content.querySelector("[name=\"" + searchItem.name + "\"]");
                            val = userInput.value.trim();
                            if(val.length > 0)
                            {
                                searchFiltersApplied = true;
                                searchItem.value = val;
                            }
                            else
                                delete searchItem.value;
                        }
                    }
                    if(searchFiltersApplied)
                        observer.publish(eventTypes.searchFiltersApplied);
                    else
                        observer.publish(eventTypes.searchFiltersRemoved);
                    getCollection(getCollection.triggers.dataLoad);
                    closePopUp();
                }
                function closePopUp() {
                    //remove listeners,since the pop up is closing
                    eventModule.removeListener(resetAllButton, "click", resetClicked);
                    observer.unsubscribe(okClicked, eventTypes.modalOkClicked);
                    observer.unsubscribe(closePopUp, eventTypes.modalCancelClicked);
                    domModule.empty(content);
                    domModule.empty(specificControls);
                    modal.style.display = "none";
                }
                if(!content)
                    return;
                title.className = constants.styles.modalContentTitle;
                title.appendChild(doc.createTextNode(userSettings.resources.searchTitle));
                docFragment.appendChild(title);
                resetAllButton.appendChild(doc.createTextNode(userSettings.resources.resetSearchFiltersLabel));
                specificControls.appendChild(resetAllButton);

                for(i = 0; i < count; i += 1)
                {
                    searchItem = userSettings.searchTemplate[i];
                    if(!searchItem.name || !searchItem.prompt)
                        continue;
                    row = doc.createElement("div");
                    //create label
                    leftDiv = doc.createElement("div");
                    leftDiv.className = constants.styles.modalContentLeft;
                    leftDiv.appendChild(doc.createTextNode(searchItem.prompt));
                    rightDiv = doc.createElement("div");
                    rightDiv.className = constants.styles.modalContentRight;
                    if(Array.isArray(searchItem.type))//select
                    {
                        userInput = doc.createElement("select");
                        userInput.name = searchItem.name;
                        option = doc.createElement("option");
                        option.value = "";
                        option.appendChild(doc.createTextNode(userSettings.resources.defaultOptionText));
                        userInput.appendChild(option);
                        for (j = 0; j < searchItem.type.length; j += 1)
                        {
                            selectTypeOption = searchItem.type[j];
                            option = doc.createElement("option");
                            if(typeof selectTypeOption.value !== "undefined")
                                option.value = selectTypeOption.value.toString();
                            if(typeof selectTypeOption.text !== "undefined")
                                option.appendChild(doc.createTextNode(selectTypeOption.text.toString()));
                            if(searchItem.value === option.value)
                                option.selected = true;
                            userInput.appendChild(option);
                        }
                        rightDiv.appendChild(userInput);
                    }
                    else if(searchItem.type === dataTypes.date)
                    {
                        if(searchItem.value instanceof Date)
                        {
                            year = searchItem.value.getFullYear();
                            month = searchItem.value.getMonth();
                            day = searchItem.value.getDate();
                        }
                        else
                            year = month = day = -1;
                        rightDiv.appendChild(doc.createTextNode(userSettings.resources.monthLabel + ": "));
                        userInput = doc.createElement("select");
                        userInput.name = searchItem.name + constants.strings.dateTypeMonthPostfix;
                        option = doc.createElement("option");
                        option.value = "";
                        option.appendChild(doc.createTextNode(userSettings.resources.defaultOptionText));
                        userInput.appendChild(option);
                        for (j = 0; j < 12; j += 1)
                        {
                            option = doc.createElement("option");
                            option.value = j;
                            option.appendChild(doc.createTextNode((j + 1).toString()));
                            if(j === month)
                                option.selected = true;
                            userInput.appendChild(option);
                        }
                        rightDiv.appendChild(userInput);

                        rightDiv.appendChild(doc.createTextNode(" " + userSettings.resources.dayLabel + ": "));
                        userInput = doc.createElement("select");
                        userInput.name = searchItem.name + constants.strings.dateTypeDayPostfix;
                        option = doc.createElement("option");
                        option.value = "";
                        option.appendChild(doc.createTextNode(userSettings.resources.defaultOptionText));
                        userInput.appendChild(option);
                        for (j = 1; j < 32; j += 1)
                        {
                            option = doc.createElement("option");
                            option.value = j;
                            option.appendChild(doc.createTextNode(j.toString()));
                            if(j === day)
                                option.selected = true;
                            userInput.appendChild(option);
                        }
                        rightDiv.appendChild(userInput);

                        rightDiv.appendChild(doc.createTextNode(" " + userSettings.resources.yearLabel + ": "));
                        userInput = doc.createElement("select");
                        userInput.name = searchItem.name + constants.strings.dateTypeYearPostfix;
                        option = doc.createElement("option");
                        option.value = "";
                        option.appendChild(doc.createTextNode(userSettings.resources.defaultOptionText));
                        userInput.appendChild(option);
                        for (j = 1900; j < currentYear + 50; j += 1)
                        {
                            option = doc.createElement("option");
                            option.value = j;
                            option.appendChild(doc.createTextNode(j.toString()));
                            if(j === year)
                                option.selected = true;
                            userInput.appendChild(option);
                        }
                        rightDiv.appendChild(userInput);
                    }
                    else if(searchItem.type === dataTypes.bool)
                    {
                        userInput = doc.createElement("input");
                        userInput.name = searchItem.name;
                        userInput.type = "checkbox";
                        if(typeof searchItem.value !== "undefined")
                            userInput.checked = searchItem.value;
                        else
                            userInput.indeterminate = true;
                        userInput.checked = searchItem.value;

                        rightDiv.appendChild(userInput);
                    }
                    else//text, float, int
                    {
                        userInput = doc.createElement("input");
                        userInput.name = searchItem.name;
                        userInput.type = "text";
                        if(searchItem.value)
                            userInput.value = searchItem.value;
                        rightDiv.appendChild(userInput);
                    }
                    row.appendChild(leftDiv);
                    row.appendChild(rightDiv);
                    docFragment.appendChild(row);
                }

                content.appendChild(docFragment);
                eventModule.addListener(resetAllButton, "click", resetClicked);
                observer.subscribe(okClicked, eventTypes.modalOkClicked);
                observer.subscribe(closePopUp, eventTypes.modalCancelClicked);
                modal.style.display = "block";
            }
            function setupDeleteDataModalTemplate () {
                var modal = doc.querySelector("div." + constants.styles.modal),
                    content = doc.querySelector("." + constants.styles.modalContent),
                    title = doc.createElement("span");
                function okClicked() {
                    var url;
                    if(selectedRowIndex > 0)
                    {
                        url = rows[selectedRowIndex].getHref();
                        ajaxModule.delete(url, function (resp) {
                            getCollection(getCollection.triggers.dataLoad);
                        }, { errorHandler: typeof userSettings.requestErrorHandler === "function" ? userSettings.requestErrorHandler : null });
                    }
                    domModule.empty(content);
                    modal.style.display = "none";
                    //remove listeners,since the pop up is closing
                    observer.unsubscribe(okClicked, eventTypes.modalOkClicked);
                    observer.unsubscribe(cancelClicked, eventTypes.modalCancelClicked);
                }
                function cancelClicked() {
                    domModule.empty(content);
                    modal.style.display = "none";
                    //remove listeners,since the pop up is closing
                    observer.unsubscribe(okClicked, eventTypes.modalOkClicked);
                    observer.unsubscribe(cancelClicked, eventTypes.modalCancelClicked);
                }
                if(!content)
                    return;
                observer.subscribe(okClicked, eventTypes.modalOkClicked);
                observer.subscribe(cancelClicked, eventTypes.modalCancelClicked);
                title.appendChild(doc.createTextNode(userSettings.resources.deleteRowConfirmationMessage));
                content.appendChild(title);
                modal.style.display = "block";
            }
            function setupLinksModalTemplate (dataRow) {
                var modal = doc.querySelector("div." + constants.styles.modal),
                    content = doc.querySelector("." + constants.styles.modalContent),
                    title = doc.createElement("span"),
                    ul = doc.createElement("ul"),
                    li,
                    linksIterator;
                function okClicked() {
                    domModule.empty(content);
                    modal.style.display = "none";
                    //remove listeners,since the pop up is closing
                    observer.unsubscribe(okClicked, eventTypes.modalOkClicked);
                    observer.unsubscribe(okClicked, eventTypes.modalCancelClicked);
                }
                if(!content)
                    return;
                observer.subscribe(okClicked, eventTypes.modalOkClicked);
                observer.subscribe(okClicked, eventTypes.modalCancelClicked);
                title.appendChild(doc.createTextNode("Links"));
                content.appendChild(title);
                linksIterator = dataRow.getLinksIterator();
                while(linksIterator.hasNext())
                {
                    li = doc.createElement("li");
                    li.appendChild(linksIterator.current().value.renderHtml());
                    ul.appendChild(li);
                    linksIterator.next();
                }
                content.appendChild(ul);
                modal.style.display = "block";
            }
            function getCollection (trigger) {
                var collectionRequestProcessor = userSettings.collectionRequestProcessor,
                    i, count = userSettings.searchTemplate.length, searchItem;
                //reset previously ser params
                requestOptions.data = {};
                requestOptions.headers = {};
                //append search params
                for(i = 0; i < count; i += 1)
                {
                    searchItem = userSettings.searchTemplate[i];
                    if(searchItem.name && typeof searchItem.value !== "undefined")
                        getCollection.collectionRequestBuilder.addParam(searchItem.name, searchItem.value);
                }
                if(typeof collectionRequestProcessor === "function")
                    collectionRequestProcessor(getCollection.collectionRequestBuilder, trigger);
            }
            function setup () {
                //check required features presence
                if(typeof doc.querySelector !== "function" || typeof doc.querySelectorAll !== "function")
                    throw new Error(constants.errorMessages.unsupportedBrowserMessage);
                //add required functionality
                if(typeof Array.isArray !== "function")
                    Array.isArray = utils.isArray;
                //user input validation
                validator = {
                    types: {
                        isNumber: {
                            validate: function (value) {
                                return value !== "" && !isNaN(value);
                            },
                            instructions: userSettings.resources.isNumberInstructionMessage
                        },
                        isAlphaNum: {
                            validate: function (value) {
                                return !/[^a-z0-9]/i.test(value.toString());
                            },
                            instructions: userSettings.resources.isAlphaNumInstructionMessage
                        },
                        isNotEmpty: {
                            validate: function (value) {
                                return value.toString().replace(/\s/g, '').length !== 0;
                            },
                            instructions: userSettings.resources.isNotEmptyInstructionMessage
                        }
                    },
                    // error messages in the current validation session
                    messages: [],
                    // current validation config
                    // name: [validation types array]
                    //keys in config obj. should be equal to keys in validate(data) obj.
                    config: {},
                    // key => label mapping for messages
                    messageLabelMappings: {},
                    // the interface method
                    // "data" is key => value pairs
                    validate: function (data) {
                        var i, j, msg, configValidationTypes, count, checker, result_ok;
                        // reset all messages
                        this.messages = [];
                        for (i in data)
                        {
                            if (data.hasOwnProperty(i))
                            {
                                configValidationTypes = this.config[i];
                                count = configValidationTypes.length;
                                if (!configValidationTypes)
                                    continue;
                                for (j = 0; j < count; j += 1)
                                {
                                    checker = this.types[configValidationTypes[j]];
                                    if (!checker)
                                        throw new Error("No handler to validate type " + configValidationTypes[i]);
                                    result_ok = checker.validate(data[i]);
                                    if (!result_ok)
                                    {
                                        msg = userSettings.resources.invalidValueMessage + " \"" + (this.messageLabelMappings[i] || i) + "\", " + checker.instructions;
                                        this.messages.push(msg);
                                    }
                                }

                            }
                        }
                    },
                    reset: function () {
                        this.config = {};
                        this.messageLabelMappings = {};
                    },
                    hasErrors: function () {
                        return this.messages.length !== 0;
                    }
                };
                validator.validationTypes = {
                    isNumber: "isNumber",
                    isAlphaNumeric: "isAlphaNum",
                    isNotEmpty: "isNotEmpty"
                };
                //implements publisher/subscriber pattern
                observer = {
                    subscribe: function (fn, type) {
                        var subs = subscribers[type];
                        if(!subs)
                            return;
                        subs.push(fn);
                    },
                    unsubscribe: function (fn, type) {
                        var subs = subscribers[type],
                            i,
                            count;
                        if(!subs)
                            return;
                        count = subs.length;
                        for(i = 0; i < count; i += 1)
                            if(subs[i] === fn)
                                subs.splice(i, 1);
                    },
                    publish: function (type, args) {
                        var subs = subscribers[type],
                            i,
                            count;
                        if(!subs)
                            return;
                        count = subs.length;
                        //this === window
                        for(i = 0; i < count; i += 1)
                            subs[i].apply(null, Array.isArray(args) ? args : null);
                    }
                };
                //create event types' subscription arrays
                for(i in eventTypes)
                    if(eventTypes.hasOwnProperty(i))
                        subscribers[i] = [];
                //create markup
                buildTable();
                //implement ability to select rows
                setupSelectableRows();
                //implement column resizing
                setupResizableColumns();
                //implement column switching
                if(userSettings.draggableColumns)
                    setupDraggableColumns();
                //implement column sorting functionality
                setupSortableColumns();
                //setup navigator actions
                setupAddAction();
                setupDeleteAction();
                setupEditAction();
                setupSearchAction();
                setupLinkAction();
                setupReloadAction();
                //setup pager
                setupPagerControls();
                //setup modal
                setupModal();
                //setup tooltips
                setupTooltip();
                setupLongStringTooltips();
                //request data
                getCollection(getCollection.triggers.dataLoad);
                observer.publish(eventTypes.dataLoadStarted);
            }
            //collection builder user interface
            //returned each time with the obtained data
            getCollection.collectionBuilder = {
                createTableRow: function (href) {
                    return new Row(href);
                },
                createLink: function (href) {
                    return new Link(href);
                },
                //returns bool, indicating whether the operation succeed
                addRow: function (row) {
                    if(!(row instanceof Row))
                        throw new Error("parameter \"row\" should be created with the help of \"createTableRow\" function");
                    //rowsPerPage > 0 means that the pager has been set up
                    if(rowsPerPage > 0) {
                        if (rows.length < rowsPerPage)
                            rows.push(row);
                    }
                    //Single page without pager. Push infinite number of rows
                    else
                        rows.push(row);
                },
                addLink: function (key, value) {
                    if(!key || typeof key !== "string")
                        throw new Error("parameter \"key\" should be a non zero length string");
                    if(!(value instanceof Link))
                        throw new Error("parameter \"value\" should be created with the help of \"createLink\" function");
                    links[key] = value;
                },
                getRowsPerPage: function () {
                    return rowsPerPage;
                },
                getPageNumber: function () {
                    return pageNumber;
                },
                setItemsCount: function (itemsCount) {
                    if(typeof itemsCount !== "number" || itemsCount <= 0)
                        throw new Error("parameter \"itemsCount\" should be a positive integer");
                    if(userSettings.navigator && userSettings.navigator.pager)
                        userSettings.navigator.pager.itemsCount = itemsCount;
                },
                applyChanges: function (createdCollectionUrl) {
                    var sortIndicator = table.querySelector("." + constants.styles.sortIndicator),
                        docFragment = doc.createDocumentFragment(),
                        tbody = table.querySelector("tbody"),
                        i,
                        count = rows.length;
                    if(!createdCollectionUrl || typeof createdCollectionUrl !== "string")
                        throw new Error("parameter \"createdCollectionUrl\" should be a non zero length string");
                     collectionUrl = createdCollectionUrl;
                    if(sortIndicator)
                        sortIndicator.remove();
                    for(i = 0; i < count; i += 1)
                        docFragment.appendChild(createTrElement(rows[i]));
                    domModule.empty(tbody);
                    tbody.appendChild(docFragment);
                }
            };
            //collection request builder
            getCollection.collectionRequestBuilder = {
                addParam: function (name, value) {
                    if(!name || typeof name !== "string")
                        throw new Error("parameter \"name\" should be a non zero length string");
                    requestOptions.data[name] = value;
                },
                getLink: function (key) {
                    if(!key || typeof key !== "string")
                        throw new Error("parameter \"key\" should be a non zero length string");
                    return links[key];
                },
                getRowsPerPage: function () {
                    return rowsPerPage;
                },
                getPageNumber: function () {
                    return pageNumber;
                },
                performRequest: function (requestedCollectionUrl) {
                    if(!requestedCollectionUrl || typeof requestedCollectionUrl !== "string")
                        throw new Error("parameter \"requestedCollectionUrl\" should be a non zero length string");
                    requestOptions.headers["Accept-Language"] = userSettings.locale;
                    if(typeof userSettings.requestErrorHandler === "function")
                        requestOptions.errorHandler = userSettings.requestErrorHandler;
                    switch (userSettings.dataReader.dataType.toLowerCase())
                    {
                        case defaultSettings.dataReader.dataTypes.json:
                            ajaxModule.getJSON(requestedCollectionUrl, function (jsonData) {
                                rows.length = 0;
                                links = {};
                                if(typeof userSettings.dataReader.dataProcessor === "function")
                                    userSettings.dataReader.dataProcessor(jsonData, getCollection.collectionBuilder);
                                observer.publish(eventTypes.dataLoadFinished);
                            }, requestOptions);
                            break;
                        case defaultSettings.dataReader.dataTypes.xml:
                            ajaxModule.getXML(requestedCollectionUrl, function (xmlData) {
                                rows.length = 0;
                                links = {};
                                if(typeof userSettings.dataReader.dataProcessor === "function")
                                    userSettings.dataReader.dataProcessor(xmlData, getCollection.collectionBuilder);
                                observer.publish(eventTypes.dataLoadFinished);
                            }, requestOptions);
                            break;
                        default://text
                            ajaxModule.getText(requestedCollectionUrl, function (textData) {
                                rows.length = 0;
                                links = {};
                                if(typeof userSettings.dataReader.dataProcessor === "function")
                                    userSettings.dataReader.dataProcessor(textData, getCollection.collectionBuilder);
                                observer.publish(eventTypes.dataLoadFinished);
                            }, requestOptions);
                            break;
                    }
                },
                //ability to skip request, to possibly work with some local/cached data
                skipRequest: function () {
                    rows.length = 0;
                    links = {};
                    if(typeof userSettings.dataReader.dataProcessor === "function")
                        userSettings.dataReader.dataProcessor(null, getCollection.collectionBuilder);
                    observer.publish(eventTypes.dataLoadFinished);
                }
            };
            getCollection.triggers = {
                dataLoad: "dataLoad",
                firstPage: "firstPage",
                lastPage: "lastPage",
                prevPage: "prevPage",
                nextPage: "nextPage",
                page: "page",
                rowsPerPage: "rowsPerPage"
            };
            //initialize plugin instance
            setupSettings(userSettings);
            setup();
        };

        return newJsGrid;
    }());

    //client api module
    win.jsGrid = win.jsGrid || (function() {
        //cache created instances, for further references
        function getInstance(settings) {
            var id = settings.tableId
                , instance;
            instance = new JsGrid(settings);
            getInstance.cache[id] = instance;
            return getInstance.cache[id];
        }
        getInstance.cache = {};//all instantiated grids
        return  {
            //change global plugin name
            alias: function (name) {
                if(typeof  name === "string")
                    win[name] = this;
            },
            //return constructed instance
            init: function(settings) {
                var table;
                if(!settings)
                    return null;
                if(typeof settings.tableId !== "string")
                    throw new Error("tableId is not defined");
                table = document.getElementById(settings.tableId);
                if(!table || table.tagName !== "TABLE")
                    throw new Error("Table does not exist");
                return getInstance(settings);
            },
            searchInstance: function (tableId) {
                var result = null;
                if(typeof tableId !== "string")
                    return result;
                result = getInstance.cache[tableId] || null;
                return result;
            }
        };
    }());//client api module
}(window));
