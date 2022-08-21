/* Flot plugin for adding the ability to pan and zoom the plot.

Copyright (c) 2007-2014 IOLA and Ole Laursen.
Copyright (c) 2016 Ciprian Ceteras.
Copyright (c) 2017 Raluca Portase.
Licensed under the MIT license.

*/

/**
## jquery.flot.navigate.js

This flot plugin is used for adding the ability to pan and zoom the plot.
A higher level overview is available at [interactions](interactions.md) documentation.

The default behaviour is scrollwheel up/down to zoom in, drag
to pan. The plugin defines plot.zoom({ center }), plot.zoomOut() and
plot.pan( offset ) so you easily can add custom controls. It also fires
"plotpan" and "plotzoom" events, useful for synchronizing plots.

The plugin supports these options:
```js
    zoom: {
        interactive: false,
        active: false,
        amount: 1.5         // 2 = 200% (zoom in), 0.5 = 50% (zoom out)
    }

    pan: {
        interactive: false,
        active: false,
        cursor: "move",     // CSS mouse cursor value used when dragging, e.g. "pointer"
        frameRate: 60,
        mode: "smart"       // enable smart pan mode
    }

    xaxis: {
        axisZoom: true, //zoom axis when mouse over it is allowed
        plotZoom: true, //zoom axis is allowed for plot zoom
        axisPan: true, //pan axis when mouse over it is allowed
        plotPan: true, //pan axis is allowed for plot pan
        panRange: [undefined, undefined], // no limit on pan range, or [min, max] in axis units
        zoomRange: [undefined, undefined], // no limit on zoom range, or [closest zoom, furthest zoom] in axis units
    }

    yaxis: {
        axisZoom: true, //zoom axis when mouse over it is allowed
        plotZoom: true, //zoom axis is allowed for plot zoom
        axisPan: true, //pan axis when mouse over it is allowed
        plotPan: true //pan axis is allowed for plot pan
        panRange: [undefined, undefined], // no limit on pan range, or [min, max] in axis units
        zoomRange: [undefined, undefined], // no limit on zoom range, or [closest zoom, furthest zoom] in axis units
    }
```
**interactive** enables the built-in drag/click behaviour. If you enable
interactive for pan, then you'll have a basic plot that supports moving
around; the same for zoom.

**active** is true after a touch tap on plot. This enables plot navigation.
Once activated, zoom and pan cannot be deactivated. When the plot becomes active,
"plotactivated" event is triggered.

**amount** specifies the default amount to zoom in (so 1.5 = 150%) relative to
the current viewport.

**cursor** is a standard CSS mouse cursor string used for visual feedback to the
user when dragging.

**frameRate** specifies the maximum number of times per second the plot will
update itself while the user is panning around on it (set to null to disable
intermediate pans, the plot will then not update until the mouse button is
released).

**mode** a string specifies the pan mode for mouse interaction. Accepted values:
'manual': no pan hint or direction snapping;
'smart': The graph shows pan hint bar and the pan movement will snap
to one direction when the drag direction is close to it;
'smartLock'. The graph shows pan hint bar and the pan movement will always
snap to a direction that the drag diorection started with.

Example API usage:
```js
    plot = $.plot(...);

    // zoom default amount in on the pixel ( 10, 20 )
    plot.zoom({ center: { left: 10, top: 20 } });

    // zoom out again
    plot.zoomOut({ center: { left: 10, top: 20 } });

    // zoom 200% in on the pixel (10, 20)
    plot.zoom({ amount: 2, center: { left: 10, top: 20 } });

    // pan 100 pixels to the left (changing x-range in a positive way) and 20 down
    plot.pan({ left: -100, top: 20 })
```

Here, "center" specifies where the center of the zooming should happen. Note
that this is defined in pixel space, not the space of the data points (you can
use the p2c helpers on the axes in Flot to help you convert between these).

**amount** is the amount to zoom the viewport relative to the current range, so
1 is 100% (i.e. no change), 1.5 is 150% (zoom in), 0.7 is 70% (zoom out). You
can set the default in the options.
*/

