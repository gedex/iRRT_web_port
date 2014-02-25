/**
 * iRRT.js
 *
 * @author Akeda Bagus <admin@gedex.web.id>
 */
$(function() {
	/**
	 * Shortcut for Math.abs.
	 */
	function abs(x) {
		return Math.abs(x);
	}

	/**
	 * Function overloading.
	 * @source http://blog.dezfowler.com/2008/08/function-overloading-in-javascript.html
	 */
	function Impl() {
		var _impl = {};
		return {
			add: function(aSignature, fImpl) {
				_impl[aSignature] = fImpl;
			},
			exec: function(args, scope) {
				var aArgs = Array.prototype.slice.call(args);
				var aCtors = [];
				for (var i in aArgs) {
					aCtors.push(aArgs[i].constructor);
				}
				return (_impl[aCtors] || function(){}).apply(scope, aArgs);
			},
			compile: function() {
				var impl = this;
				return function() {
					return impl.exec(arguments, this);
				};
			}
		};
	}

	var Node = function() {
		var impl = new Impl();
		var self = this;

		// Implements 3 overloadings.
		impl.add([], function() {
			self.x(-1);
			self.y(-1);
			self.pathLengthFromRoot(-1);
			self.distFromGoal(Number.POSITIVE_INFINITY);
		});
		impl.add([Number, Number], function(x, y) {
			self.x(x);
			self.y(y);
			self.pathLengthFromRoot(-1);
			self.distFromGoal(Number.POSITIVE_INFINITY);
		});
		impl.add([Number, Number, Number, Number], function(x, y, pathLength, distFromGoal) {
			self.x(x);
			self.y(y);
			self.pathLengthFromRoot(pathLength);
			self.distFromGoal(distFromGoal);
		});

		Node = impl.compile();
		return Node.apply(this, arguments);
	};

	Node.prototype = {
		constructor: Node,

		/**
		 * Optimized overload via closure.
		 * @source http://webreflection.blogspot.com/2010/02/javascript-overload-patterns.html
		 */
		pathLengthFromRoot: (function() {
			function pathLengthFromRoot(pathLength) {
				return pathLength === null ? get(this) : set(this, pathLength);
			}

			function get(self) {
				return self.pathLength;
			}

			function set(self, pathLength) {
				self.pathLength = pathLength;
				return self;
			}

			return pathLengthFromRoot;
		}()),

		distFromGoal: (function() {
			function distFromGoal(dist) {
				return dist === null ? get(this) : set(this, dist);
			}

			function get(self) {
				return self.dist;
			}

			function set(self, dist) {
				self.dist = dist;
				return self;
			}

			return distFromGoal;
		}()),

		x: (function() {
			function x(_x) {
				return _x === null ? get(this) : set(this, _x);
			}

			function get(self) {
				return self._x;
			}

			function set(self, _x) {
				self._x = _x;
				return self;
			}

			return x;
		}()),

		y: (function() {
			function y(_y) {
				return _y === null ? get(this) : set(this, _y);
			}

			function get(self) {
				return self._y;
			}

			function set(self, _y) {
				self._y = _y;
				return self;
			}

			return y;
		}()),

		coordinate: (function() {
			function coordinate(x, y) {
				return arguments.length < 2 ? get(this) : set(this, x, y);
			}

			function get(self) {
				return [self.x(), self.y()];
			}

			function set(self, x, y) {
				self.x(x);
				self.y(y);
				return self;
			}

			return coordinate;
		}()),

		toString: function() {
			return "N = (" + this.x() + "," + this.y() + ")";
		}
	};

	var Tree = function() {
		var impl = new Impl();
		var self = this;

		impl.add([], function() {
			self.x(-1);
			self.y(-1);
			self.pathLengthFromRoot(-1);
			self.distFromGoal(Number.POSITIVE_INFINITY);
		});

		Tree = impl.compile();
		return Tree.apply(this, arguments);
	};

	Tree.prototype = {
		constructor: Tree,

		vertices: (function() {
			function vertices(node, parent) {
				if (node === null && parent === null) {
					return all(this);
				}
				//
				if (parent === null) {

				}
				// add new node with specified parent
				set(this, node, parent);

				return self;
			}

			function set(self, node, parent) {
				var index = self._vertices.indexOf(node);
				if (index >= 0) {
					self._vertices.push(node);
				}
			}

			function get(self, index) {
				if (index == -1) return null;

				if (index < self._vertices.length) {
					return self._vertices[index];
				} else {
					return null;
				}
			}

			function all(self) {
				return self._vertices;
			}

			return vertices;
		}()),

		children: (function() {
			function children() {

			}

			return children;
		}()),

		parents: (function() {
			function parents() {

			}

			return parents;
		}())
	};

	/**
	 * Override draw funciton for drawing randomized tree, default 60 fps.
	 */
	var drawRRT = function(p) {
		p.setup = function() {

		};

		p.draw = function() {

		};
	};

	/**
	 * Override draw function for drawing shape, default 60 fps.
	 */
	var drawShape = function(p) {
		// canvas
		var BG_CANVAS = 255;
		var BG_SHAPE = 0;
		var MIN_SHAPE = 8;
		var SHAP = "";

		// coordinates
		var x1, y1, x2, y2, prevX, prevY;
		var prevR = -1;
		var prevW = -1;
		var prevH = -1;

		p.setup = function() {
			p.size($('#main').width(), $('#irrt-app').height());
			p.background(BG_CANVAS);
			p.setFill();
			p.noStroke();
			p.cursor(p.ARROW);
		};

		p.draw = function() {
		};

		p.drawCircle = function() {
			var r = abs(x1 - x2) > abs(y1 - y2) ? abs(x1 - x2) : abs(y1 - y2);
			if (prevR < 0) {
				prevR = r;
			}

			var startX = x1;
			var startY = y1;
			if (abs(x1 - x2) >= abs(y1 - y2)) {
				startX = x2 > x1 ? (x1 + r) : (x1 - r);
			} else {
				startY = y2 > y1 ? (y1 + r) : (y1 - r);
			}

			// If previous radius is bigger than current radius,
			// fill the biggest shape with canvas background.
			if (prevR > r) {
				p.fill(BG_CANVAS);
				p.ellipse(prevX, prevY, prevR*2 + 2, prevR*2 + 2);
				p.setFill();
			}

			if (r > MIN_SHAPE) {
				p.setFill();
				p.ellipse(startX, startY, r*2, r*2);
			}

			// Save previous states.
			prevR = r;
			prevX = startX;
			prevY = startY;
		};

		p.drawRectangle = function() {
			var w = abs(x1 - x2);
			var h = abs(y1 - y2);
			if (prevW < 0 || prevH < 0) {
				prevW = w;
				prevH = h;
			}

			var startX = x1;
			var startY = y1;
			if (x2 < x1) startX = x2;
			if (y2 < y1) startY = y2;

			// If prevW is bigger than current w,
			// fill the biggest shape with canvas background.
			if (prevW > w || prevH > h) {
				p.fill(BG_CANVAS);
				p.rect(prevX, prevY, prevW, prevH);
				p.setFill();
			}

			if (w > MIN_SHAPE && h > MIN_SHAPE) {
				p.setFill();
				p.rect(startX, startY, w, h);
			}

			// Save previous states.
			prevW = w;
			prevH = h;
			prevX = startX;
			prevY = startY;
		};

		p.mousePressed = function() {
			x1 = p.mouseX;
			y1 = p.mouseY;
			p.cursor(p.ARROW);
		};

		p.mouseDragged = function() {
			x2 = p.mouseX;
			y2 = p.mouseY;

			if (SHAP == "circle") {
				p.drawCircle();
			} else if (SHAP == "rectangle") {
				p.drawRectangle();
			}
			p.cursor(p.ARROW);
		};

		p.setShape = function(shape) {
			SHAP = shape;
		};

		p.setColorShape = function(color) {
			BG_SHAPE = color;
		};

		p.setFill = function() {
			p.fill(BG_SHAPE);
			if (BG_SHAPE === 'green') {
				p.fill(0, 255, 0);
			} else if (BG_SHAPE === 'red') {
				p.fill(255, 0, 0);
			}
		};

		p.clearCanvas = function() {
			p.background(BG_CANVAS);
		};

		p.mouseReleased = function() {
			x2 = p.mouseX;
			y2 = p.mouseY;

			// Reset previous radius.
			prevR = -1;
			// Reset previous width and height.
			prevW = -1;
			prevH = -1;
		};
	};

	/**
	 * Application View for iRRT.
	 */
	var iRRT_View = Backbone.View.extend({
		el: $('#irrt-app'),

		events: {
			"click button.draw-shape": "selectShape",
			"click #new-map": "newMap",
			"click #speed-up": "speedUp",
			"click #slow-down": "slowDown"
		},

		initialize: function() {
			$('#speed-slider').slider({
				orientation: 'vertical',
				value: 100,
				min: 0,
				max: 100,
				step: 10
			});
			this.canvas = document.getElementById('canvas-drawer');
			this.drawingShape = new Processing(this.canvas, drawShape);
			this.currentShape = null;
			this.colorShape = 'black';
		},

		newMap: function() {
			this.drawingShape.clearCanvas();
		},

		selectShape: function(e) {
			// Give active class to clicked button.
			$('.draw-shape').removeClass('active');
			var $target = $(e.target);
			if ($target.is('img')) {
				$target = $target.parent();
			}
			$target.addClass('active');

			if ($target.attr('id') === 'draw-square') {
				this.currentShape = 'rectangle';
				this.colorShape = 0;
			} else if ($target.attr('id') === 'draw-circle') {
				this.currentShape = 'circle';
				this.colorShape = 0;
			} else if ($target.attr('id') === 'starting-point') {
				this.currentShape = 'circle';
				this.colorShape = 'green';
			} else if ($target.attr('id') === 'finishing-point') {
				this.currentShape = 'circle';
				this.colorShape = 'red';
			}
			this.drawingShape.setShape(this.currentShape);
			this.drawingShape.setColorShape(this.colorShape);
		},

		speedUp: function(e) {
			var value = $('#speed-slider').slider('option', 'value');
			if (value < 100) {
				$('#speed-slider').slider('value', value + 10);
			}
		},

		slowDown: function(e) {
			var value = $('#speed-slider').slider('option', 'value');
			if (value > 0) {
				$('#speed-slider').slider('value', value - 10);
			}
		}
	});

	var App = new iRRT_View();
});
