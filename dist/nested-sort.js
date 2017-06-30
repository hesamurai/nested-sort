var nestedSort =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var nestedSort = function () {
	    function nestedSort(opt) {
	        _classCallCheck(this, nestedSort);
	
	        opt = opt || {};
	
	        // private data
	        this.selector = opt.selector || '';
	
	        this.sortableList = null;
	        this.placeholderUl = null;
	        this.placeholderInUse = null;
	        this.draggedNode = null;
	        this.targetedNode = null;
	
	        this.distances = {
	            mouseTo: {
	                targetedElTop: undefined
	            }
	        };
	
	        this.dimensions = {
	            targetedEl: {
	                H: undefined
	            }
	        };
	
	        this.cursorX = null;
	        this.cursorY = null;
	        this.targetedNodeX = null;
	        this.targetedNodeY = null;
	
	        this.dropEvent = new Event('drop');
	
	        this.selector = opt.el;
	        this.distances.droppingEdge = opt.droppingEdge || 15;
	        this.distances.droppingEdgeNegative = this.distances.droppingEdge * -1;
	
	        this.initDragAndDrop();
	    }
	
	    _createClass(nestedSort, [{
	        key: 'initDragAndDrop',
	        value: function initDragAndDrop() {
	            var _this = this;
	
	            document.addEventListener('dragover', this.dragListener.bind(this), false);
	            // document.addEventListener('touchmove', this.dragListener.bind(this), false);
	
	            this.initPlaceholderList();
	
	            this.sortableList = document.getElementById(this.selector);
	
	            this.sortableList.querySelectorAll('li').forEach(function (el) {
	                el.setAttribute('draggable', 'true');
	
	                el.addEventListener('dragstart', _this.onDragStart.bind(_this), false);
	                // el.addEventListener('touchstart', onDragStart, false);
	
	                el.addEventListener('dragenter', _this.onDragEnter.bind(_this), false);
	                // el.addEventListener('dragexit', removeStyles, false);
	                el.addEventListener('dragleave', _this.onDragLeave.bind(_this), false);
	                el.addEventListener('dragend', _this.onDragEnd.bind(_this), false);
	                el.addEventListener('drop', _this.onDrop.bind(_this), false);
	            });
	        }
	    }, {
	        key: 'onDragStart',
	        value: function onDragStart(e) {
	            this.draggedNode = e.target;
	            this.draggedNode.classList.add('dragged');
	            e.dataTransfer.setData('text', 'Drag started!'); // Hack for Firefox!
	        }
	    }, {
	        key: 'onDragEnter',
	        value: function onDragEnter(e) {
	            e.preventDefault();
	
	            if (['LI', 'UL'].indexOf(e.target.nodeName) > -1) {
	                this.targetedNode = e.target;
	            }
	        }
	    }, {
	        key: 'dragListener',
	        value: function dragListener(e) {
	            this.updateCoordinations(e);
	            this.managePlaceholderLists(e);
	            this.dropIf(e);
	        }
	    }, {
	        key: 'updateCoordinations',
	        value: function updateCoordinations(e) {
	            this.calcMouseCoords(e);
	            this.calcMouseToTargetedElDist();
	        }
	    }, {
	        key: 'dropIf',
	        value: function dropIf(e) {
	            if (!this.canBeDropped()) {
	                return;
	            }
	
	            if (this.targetedNode.nodeName === 'LI' && !this.cursorIsIndentedEnough()) {
	                if (this.distances.mouseTo.targetedElTop < 0 && this.distances.mouseTo.targetedElTop > this.distances.droppingEdgeNegative
	                // && mouseHasMovedUp()
	                ) {
	                        this.dropTheItem('before');
	                    } else if (this.distances.mouseTo.targetedElBot < 0 && this.distances.mouseTo.targetedElBot > this.distances.droppingEdgeNegative
	                // && mouseHasMovedDown()
	                ) {
	                        this.dropTheItem('after');
	                    }
	            } else if (this.targetedNode.nodeName === 'UL') {
	                this.dropTheItem('inside');
	            }
	        }
	    }, {
	        key: 'dropTheItem',
	        value: function dropTheItem(place) {
	            switch (place) {
	                case 'before':
	                    this.targetedNode.parentNode.insertBefore(this.draggedNode, this.targetedNode);
	                    break;
	                case 'after':
	                    this.insertAfter(this.draggedNode, this.targetedNode);
	                    break;
	                case 'inside':
	                    this.targetedNode.appendChild(this.draggedNode);
	                    break;
	            }
	
	            this.draggedNode.dispatchEvent(this.dropEvent);
	        }
	    }, {
	        key: 'calcMouseCoords',
	        value: function calcMouseCoords(e) {
	            // cursorX = e.screenX;
	            // cursorY = e.screenY;
	
	            // we're having the client coords because on the next lines, we use getBoundingClientRect which behaves in the same way
	            this.cursorX = e.clientX;
	            this.cursorY = e.clientY;
	        }
	    }, {
	        key: 'calcMouseToTargetedElDist',
	        value: function calcMouseToTargetedElDist() {
	            if (!this.targetedNode) {
	                return;
	            }
	
	            var offset = this.targetedNode.getBoundingClientRect();
	            this.targetedNodeX = offset.left;
	            this.targetedNodeY = offset.top;
	
	            var result = this.targetedNodeY - this.cursorY;
	            this.distances.mouseTo.targetedElTop = result;
	            this.distances.mouseTo.targetedElTopAbs = Math.abs(result);
	            this.dimensions.targetedEl.H = this.targetedNode.clientHeight;
	            this.distances.mouseTo.targetedElBot = this.distances.mouseTo.targetedElTopAbs - this.dimensions.targetedEl.H;
	        }
	    }, {
	        key: 'onDragLeave',
	        value: function onDragLeave(e) {
	            e.preventDefault();
	        }
	    }, {
	        key: 'onDragEnd',
	        value: function onDragEnd(e) {
	            e.preventDefault();
	            this.draggedNode.classList.remove('dragged');
	            this.cleanupPlaceholderLists();
	        }
	    }, {
	        key: 'areNested',
	        value: function areNested(child, parent) {
	            var isChild = false;
	            parent.querySelectorAll('li').forEach(function (li) {
	                if (li === child) {
	                    isChild = true;
	                }
	            });
	            return isChild;
	        }
	    }, {
	        key: 'cursorIsIndentedEnough',
	        value: function cursorIsIndentedEnough() {
	            return this.cursorX - this.targetedNodeX > 50;
	        }
	    }, {
	        key: 'mouseHasMovedUp',
	        value: function mouseHasMovedUp() {
	            return this.draggedNode.getBoundingClientRect().top > this.cursorY;
	        }
	    }, {
	        key: 'mouseHasMovedDown',
	        value: function mouseHasMovedDown() {
	            return !this.mouseHasMovedUp();
	        }
	    }, {
	        key: 'mouseIsTooCloseToTop',
	        value: function mouseIsTooCloseToTop() {
	            return this.cursorY - this.targetedNodeY < this.distances.droppingEdge;
	        }
	    }, {
	        key: 'insertAfter',
	        value: function insertAfter(newNode, referenceNode) {
	            referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
	        }
	    }, {
	        key: 'managePlaceholderLists',
	        value: function managePlaceholderLists(e) {
	            var _this2 = this;
	
	            var actions = this.analysePlaceHolderSituation(e);
	
	            actions.forEach(function (action) {
	                switch (action) {
	                    case 'add':
	                        _this2.cleanupPlaceholderLists();
	                        _this2.addPlaceholderList();
	                        break;
	                    case 'cleanup':
	                        _this2.cleanupPlaceholderLists();
	                        break;
	                    default:
	                        return;
	                        break;
	                }
	            });
	        }
	    }, {
	        key: 'targetedNodeIsPlaceholder',
	        value: function targetedNodeIsPlaceholder() {
	            return this.targetedNode.nodeName === 'UL' && this.targetedNode.classList.contains('placeholder');
	        }
	    }, {
	        key: 'analysePlaceHolderSituation',
	        value: function analysePlaceHolderSituation(e) {
	            if (!this.targetedNode || this.areNested(this.targetedNode, this.draggedNode)) {
	                return [];
	            }
	
	            var actions = [];
	
	            if (!this.cursorIsIndentedEnough() || this.mouseIsTooCloseToTop()) {
	                if (!this.targetedNodeIsPlaceholder()) {
	                    actions.push('cleanup');
	                }
	            } else if (this.targetedNode !== this.draggedNode && this.targetedNode.nodeName === 'LI' && !this.targetedNode.querySelectorAll('ul').length) {
	                actions.push('add');
	            }
	
	            return actions;
	        }
	    }, {
	        key: 'addPlaceholderList',
	        value: function addPlaceholderList() {
	            this.targetedNode.appendChild(this.getPlaceholderList());
	        }
	    }, {
	        key: 'canBeDropped',
	        value: function canBeDropped() {
	            var result = true;
	
	            result &= !!this.targetedNode && this.targetedNode !== this.draggedNode;
	            result &= !(this.targetedNode.nodeName === 'UL' && this.targetedNode.querySelectorAll('li').length);
	            result &= !this.areNested(this.targetedNode, this.draggedNode);
	
	            return result;
	        }
	    }, {
	        key: 'cleanupPlaceholderLists',
	        value: function cleanupPlaceholderLists() {
	            this.sortableList.querySelectorAll('ul').forEach(function (ul) {
	                if (!ul.querySelectorAll('li').length) {
	                    ul.remove();
	                } else if (ul.classList.contains('placeholder')) {
	                    ul.classList.remove('placeholder');
	                }
	            });
	        }
	    }, {
	        key: 'initPlaceholderList',
	        value: function initPlaceholderList() {
	            this.placeholderUl = document.createElement('ul');
	            this.placeholderUl.classList.add("placeholder");
	        }
	    }, {
	        key: 'getPlaceholderList',
	        value: function getPlaceholderList() {
	            this.placeholderInUse = this.placeholderUl.cloneNode(true);
	            return this.placeholderInUse;
	        }
	    }, {
	        key: 'onDrop',
	        value: function onDrop() {
	            this.cleanupPlaceholderLists();
	        }
	    }]);
	
	    return nestedSort;
	}();
	
	exports.default = nestedSort;
	module.exports = exports['default'];

/***/ })
/******/ ]);
//# sourceMappingURL=nested-sort.js.map