/* eslint-enable */
(function($) {
    'use strict';

    var options = {
        zoom: {
            interactive: false,
            active: false,
            amount: 1.5 // how much to zoom relative to current position, 2 = 200% (zoom in), 0.5 = 50% (zoom out)
        },
        pan: {
            interactive: false,
            active: false,
            cursor: "move",
            frameRate: 60,
            mode: 'smart'
        },
        recenter: {
            interactive: true
        },
        xaxis: {
            axisZoom: true, //zoom axis when mouse over it is allowed
            plotZoom: true, //zoom axis is allowed for plot zoom
            axisPan: true, //pan axis when mouse over it is allowed
            plotPan: true, //pan axis is allowed for plot pan
            panRange: [undefined, undefined], // no limit on pan range, or [min, max] in axis units
            zoomRange: [undefined, undefined] // no limit on zoom range, or [closest zoom, furthest zoom] in axis units
        },
        yaxis: {
            axisZoom: true,
            plotZoom: true,
            axisPan: true,
            plotPan: true,
            panRange: [undefined, undefined], // no limit on pan range, or [min, max] in axis units
            zoomRange: [undefined, undefined] // no limit on zoom range, or [closest zoom, furthest zoom] in axis units
        }
    };

    var saturated = $.plot.saturated;
    var browser = $.plot.browser;
    var SNAPPING_CONSTANT = $.plot.uiConstants.SNAPPING_CONSTANT;
    var PANHINT_LENGTH_CONSTANT = $.plot.uiConstants.PANHINT_LENGTH_CONSTANT;

    function init(plot) {
        plot.hooks.processOptions.push(initNevigation);
    }

    function initNevigation(plot, options) {
        var panAxes = null;
        var canDrag = false;
        var useManualPan = options.pan.mode === 'manual',
            smartPanLock = options.pan.mode === 'smartLock',
            useSmartPan = smartPanLock || options.pan.mode === 'smart';

        function onZoomClick(e, zoomOut, amount) {
            var page = browser.getPageXY(e);

            var c = plot.offset();
            c.left = page.X - c.left;
            c.top = page.Y - c.top;

            var ec = plot.getPlaceholder().offset();
            ec.left = page.X - ec.left;
            ec.top = page.Y - ec.top;

            var axes = plot.getXAxes().concat(plot.getYAxes()).filter(function (axis) {
                var box = axis.box;
                if (box !== undefined) {
                    return (ec.left > box.left) && (ec.left < box.left + box.width) &&
                        (ec.top > box.top) && (ec.top < box.top + box.height);
                }
            });

            if (axes.length === 0) {
                axes = undefined;
            }

            if (zoomOut) {
                plot.zoomOut({
                    center: c,
                    axes: axes,
                    amount: amount
                });
            } else {
                plot.zoom({
                    center: c,
                    axes: axes,
                    amount: amount
                });
            }
        }

        var prevCursor = 'default',
            panHint = null,
            panTimeout = null,
            plotState,
            prevDragPosition = { x: 0, y: 0 },
            isPanAction = false;

        function onMouseWheel(e, delta) {
            var maxAbsoluteDeltaOnMac = 1,
                isMacScroll = Math.abs(e.originalEvent.deltaY) <= maxAbsoluteDeltaOnMac,
                defaultNonMacScrollAmount = null,
                macMagicRatio = 50,
                amount = isMacScroll ? 1 + Math.abs(e.originalEvent.deltaY) / macMagicRatio : defaultNonMacScrollAmount;

            if (isPanAction) {
                onDragEnd(e);
            }

            if (plot.getOptions().zoom.active) {
                e.preventDefault();
                onZoomClick(e, delta < 0, amount);
                return false;
            }
        }

        plot.navigationState = function(startPageX, startPageY) {
            var axes = this.getAxes();
            var result = {};
            Object.keys(axes).forEach(function(axisName) {
                var axis = axes[axisName];
                result[axisName] = {
                    navigationOffset: { below: axis.options.offset.below || 0,
                        above: axis.options.offset.above || 0},
                    axisMin: axis.min,
                    axisMax: axis.max,
                    diagMode: false
                }
            });

            result.startPageX = startPageX || 0;
            result.startPageY = startPageY || 0;
            return result;
        }

        function onMouseDown(e) {
            canDrag = true;
        }

        function onMouseUp(e) {
            canDrag = false;
        }

        function isLeftMouseButtonPressed(e) {
            return e.button === 0;
        }

        function onDragStart(e) {
            if (!canDrag || !isLeftMouseButtonPressed(e)) {
                return false;
            }

            isPanAction = true;
            var page = browser.getPageXY(e);

            var ec = plot.getPlaceholder().offset();
            ec.left = page.X - ec.left;
            ec.top = page.Y - ec.top;

            panAxes = plot.getXAxes().concat(plot.getYAxes()).filter(function (axis) {
                var box = axis.box;
                if (box !== undefined) {
                    return (ec.left > box.left) && (ec.left < box.left + box.width) &&
                        (ec.top > box.top) && (ec.top < box.top + box.height);
                }
            });

            if (panAxes.length === 0) {
                panAxes = undefined;
            }

            var c = plot.getPlaceholder().css('cursor');
            if (c) {
                prevCursor = c;
            }

            plot.getPlaceholder().css('cursor', plot.getOptions().pan.cursor);

            if (useSmartPan) {
                plotState = plot.navigationState(page.X, page.Y);
            } else if (useManualPan) {
                prevDragPosition.x = page.X;
                prevDragPosition.y = page.Y;
            }
        }

        function onDrag(e) {
            if (!isPanAction) {
                return;
            }

            var page = browser.getPageXY(e);
            var frameRate = plot.getOptions().pan.frameRate;

            if (frameRate === -1) {
                if (useSmartPan) {
                    plot.smartPan({
                        x: plotState.startPageX - page.X,
                        y: plotState.startPageY - page.Y
                    }, plotState, panAxes, false, smartPanLock);
                } else if (useManualPan) {
                    plot.pan({
                        left: prevDragPosition.x - page.X,
                        top: prevDragPosition.y - page.Y,
                        axes: panAxes
                    });
                    prevDragPosition.x = page.X;
                    prevDragPosition.y = page.Y;
                }
                return;
            }

            if (panTimeout || !frameRate) return;

            panTimeout = setTimeout(function() {
                if (useSmartPan) {
                    plot.smartPan({
                        x: plotState.startPageX - page.X,
                        y: plotState.startPageY - page.Y
                    }, plotState, panAxes, false, smartPanLock);
                } else if (useManualPan) {
                    plot.pan({
                        left: prevDragPosition.x - page.X,
                        top: prevDragPosition.y - page.Y,
                        axes: panAxes
                    });
                    prevDragPosition.x = page.X;
                    prevDragPosition.y = page.Y;
                }

                panTimeout = null;
            }, 1 / frameRate * 1000);
        }

        function onDragEnd(e) {
            if (!isPanAction) {
                return;
            }

            if (panTimeout) {
                clearTimeout(panTimeout);
                panTimeout = null;
            }

            isPanAction = false;
            var page = browser.getPageXY(e);

            plot.getPlaceholder().css('cursor', prevCursor);

            if (useSmartPan) {
                plot.smartPan({
                    x: plotState.startPageX - page.X,
                    y: plotState.startPageY - page.Y
                }, plotState, panAxes, false, smartPanLock);
                plot.smartPan.end();
            } else if (useManualPan) {
                plot.pan({
                    left: prevDragPosition.x - page.X,
                    top: prevDragPosition.y - page.Y,
                    axes: panAxes
                });
                prevDragPosition.x = 0;
                prevDragPosition.y = 0;
            }
        }

        function onDblClick(e) {
            plot.activate();
            var o = plot.getOptions()

            if (!o.recenter.interactive) { return; }

            var axes = plot.getTouchedAxis(e.clientX, e.clientY),
                event;

            plot.recenter({ axes: axes[0] ? axes : null });

            if (axes[0]) {
                event = new $.Event('re-center', { detail: {
                    axisTouched: axes[0]
                }});
            } else {
                event = new $.Event('re-center', { detail: e });
            }
            plot.getPlaceholder().trigger(event);
        }

        function onClick(e) {
            plot.activate();

            if (isPanAction) {
                onDragEnd(e);
            }

            return false;
        }

        plot.activate = function() {
            var o = plot.getOptions();
            if (!o.pan.active || !o.zoom.active) {
                o.pan.active = true;
                o.zoom.active = true;
                plot.getPlaceholder().trigger("plotactivated", [plot]);
            }
        }

        function bindEvents(plot, eventHolder) {
            var o = plot.getOptions();
            if (o.zoom.interactive) {
                eventHolder.mousewheel(onMouseWheel);
            }

            if (o.pan.interactive) {
                plot.addEventHandler("dragstart", onDragStart, eventHolder, 0);
                plot.addEventHandler("drag", onDrag, eventHolder, 0);
                plot.addEventHandler("dragend", onDragEnd, eventHolder, 0);
                eventHolder.bind("mousedown", onMouseDown);
                eventHolder.bind("mouseup", onMouseUp);
            }

            eventHolder.dblclick(onDblClick);
            eventHolder.click(onClick);
        }

        plot.zoomOut = function(args) {
            if (!args) {
                args = {};
            }

            if (!args.amount) {
                args.amount = plot.getOptions().zoom.amount;
            }

            args.amount = 1 / args.amount;
            plot.zoom(args);
        };

        plot.zoom = function(args) {
            if (!args) {
                args = {};
            }

            var c = args.center,
                amount = args.amount || plot.getOptions().zoom.amount,
                w = plot.width(),
                h = plot.height(),
                axes = args.axes || plot.getAxes();

            if (!c) {
                c = {
                    left: w / 2,
                    top: h / 2
                };
            }

            var xf = c.left / w,
                yf = c.top / h,
                minmax = {
                    x: {
                        min: c.left - xf * w / amount,
                        max: c.left + (1 - xf) * w / amount
                    },
                    y: {
                        min: c.top - yf * h / amount,
                        max: c.top + (1 - yf) * h / amount
                    }
                };

            for (var key in axes) {
                if (!axes.hasOwnProperty(key)) {
                    continue;
                }

                var axis = axes[key],
                    opts = axis.options,
                    min = minmax[axis.direction].min,
                    max = minmax[axis.direction].max,
                    navigationOffset = axis.options.offset;

                //skip axis without axisZoom when zooming only on certain axis or axis without plotZoom for zoom on entire plot
                if ((!opts.axisZoom && args.axes) || (!args.axes && !opts.plotZoom)) {
                    continue;
                }

                min = $.plot.saturated.saturate(axis.c2p(min));
                max = $.plot.saturated.saturate(axis.c2p(max));
                if (min > max) {
                    // make sure min < max
                    var tmp = min;
                    min = max;
                    max = tmp;
                }

                // test for zoom limits zoomRange: [min,max]
                if (opts.zoomRange) {
                    // zoomed in too far
                    if (max - min < opts.zoomRange[0]) {
                        continue;
                    }
                    // zoomed out to far
                    if (max - min > opts.zoomRange[1]) {
                        continue;
                    }
                }

                var offsetBelow = $.plot.saturated.saturate(navigationOffset.below - (axis.min - min));
                var offsetAbove = $.plot.saturated.saturate(navigationOffset.above - (axis.max - max));
                opts.offset = { below: offsetBelow, above: offsetAbove };
            };

            plot.setupGrid(true);
            plot.draw();

            if (!args.preventEvent) {
                plot.getPlaceholder().trigger("plotzoom", [plot, args]);
            }
        };

        plot.pan = function(args) {
            var delta = {
                x: +args.left,
                y: +args.top
            };

            if (isNaN(delta.x)) delta.x = 0;
            if (isNaN(delta.y)) delta.y = 0;

            $.each(args.axes || plot.getAxes(), function(_, axis) {
                var opts = axis.options,
                    d = delta[axis.direction];

                //skip axis without axisPan when panning only on certain axis or axis without plotPan for pan the entire plot
                if ((!opts.axisPan && args.axes) || (!opts.plotPan && !args.axes)) {
                    return;
                }

                // calc min delta (revealing left edge of plot)
                var minD = axis.p2c(opts.panRange[0]) - axis.p2c(axis.min);
                // calc max delta (revealing right edge of plot)
                var maxD = axis.p2c(opts.panRange[1]) - axis.p2c(axis.max);
                // limit delta to min or max if enabled
                if (opts.panRange[0] !== undefined && d >= maxD) d = maxD;
                if (opts.panRange[1] !== undefined && d <= minD) d = minD;

                if (d !== 0) {
                    var navigationOffsetBelow = saturated.saturate(axis.c2p(axis.p2c(axis.min) + d) - axis.c2p(axis.p2c(axis.min))),
                        navigationOffsetAbove = saturated.saturate(axis.c2p(axis.p2c(axis.max) + d) - axis.c2p(axis.p2c(axis.max)));

                    if (!isFinite(navigationOffsetBelow)) {
                        navigationOffsetBelow = 0;
                    }

                    if (!isFinite(navigationOffsetAbove)) {
                        navigationOffsetAbove = 0;
                    }

                    opts.offset = {
                        below: saturated.saturate(navigationOffsetBelow + (opts.offset.below || 0)),
                        above: saturated.saturate(navigationOffsetAbove + (opts.offset.above || 0))
                    };
                }
            });

            plot.setupGrid(true);
            plot.draw();
            if (!args.preventEvent) {
                plot.getPlaceholder().trigger("plotpan", [plot, args]);
            }
        };

        plot.recenter = function(args) {
            $.each(args.axes || plot.getAxes(), function(_, axis) {
                if (args.axes) {
                    if (this.direction === 'x') {
                        axis.options.offset = { below: 0 };
                    } else if (this.direction === 'y') {
                        axis.options.offset = { above: 0 };
                    }
                } else {
                    axis.options.offset = { below: 0, above: 0 };
                }
            });
            plot.setupGrid(true);
            plot.draw();
        };

        var shouldSnap = function(delta) {
            return (Math.abs(delta.y) < SNAPPING_CONSTANT && Math.abs(delta.x) >= SNAPPING_CONSTANT) ||
                (Math.abs(delta.x) < SNAPPING_CONSTANT && Math.abs(delta.y) >= SNAPPING_CONSTANT);
        }

        // adjust delta so the pan action is constrained on the vertical or horizontal direction
        // it the movements in the other direction are small
        var adjustDeltaToSnap = function(delta) {
            if (Math.abs(delta.x) < SNAPPING_CONSTANT && Math.abs(delta.y) >= SNAPPING_CONSTANT) {
                return {x: 0, y: delta.y};
            }

            if (Math.abs(delta.y) < SNAPPING_CONSTANT && Math.abs(delta.x) >= SNAPPING_CONSTANT) {
                return {x: delta.x, y: 0};
            }

            return delta;
        }

        var lockedDirection = null;
        var lockDeltaDirection = function(delta) {
            if (!lockedDirection && Math.max(Math.abs(delta.x), Math.abs(delta.y)) >= SNAPPING_CONSTANT) {
                lockedDirection = Math.abs(delta.x) < Math.abs(delta.y) ? 'y' : 'x';
            }

            switch (lockedDirection) {
                case 'x':
                    return { x: delta.x, y: 0 };
                case 'y':
                    return { x: 0, y: delta.y };
                default:
                    return { x: 0, y: 0 };
            }
        }

        var isDiagonalMode = function(delta) {
            if (Math.abs(delta.x) > 0 && Math.abs(delta.y) > 0) {
                return true;
            }
            return false;
        }

        var restoreAxisOffset = function(axes, initialState, delta) {
            var axis;
            Object.keys(axes).forEach(function(axisName) {
                axis = axes[axisName];
                if (delta[axis.direction] === 0) {
                    axis.options.offset.below = initialState[axisName].navigationOffset.below;
                    axis.options.offset.above = initialState[axisName].navigationOffset.above;
                }
            });
        }

        var prevDelta = { x: 0, y: 0 };
        plot.smartPan = function(delta, initialState, panAxes, preventEvent, smartLock) {
            var snap = smartLock ? true : shouldSnap(delta),
                axes = plot.getAxes(),
                opts;
            delta = smartLock ? lockDeltaDirection(delta) : adjustDeltaToSnap(delta);

            if (isDiagonalMode(delta)) {
                initialState.diagMode = true;
            }

            if (snap && initialState.diagMode === true) {
                initialState.diagMode = false;
                restoreAxisOffset(axes, initialState, delta);
            }

            if (snap) {
                panHint = {
                    start: {
                        x: initialState.startPageX - plot.offset().left + plot.getPlotOffset().left,
                        y: initialState.startPageY - plot.offset().top + plot.getPlotOffset().top
                    },
                    end: {
                        x: initialState.startPageX - delta.x - plot.offset().left + plot.getPlotOffset().left,
                        y: initialState.startPageY - delta.y - plot.offset().top + plot.getPlotOffset().top
                    }
                }
            } else {
                panHint = {
                    start: {
                        x: initialState.startPageX - plot.offset().left + plot.getPlotOffset().left,
                        y: initialState.startPageY - plot.offset().top + plot.getPlotOffset().top
                    },
                    end: false
                }
            }

            if (isNaN(delta.x)) delta.x = 0;
            if (isNaN(delta.y)) delta.y = 0;

            if (panAxes) {
                axes = panAxes;
            }

            var axis, axisMin, axisMax, p, d;
            Object.keys(axes).forEach(function(axisName) {
      �a?�c�����VVU��C�m�⭆o�K����z|ut"��q�d��Nx�;�a�:�|���2����j�)܏S�krX\9��9,W�V�O��4VV��\�-��zT�S���B��}#���x�fT`j�bt�l��3F���h��t��9R΋ȳ�
�������=�acG��s1�M-��(�K��&]F��j�3*�q�sz�I��B9���8�1����3ߓ���ː �rj���*OÈ<r��+���*�|���T>��?�~����گ���J����ڏk��:%$���s7tT�#9|t�v蔏����f ����5S�`wԐ�=y?	�����G��ߥ	��BT�D���<�D�Q��b�I��C_I��
'�j�q��>�F��bv�| �p�t#-{q�(Ѽ;�1��[q;>�;p>��c���I<�=�.ry�z���E��\/��� 1�g�ǃ������8�|�l����<���
�l����!tL��A<��[���Ks9<Q5{1K��O�n�̮:����yՁ��:e����ew�}t/�P_��뭊i���?�����--�'g��ז��C��ߖYဏe�O��x�����؉��1o�{?]�#3ˊ��(�'�h[ᢑQM`t��s��'𻑥�?扬����~=�?/�����L��.��d���	:�EOH��<�;'����b*(���e�I�I�@N��.���2��7_܇��ʜ��򚜜���}�^-O�A�C?P����w/ܽ������G��i��>���χ�5���jz�f<��|^�Fs&���������� w>C������� ^��%<��r�����������xYf�k2_�*>�������|���oK��%~Uv���)��PƏd?�����<��ʋ������79�~e��&F=ً���,��(L#
UR͸(ÉR���C�W�S�����IN���z����^�e�p�̕ŔТ���9
R�˻ME��C�2�C�ϒ3�LL�t��nY�b��R�P�&fYr������&�Xr��0��dA�%3e�����X����)o%�Y�}�I}�)��+��[�_���*�H���&>�]W��dE吜�Q]���R_���HcNV�3j�ՅpaN�Ӂ/'}I3s���d�[ج��Y;�M �جQ'V6k�d�no?t�F.n�Mc�[a�۾Q�D�o�ͺ}����$K�{��?���4؟X^_g�z�)��4�_	�����Z��<vQ��b�:	�f)�	������y����it������)g�2����׺��S������+�?���)t�(��s����Q!�%��Q ���q��s�I�,Sp�*��U��-C��Cc���HT�2�AI�2\�^IkK6';Fa9YE����y��L��8�ϓeHN��c*���h�By�\i*�)r=�����{�j��z��D���ڼM�z��_@QUauN�Q|���,� �3T������q�b�I��Z��L0�'����8h� A�.8��.h�ɔ��C-ZOZ}K��PRS�.��'�v����;�[��#��Z��G5$��t����fB{��K�wBΦ�+߹(�:'�L,���s���r��Y��Z�������c
w4i��N�y5��	�qX)�d�񱷝a���4�����&\�L��)LD��3E?��0�=`��q�����G�tB��D���tй���Et��D�"��Hh�����_D�v��1�uB��uz��Ghn��y�֏Gh��ݖ��W�O����4�},�����Ʊ��]�//�{tbT�
���zf��X$i�Kf�=�!��rW5#r�\(P�5��3��j�
�&��V���~w�ݞ~�(�z@yUIEN�9��d!+���_:;'�Q#>��	��nK�bH���_cd>�e��r���.Y\�/`0O�ϙ�J��A��!���<1ڽ[d)�����BNكB�C��I7�䏠Dn�Vi��R��4P��c���Z�-.\���-����p�O,3&�z�;��}�Y����d	J���f��eu�7��U�`��KՏ��5�6�ZP>Mq�@X�d������ȽX��*���;�I0���穳 Ul/�P� ��G(a�x� F�I�~V�^CR���e��s�����t��3�K;�C�I�N&�C(	��,~���7wu&Z,����lm��3���W��L&�g�������le��<7+��=Eoy�P>K��X�8o�b�
;��僬/��ʋ�)g~�`�l�>�{����� PK
    ��B���I  f  K   com/ibm/datatools/routines/oledb/ui/wizard/pages/OLEDBCreatePageStart.class�X|S�y���k�k�&8&`޶l��M0�1�%��X�@�ٺؗȒ#�<�-]���[�,{��ٚ=ؖl#4�mi��E�fݳ{5ۺ�ݳ{t[��R��;�Zظ����9����~>w�� �*]���ى�;2M%�B6��Gs٩��q��l�I�D���	��d.�L��7�߷�7�$�>�
�\�BPp�lR�D:9�wr>�|t�9�a���j��y����,�5��ln,ꌦ�ɼ͟(��ԘS�G�n��d����`�l.�Ld3�#�&�2�<%�t��;��2[��z>�q'C6ٔ{����*�,&'���|LG��BNACT%�,tf�т����+YV��p���S���d�)8�L2͛�-��������,�חTݕN��Ը�ܗ��q��c���h:��rnf�_�(߂���l��Y��5�ٿ7;1I+��H�$��9���>Q1���Qφ�s��3�&�F�Pb��}=���$b�x�`I	��?Ի?�/�;����`AC	�7j��Re��A��}���R��`m6V`��"6Vz�N��n��UX.Xg�NM�8�Dr$m�Ȏ&��ɜ�gX��g��m�����0����+h��}X���Fuw���X��nM��K�h��E����N�
��ɴ���(X��m��nj�w
z�>M;b�+���c�,��o�|^��F\��<��ٟ({��E��n%;hc�b���u�`��2����;?��ﰱ_��(#]�X�I�8`�&G�������P���U���GpHC�)$�FT���>�Pw���H�ۨ���`��tH����FF�L��o��l��$m�`e�H$�B��s�C^=P��G[��9�����v8��6��2e{��8����jW5a#���P3Uch�(VO1�I9͍������)�����I���	��o*j�qJS�)���Q�ij�[� �N�bDw��T�l�x�(�5��6�A#�,35ћMOMd���;l��)X@��Xao,��ҭ2|��<2�10�8���߭�k
�q|�����j%��z]��;r��7!_56gџ�n���h��P����WG�S�J�������;����&�oP��g�u�LY�L���������ۨC}��'-�����m��,R�c;�S6~ZaA�<����q?��M;��¸)�1�_�qgT�m��N�y�z0��@r���zR�d��_�ь;�xY��(�kަZ�i2zG\�~��'��׻�ʢ����O�~�懓�)gXۂ^|�ƫ�^�Eg$�}t��V�*ǯ��u����x�D���n��F�g�Y�)��v(�����u��q�-��rs���*�o���m���\6�7�=�	�nO	ք	3Rz�:G�f���C�7,���/�*��L*�+��׏��a�{��p������|�&���sXY���IF��6��6�������Lc���'��@��>�Z�+��28FVcN.�7���Ι�`(����[��[�HS\pg��U�N� m��a�����������������q��Du3)礅��f���ˎ�?�M咚;�ig�H����I�<UrS��;�Dcs}cJ���8�3��_o�l�t�A3J1b�#z�hrԙ�b�u�S�-?P��ø"bK���V9wdJ�d������[U�FB���_�kŒ��!������Z��<�3!ΞTg�ؓ�ΖzYȈr��J��7h��z�:CN�M��b��Δ�#�nʴ�^�Q1��r�fd��Z�dI�<�/�q�aY�Sd�-wi�m)���8`6�S�ȲҖV-�u^K?�g���ݒ�iYg�z���ǳ9�)E2=4���"I�-%H�Rz�e��]�ycEEm�,[X��R���|k|���������=����N��S�Qg���D�\�M�v>]).���[���s.�.�"��iV�3���K}8G|�r21+'��e��x6�Jm��Ufm@Vc�X�S?W��Ը�ؠ?��ӡ?_�E��]J��.��a�GQ�P��l0@"[��'�p=��ݑ�EtE�"�ӟmz���v($h�m��
��`}���\� EJr�(J$pCE�E�A!���H�y�B���*;�i/���&>����9����<��w	>{U�VOPƣ�
�N�H��1Z���wሯ��U����H���ы�D^�X����7�#��!��0��(}��K=J%�+��Wp���������l(b�K{�2�z#~��4�}���O|�A}|��5al���:�89p	O�Ʒn���wwn,��/���� ��m���`��y��o9�/?}�4��$�u
mx��~����QRl��X�M�V���~� eoc(� ~�r����y�LL��6J=_a9)1����8���U��/���e��ٽXA��d�*����{���iΤ 篓�
�W�4�f��2G��_���P.��x�e�8?�a�j���E����t��n��gY^�x����P!��M-U�E#�/�ԮzK-�x�����OĆ�aaK�y��j[K��K%n^}��`��rER4�܀_�Tbvʳ��@x���þ����K�Q�K=�Pc���g��VXn��H�Z�j豌�v2�=�O�i�����Y��/�=/c�g�KϢ>�m_)�W/�xy��uR�O*���7�W*xo��M�/h�/K>������ZM��E�v��d�R[�*�TW�]~��{�S����+E�G�:"���r��(J/w����#������O=Z�A�(�蠩�|p�x��/w�<]M��ga�!��F�2��bQ�I��v�"H����C�aG�C��9�hq>Xֽ��AVPĕ��V,�U��jl���u|����p�� ��Aقw�=F���%u�?៩F���/�������F^KX����D��Pm2��F�*�!Ā��:�}�m�����4`i~�,|�M����v{;�iQ;Hkl��yV�
lo9�~����y�U\�Xl���ams��z�b	~\�����,�}��{����9��G�~Qʁ��ZAz�Pva���2��U�z��S�-{�'���d�Xj�'�o���Ô�_���d�NP���<�#*K���usd
�6��):4T�%P]� �s,5�)W,�3a6������P�6���-���8sI��hx�r�@�i)�
m,Ӳj�]FVG.��C��iYs/�{����EY���X|�o���!c�;��9Tဢ�y&��_��shR�@Q:t]T)ʦr��b�<Ɯ}=q-��UF�IFq�����]2���bX�1nӘ���d�����I|P�:S��3~