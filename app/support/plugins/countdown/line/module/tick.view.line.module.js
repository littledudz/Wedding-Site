/*
 * Tick v1.3.2 - Counters Made Easy
 * Copyright (c) 2017 PQINA - http://tickcounterplugin.com
 */
export default typeof window !== 'undefined' ? (function() {
	if (!module) {
		var module = {};
	}
'use strict';

var createBar = (function () {
	var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : API,
	    DOM = _ref.DOM,
	    _ref$View = _ref.View,
	    rooter = _ref$View.rooter,
	    destroyer = _ref$View.destroyer,
	    drawer = _ref$View.drawer,
	    updater = _ref$View.updater,
	    styler = _ref$View.styler;

	var draw = function draw(state) {

		// initial draw
		if (!state.rail) {
			state.rail = DOM.create('span', 'tick-line-rail');
			state.fill = DOM.create('span', 'tick-line-fill');
			state.rail.appendChild(state.fill);
			state.root.appendChild(state.rail);
		}

		// update style of bar
		if (state.style.fillColor) {
			state.fill.style.backgroundColor = state.style.fillColor;
		}

		if (state.style.railColor) {
			state.rail.style.backgroundColor = state.style.railColor;
		}

		// update bar
		DOM.transform(state.fill, state.style.orientation === 'horizontal' ? 'translateX' : 'translateY', state.style.flip ?
		// flipped
		-100 + (state.style.orientation === 'horizontal' ? 1 : -1) * state.value * 100 :

		// normal
		(state.style.orientation === 'horizontal' ? 1 : -1) * state.value * 100, '%');
	};

	return function (root) {

		var state = {
			rail: null,
			fill: null
		};

		drawer(state, draw);

		return Object.assign({}, rooter(state, root, 'line'), updater(state), styler(state, {
			flip: false, // true
			fillColor: null, // color, { colors: ['red', 'blue'], type: 'horizontal' }
			railColor: null, // color, { colors: ['red', 'blue'], type: 'follow' }
			capStyle: 'auto', // auto is set by CSS, round, square, butt
			orientation: 'horizontal' // vertical
		}), destroyer(state));
	};
});

var CACHE = {};

var cache = (function (value, fn) {
	var fns = fn.toString();
	if (!CACHE[fns]) {
		CACHE[fns] = {};
	}
	if (!CACHE[fns][value]) {
		CACHE[fns][value] = fn(value);
	}
	return CACHE[fns][value];
});

var toRGBAColor = function toRGBAColor(c) {
	return 'rgba(' + c.map(function (v, i) {
		return i < 3 ? Math.round(v * 255) : v;
	}).join(',') + ')';
};

var interpolateColor = function interpolateColor(a, b, p) {
	return a.map(function (v, i) {
		return v + (b[i] - v) * p;
	});
};

var toColorList = function toColorList(color) {
	var c = color.match(/[.\d]+/g).map(function (value, index) {
		return index < 3 ? parseFloat(value) / 255 : parseFloat(value);
	});
	return c.length === 4 ? c : c.concat([1]);
};

var getColorRangeForColors = function getColorRangeForColors(colors, precision) {

	var colorOffset = 0;
	var count = colors.length - 1;
	var colorFirst = colors[0];
	var colorLast = colors[colors.length - 1];

	if (colorFirst.offset && colorFirst.offset > 0) {
		colors.unshift({
			offset: 0,
			value: colorFirst.value
		});
	}

	if (colorLast.offset && colorLast.offset < 1) {
		colors.push({
			offset: 1,
			value: colorLast.value
		});
	}

	var input = colors.map(function (color, index) {

		colorOffset = color.offset || Math.max(index / count, colorOffset);

		return {
			offset: colorOffset,
			// copy color as array so we don't modify cache value
			value: cache(color.value, toColorList).concat()
		};
	});

	var output = input.reduce(function (output, color, index) {

		// color to interpolate towards
		var targetColor = color.value;

		// add first color
		if (index === 0) {
			output.push(targetColor);
		}
		// interpolate to this color from last color
		else if (index > 0) {

				var previousColor = output[output.length - 1];
				var previousOffset = (output.length - 1) / precision;

				var steps = Math.round(precision * (color.offset - previousOffset));

				var i = 1; // skip previous color (it's already in array)
				for (; i <= steps; i++) {
					output.push(interpolateColor(previousColor, targetColor, i / steps));
				}
			}

		return output;
	}, []);

	return output.map(toRGBAColor);
};

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};

var CIRC = Math.PI * 2;
var QUART = Math.PI * .5;

var setShadow = function setShadow(ctx, x, y, blur, color) {
	ctx.shadowOffsetX = x;
	ctx.shadowOffsetY = y;
	ctx.shadowBlur = blur;
	ctx.shadowColor = color;
};

var drawGradientArc = function drawGradientArc(ctx, x, y, radius, offset, length, from, to, width, colorList, shadow, cap) {

	if (to < from) {
		return;
	}

	// add shadow
	if (shadow) {

		drawArc(ctx, x, y, radius, offset, length, from, to, width, 'transparent', shadow, cap);
	}

	// draw precision
	var segmentCount = Math.max(20, Math.round(radius * length * .75));

	var palette = getColorRangeForColors(colorList, segmentCount);

	var range = to - from;

	var circleOffset = -QUART + CIRC * from;
	var segmentSize = CIRC / segmentCount;

	var wholeSegmentsCount = Math.floor(range * segmentCount);
	var finalSegmentEnd = range * segmentCount - wholeSegmentsCount;
	var finalSegmentSize = finalSegmentEnd * segmentSize;

	var segments = [];

	for (var i = 0; i < wholeSegmentsCount; i++) {

		var _segmentOffset = circleOffset + i * segmentSize;

		segments.push({
			from: {
				offset: _segmentOffset,
				color: palette[i],
				x: Math.cos(_segmentOffset),
				y: Math.sin(_segmentOffset)
			},
			to: {
				offset: _segmentOffset + segmentSize,
				color: palette[i + 1] || palette[i],
				x: Math.cos(_segmentOffset + segmentSize),
				y: Math.sin(_segmentOffset + segmentSize)
			}
		});
	}

	// add additional point
	var segmentOffset = circleOffset + wholeSegmentsCount * segmentSize;
	segments.push({
		from: {
			offset: segmentOffset,
			color: palette[wholeSegmentsCount],
			x: Math.cos(segmentOffset),
			y: Math.sin(segmentOffset)
		},
		to: {
			offset: segmentOffset + finalSegmentSize,
			color: palette[wholeSegmentsCount + 1] || palette[wholeSegmentsCount],
			x: Math.cos(segmentOffset + finalSegmentSize),
			y: Math.sin(segmentOffset + finalSegmentSize)
		}
	});

	// draw circle
	var overlap = 0.0025;

	for (var _i = 0; _i < segments.length; _i++) {

		var segment = segments[_i];

		ctx.beginPath();

		var gradient = ctx.createLinearGradient(x + segment.from.x * radius, y + segment.from.y * radius, x + segment.to.x * radius, y + segment.to.y * radius);
		gradient.addColorStop(0, segment.from.color);
		gradient.addColorStop(1.0, segment.to.color);

		ctx.lineCap = cap;
		ctx.strokeStyle = gradient;
		ctx.arc(x, y, radius, segment.from.offset - overlap, segment.to.offset + overlap);
		ctx.lineWidth = width;
		ctx.stroke();
		ctx.closePath();
	}

	//
	//
	// return;
	//
	// let start = -QUART + (CIRC * from);
	// let gradient;
	// let startColor;
	// let endColor;
	// let xStart;
	// let yStart;
	// let xEnd;
	// let yEnd;
	// let i = 0;
	// //let segment = (CIRC * range) / l;
	//
	// let segment = CIRC / segmentCount;
	//
	// //console.log(CIRC / total);
	// //segment = radius / 500;
	// //console.log(segment, radius / 500);
	//
	// for (; i < l; i++) {
	//
	// 	startColor = palette[i];
	// 	endColor = palette[i+1] || startColor;
	//
	// 	// x start / end of the next arc to draw
	// 	xStart = x + Math.cos(start) * radius;
	// 	xEnd = x + Math.cos(start + segment) * radius;
	//
	// 	// y start / end of the next arc to draw
	// 	yStart = y + Math.sin(start) * radius;
	// 	yEnd = y + Math.sin(start + segment) * radius;
	//
	// 	ctx.beginPath();
	//
	// 	gradient = ctx.createLinearGradient(xStart, yStart, xEnd, yEnd);
	// 	gradient.addColorStop(0, startColor);
	// 	gradient.addColorStop(1.0, endColor);
	//
	// 	ctx.lineCap = cap;
	// 	ctx.strokeStyle = gradient;
	// 	ctx.arc(x, y, radius, start -.005, start + segment + 0.005);
	// 	ctx.lineWidth = width;
	// 	ctx.stroke();
	// 	ctx.closePath();
	//
	// 	start += segment;
	// }
};

var drawArc = function drawArc(ctx, x, y, radius, offset, length, from, to, width, color, shadow, cap) {

	if (to < from) {
		return;
	}

	if ((typeof color === 'undefined' ? 'undefined' : _typeof(color)) === 'object' && color.type === 'follow-gradient') {

		drawGradientArc(ctx, x, y, radius, offset, length, from, to, width, color.colors, shadow, cap);

		return;
	}

	if (shadow) {

		var translation = color === 'transparent' ? 9999 : 0;

		ctx.save();

		ctx.translate(translation, 0);

		setShadow(ctx, shadow[0] - translation, shadow[1], shadow[2], shadow[3]);
	}

	ctx.beginPath();
	ctx.lineWidth = width;

	ctx.arc(x, y, radius, -QUART + CIRC * from, -QUART + CIRC * to, false);

	if ((typeof color === 'undefined' ? 'undefined' : _typeof(color)) === 'object') {

		var grad = color.type === 'horizontal-gradient' ? ctx.createLinearGradient(0, radius, radius * 2, radius) : ctx.createLinearGradient(radius, 0, radius, radius * 2);

		var _offset = 0;
		var count = color.colors.length - 1;
		color.colors.forEach(function (color, index) {
			grad.addColorStop(color.offset || Math.max(index / count, _offset), color.value);
			_offset = color.offset || _offset;
		});
		ctx.strokeStyle = grad;
	} else {
		ctx.strokeStyle = color === 'transparent' ? '#000' : color;
	}

	ctx.lineCap = cap;

	ctx.stroke();

	if (shadow) {
		ctx.restore();
	}
};

var drawRing = function drawRing(ctx, progress, offset, length, gap, size, radiusRing, widthRing, colorRing, shadowRing, radiusProgress, widthProgress, colorProgress, shadowProgress, cap, invert) {

	if (length + gap > 1) {
		length = length - (-1 + length + gap);
		offset = offset + gap * .5;
	}

	var aStart = offset;
	var bEnd = offset + length;
	var mid = progress * length;
	var scale = .5 - Math.abs(-.5 + progress);
	var aEnd = offset + (mid - scale * gap);
	var bStart = offset + (mid + (1 - scale) * gap);

	// if no radius supplied, quit
	if (!radiusRing && !radiusProgress) {
		return;
	}

	// let's draw
	if (invert) {

		drawArc(ctx, size, size, radiusProgress, offset, length, aStart, aEnd, widthProgress, colorProgress, shadowProgress, cap);

		drawArc(ctx, size, size, radiusRing, offset, length, bStart, bEnd, widthRing, colorRing, shadowRing, cap);
	} else {

		drawArc(ctx, size, size, radiusProgress, offset, length, bStart, bEnd, widthProgress, colorProgress, shadowProgress, cap);

		if (progress > .0001) {
			drawArc(ctx, size, size, radiusRing, offset, length, aStart, aEnd, widthRing, colorRing, shadowRing, cap);
		}
	}
};

var createRing = (function () {
	var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : API,
	    Canvas = _ref.Canvas,
	    create = _ref.DOM.create,
	    _ref$Utils = _ref.Utils,
	    toPixels = _ref$Utils.toPixels,
	    toColor = _ref$Utils.toColor,
	    _ref$View = _ref.View,
	    rooter = _ref$View.rooter,
	    destroyer = _ref$View.destroyer,
	    drawer = _ref$View.drawer,
	    updater = _ref$View.updater,
	    styler = _ref$View.styler,
	    resizer = _ref$View.resizer;

	/**
  * Ring helper functions
  */
	var draw = function draw(state) {

		// if is not attached can't draw (we need to know root size)
		if (!state.root || !state.root.parentNode) {
			return;
		}

		reflow(state);

		// clear canvas before redraw
		Canvas.clear(state.visual);

		// don't redraw as would be drawn outside of bounding box and throw errors
		if (state.size - Math.max(state.fillRadius, state.railRadius) < 0) {
			return;
		}

		// draw new ring
		drawRing(state.visual.getContext('2d'), state.style.flip ? 1 - state.value : state.value, state.style.offset, state.style.length, state.style.gapSize, state.size, state.fillRadius, state.fillWidth, state.style.fillColor, state.fillShadow, state.railRadius, state.railWidth, state.style.railColor, state.railShadow, state.style.capStyle, state.style.invert);
	};

	var reflow = function reflow(state) {

		if (!state.visual) {
			state.visual = create('canvas');
			state.visual.width = 0;
			state.visual.height = 0;
			state.root.appendChild(state.visual);
		}

		var ctx = state.visual.getContext('2d');
		var size = state.root.clientWidth;

		state.size = size * .5;

		var devicePixelRatio = Canvas.getDevicePixelRatio();
		var backingStoreRatio = Canvas.getBackingStoreRatio(ctx);
		var ratio = devicePixelRatio / backingStoreRatio;

		// calculate fill width in pixels
		state.fillWidth = toPixels(state.style.fillWidth, state.root);
		state.railWidth = toPixels(state.style.railWidth, state.root);

		// handle various pixel densities
		if (devicePixelRatio !== backingStoreRatio) {

			state.visual.width = size * ratio;
			state.visual.height = size * ratio;

			state.visual.style.width = size + 'px';
			state.visual.style.height = size + 'px';

			ctx.scale(ratio, ratio);
		} else {
			state.visual.width = size;
			state.visual.height = size;
		}

		// background
		var padding = state.style.padding ? toPixels(state.style.padding, state.root) : 0;

		// calculate shadows if set
		state.fillShadow = state.style.fillShadow ? toCanvasShadow(state.style.fillShadow, state.root) : null;
		state.railShadow = state.style.railShadow ? toCanvasShadow(state.style.railShadow, state.root) : null;

		var paddingShadow = 0;
		if (state.fillShadow || state.railShadow) {
			paddingShadow = Math.max(getShadowArea(state.fillShadow), getShadowArea(state.railShadow));
		}

		var paddingWidth = 0;
		if (state.fillWidth || state.railWidth) {
			paddingWidth = Math.max(state.fillWidth, state.railWidth) * .5;
		}

		var radius = state.size - padding - paddingShadow - paddingWidth;
		state.fillRadius = Math.max(0, radius - state.fillWidth * .5);
		state.railRadius = Math.max(0, radius - state.railWidth * .5);

		// set ring offsets based on alignment
		if (state.style.railWidth === state.fillWidth) {
			state.railRadius = state.fillRadius;
		} else if (state.style.railWidth < state.fillWidth) {

			if (state.style.align === 'center') {
				state.railRadius = state.fillRadius;
			} else if (state.style.align === 'bottom') {
				state.railRadius = radius - (state.fillWidth - state.railWidth * .5);
			} else if (state.style.align === 'inside') {
				state.railRadius = radius - (state.fillWidth + state.railWidth * .5);
			}
		} else {

			if (state.style.align === 'center') {
				state.fillRadius = state.railRadius;
			} else if (state.style.align === 'bottom') {
				state.fillRadius = radius - (state.railWidth - state.fillWidth * .5);
			} else if (state.style.align === 'inside') {
				state.fillRadius = radius - (state.railWidth + state.fillWidth * .5);
			}
		}
	};

	var getShadowArea = function getShadowArea(shadow) {
		return shadow ? Math.max(Math.abs(shadow[0]), Math.abs(shadow[1])) + shadow[2] : 0;
	};

	var toCanvasShadow = function toCanvasShadow(shadow, root) {

		// limit shadow parts
		var parts = shadow.slice(0, 3).concat(shadow[shadow.length - 1]);

		// calculate actual values
		return parts.map(function (value, i) {

			if (i < 3) {
				return toPixels(value, root);
			}

			return toColor(value);
		});
	};

	/**
  * Ring Definition
  */
	return function (root) {

		var state = {
			size: null,
			visual: null,
			fillShadow: null,
			fillRadius: null,
			fillWidth: null,
			ringShadow: null,
			ringRadius: null,
			ringWidth: null
		};

		resizer(state);
		drawer(state, draw);

		return Object.assign({}, rooter(state, root, 'line'), updater(state), styler(state, {
			offset: 0, // 0 to 1
			length: 1, // 0 to 1
			gapSize: 0, // 0 to 1
			flip: false,
			invert: false,
			align: 'center', // 'top', 'inside', 'bottom'
			padding: 0, // padding
			capStyle: 'butt', // 'round'

			fillColor: '#333', // { colors: ['red', 'blue'], type: 'horizontal' }
			fillWidth: '.125em',
			fillShadow: null, // 1em 0 3px rgba(0, 0, 0, .333)

			railColor: '#eee', // { colors: ['red', 'blue'], type: 'follow' }
			railWidth: '.125em',
			railShadow: null // 1em 0 3px rgba(0, 0, 0, .333)
		}), destroyer(state));
	};
});

var index = (function (API) {
  return function (root) {
    return (/shape:\s*(?:ring|circle)/.test(root.dataset.style) ? createRing(API)(root) : createBar(API)(root)
    );
  };
});

module.exports = index;

	module.exports.identifier = {
		name:'line',
		type:'view'
	};
    return module.exports;
}()) : null;