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
      a?Ûc¿ªøùVVU×â„C…m¡â­†o¥K—çÌóz|ut"ÁóqödÌõNxÌ;¡aó:ª|ƒ˜ß2„…ƒ¨j­)ÜS«krX\9€¥9,WõVèOş4VVæ°ê\°-ú¾zT¸S©°B¶ó}#ï ›xèfT`jÅbtálÄ3F†¼h£út¼ë9RÎ‹È³
øõ£µ§Àû=æacGÕÔs1ˆM-Õ¸(‡K†¥&]F“˜jÒ3*ãqÆszéIŸB9úÏå8é1òÌÏË3ß“ÇæÎË —rjÙËİ*OÃˆ<r…ç“+‡ê¨*½|éıÈT>Œ?‡~ï¹Ë­¥Ú¯¢ñçJı¹¦ÚÚkõç:%$ª×ës7tTâ#9|t·vè”¦º­µf ŸÌáÓ5Sñ`wÔñ=y?	–ùÃşÜG’°ß¥	ûßBT¨D…áÂ< D…Q¡bÕI® C_I·º
'àjâqªğ>œF¼×bvã| «p­t#-{qú(Ñ¼;ğ1ÎŞÂ™[q;>;p>ÏÑcø†ğI<‹=ó.ryÌz˜ÏçEº€\/Áçğ 1¿g‘ÇƒÄşóô¯‡8Ò|ÀlãÚÁ÷<ßûò
õlÉááæ!tL•êA<Şâ[±³ªKs9<Q5{1KŸâOûnŸÌ®:àíşyÕ»ò:eˆô­İewÀ}t/ĞP_Íáë­Ši¯Ôø?‰ïòºë÷--Ü'g¾Œ×–†ğCšüß–Yá€e…OâÇx¯µ…şÿØ‰šÂ1oâ{?]ı#3ËŠÂÖ(‡'ñŸh[á¢‘QM`tû¯søï'ğ»‘¥Ò?æ‰¬ÃÕ·™~=‡?/•…ö „Lÿæ.ïÃd¾¼é¾	:ÂEOHÁ <ĞÂ”;'ü›”“b*(µÉ×eê²IáIá@N¦ï.”²Â2ÿŞ7_Ü‡ÒÖÊœÌòšœœğ„Ì}”^-OËA™C?Pÿü–òw/Ü½ô£ûè­÷ÓGàåiãø>úçƒôÏ‡˜5¾€ÆjzŞf<­|^†Fs&«ˆåµôÈëñ½õ w>CªƒôÏçøï ^àè%<ïrô¼ˆßñíøªøğ’ØxYfàk2_—*>á²ßäì¼ö|‹·‹oK¯°%~Uvâûò)öüPÆd?”ƒø‰<‡ŸÊ‹ø™¼ŒŸË79ş~eââ&F=Ù‹‹ ¼,¥’(L#
URÍ¸(Ã‰RÃüèC‚W¥S¥–£«¤INãœ×ğz§«…¸^ªe÷p‹Ì•Å”Ğ¢¿‘Ó9
R¯Ë»ME”¶C–2ÊC”Ï’3äLL¢tÅònYÆb¾œRÄPô&fYr–…™şœô&–Xr¶È0…dAÜ%3e†¯š¿×X’Š†™)o%†Y¼}ùI}Î)¦ì+ó™õ[”_«ú”*ÿH©òòª&>Î]WöçdEåœÓQ]”ºıR_ù¸ÔHcNV3jŞÕ…paNÎÓ/'}I3s¯´ædõ[Ø¬áâšY;†M ğØ¬Q'V6k†d½no?tûF.nMc¶[aËÛ¾QÃD·o’Íº}·¦ã$Kğ{–Æ?ğı4ØŸX^_gézƒ)ùÏ4ô_	ğßèêÇZ¼É<vQˆæbá:	âf)Â	±ƒŸ„ÏÒy¥”—¯itÔéø”Ñ)gà2¯ËñÆ×ºĞçSóùòü¹Ô+Ï?óÊó)tó(¥ôs×ıÒÉQ!ü%ÒÅQ ßÃ‰q¤ÿsÅI×,Sp™*İÍU¾Å-C²­Cc¿šÆHTÓ2‰AIµ2\Ş^IkK6';Fa9YE”¹Œy°åL—ù8Ï“eHN“…c*û¢‘hÂBy\i*û)r=½€œ¦È{åj­ìzçôD¼„ïÚ¼M©z“«_@QUauN®Q|£ı,¦ §3T–é÷¦äq›b‚IÌèZíËL0±'£¯Ëî8h” A¢.8«ü.héÉ”çäC-ZOZ}KıûPRSæ¯.£'Úvû¥ÌØ;ü[ì#ùÄZîÊG5$ˆÙt³ìåäfB{ë¨ôKÙwBÎ¦ô+ß¹(“:'õL,¨äs‰¬Âr‰ YÎÇZ¦´‹¥…ÖÕc
w4i‡ÜN€y5Áò	éqX)Ÿdâñ±·a’‘Í4Ñ®ú³à&\…LŒı)LDÉş3E?“å0Ó=`¶åqŸöÇîıGºtB—¡D¨ètĞ¹ØÒÊEt ÍDç"œÅHh¤¿¯§§_Dßv¤›1·uBÛòuzGhn¡ùy„ÖGháÄİ–¤W¸O»ı†„4Ñ},‚á÷²ÚÆ±¨]¨//¸{tbTõ
º¤¨zfÉåX$iÔKfÌ=©!¯ÚrW5#rÃ\(P‘5¥Ÿ3¬ájŞ
ø&íã§VŸ¢~wÉİ~»(’z@yUIENî9»ªd!+ª÷_:;'ŸQ#>’Ï	¥ëŒnK®bH¾—²_cd>İe‘Ërù¬¹.Y\¥/`0O–Ï™ŠJØåA®ò!Ÿ—‡<1Ú½[d)³Á”ªùBNÙƒBÿC¾‡I7ğä DnƒVişäR÷ä‘4PÂácò¸çíZÆ-.\ìõ-®Ùö¯pŸO,3&–zËÍ¾¥}˜Yö—±d	J¸­Øî€”fïşeu•7¡íUØ`ïğKÕäÅ5×6ÆZP>Mqï@Xîd®¾›ÉóÔÈ½XÁç*ù›¯;±I0êœçÊç©³ Ul/–Pú ÖÉG(aÆxÊ FƒIµ~V«^CR‰Ùòe€sàÆÓï«t˜¦3˜K;ÓC˜IÎN&ëC(	ŞÓ,~®…Î7wu&Z,¶ô™ç‹lm¥±3úØîWŸ£L&ßg°óË—ïÅñleù <7+®Ï=EoyšP>KÖÇX¾8oùbù
;¬¼åƒ¬/¨ãÊ‹ò’)g~Ü`Álë>×{ÏÍîóÿ PK
    À±B…áïI  f  K   com/ibm/datatools/routines/oledb/ui/wizard/pages/OLEDBCreatePageStart.class¥X|S×yÿ–äkäkƒ&8&`Ş¶lÄM0¡1¶%²¡X˜@šÙºØ—È’#É<’-]·µ[÷,{®Ùš=Ø–l#4ÈmiÓìE×fİ³{5Ûº¬İ³{t[÷ÊRØÿ;÷ZØ¸Àà‡Î9ßùî÷~>wå¯ Ø*]ªı£Ù‰¨;2M%ÉB6›ÎGsÙ©‚›qòÑlÚID§Üè	÷©d.Lº7Şß·³7ç$Î>†
É\ÁBPpïlRçD:9•wr>‘|tĞ9÷aú½…jÁ¶y¤¸ÿ,Ö5‚Öln,êŒ¦İÉ¼ÍŸ(ğ‹Ô˜SÈGãn¾àdœœ…°`ûl.„Ld3Ê#å&Ç2Ù<%ßt´Ï;ºù2[°îz>Îq'C6Ù”{ôÔªÀ*œ,&'Áæø|LG³™BNACT%áœ,tÂ„fœÑ‚›ÍöÅ+YVÒğp»…SÑü“d‘)8¹L2Í›œ-“ˆö–¶±ÌÑ,é×—Tİ•NåÔ¸¼Ü—äqñ£ñcÉãÉh:™‹rnfŒ_Õ(ß‚«Á‰lŠªY¾ô‚5ñÙ¿7;1I+£×Hœ$§è9ÁÊù>Q1­©ÔQÏ†sÉÎ3‚&’FıPbÿ‘}=»û$b‰x¿`I	Ğ×?Ô»?¶/Û;èãöø`AC	ß7jºReÜÂA ­}˜úöRß¬`m6V`¹î"6Vz»N­Şn“UX.XgôNMŒ8¹Dr$mÔÈ&ÓÃÉœ«gX½İgµ´m¶–±öá0¸ÇÆÜ+hš¥}X™¾ÍFuw¿ÅX¢»nMŞîKÑháí‚E×ó¾ÇÆNô
ìãÉ´›ò“Ë(X¯ûmìÂnj”w
z£>M;bÛ+ÿ¶ğ c,Şïoœ|^ÓØF\­Ô<”èÙŸ({Î÷EÏàn%;hc¯bµèÛuä`ìğ‘2¶ñŸÁŞ;?¤Èï°±_‘ï(#]ãXÅIØ8`Ø&G”¦ÂæÎÄàPïşUø GpHCÌ)$¨FÂTÿÄæ²>Pw™»çHôÛ¨¤Œì`ÆÄtH³Œ„ëFFïL²­o»‰lÓÀ$mŒ`e÷H$ÜBÚésò£C^=P””G[£¾9´Á›âv8ˆã6îÀ2e{ÌÆ8ÂüóØjW5a#£·¾P3Uch¦(VO1õI9Íõ•ê§À‚)Ö¨úæÜIıĞÂ	Áªo*jÇqJSî)Á†›QŸijá[æ NbDwçÜTÜlÃxÏ(é5¸û6ïA#ã,35Ñ›MOMdòÊû;l¼ß)X@é½ÏXao,‡‡Ò­2|ëê<2ô10Ã8÷«ß­ék
Ìq|ÀÆ÷âûj%Šz]ÁÙ;rŒö7!_56gÑŸ¥n·¢¦h˜ùP•›ÆÔWG“SéJ—±’·µÏÎ;Íå±ñ£&ßoP¨óg”u·LYãL»¬ –À™“†æÛ¨C}Ïá'-üËø­µmÁö,RÕc;ğS6~ZaAŠ<¡€Ÿµq?ÇèM;™±Â¸)°1×_°qgTŠm´¨N¢yÏz0úÄ@rÒïâzRÏdƒâ_°ÑŒ;ÃxY¥¾(¸kŞ¦Zƒi2zG\™~ÜÆ'´è×»ùÊ¢®ø¤O™~àæ‡“é)gXÛ‚^|ÚÆ«ø^¨Eg$Á}tÑíŒVİ*Ç¯Ùøuü†ÆŞxöDÑûÛn¦FôgğY¿)¸çv(Øøœº­uìšÚqĞ-Œïrsù²Ş*üoÙø¼mı¹\6ç·7=â	ºnO	Ö„	3RzÁ:Gºfğì×C·7,ü/à*ãÉL*í˜+Áê×™a”{íÍpâ‘š‘µ—|Æ&ùÛsXYö×ñIFÏß6¥ñ6¾„¿¤©œöLcÀı·'ÛÌ@ßİ>»Zø+¶¯28FVcN.Œ7ğ­‰Î™º`(Œ¿Åß[ø»[‹HS\pgãğU™Nì¬ m±Øa­¯ãÓÏÇİÿû“Šş‡ıÉŞ®q¶âDu3)ç¤…ÿ¸fô®Ëòš–?êMå’š;ıigÂH¸µíÚIÁ<UrS™‚;áDcs}cJÄÿØ83ºû_oáltîA3J1b¯#zìhrÔ™´b½u•Sò-?P½¯Ã¸"bK•¨°V9wdJåd¥º»­ıÑ[U«FBŒ´_ÊkÅ’–ğ!»éÖèØ–Z¯÷<™3!ÎTgƒØ“¤Î–zYÈˆrœJ¦ó7hù‰zÏ:CNšM÷ b°Î”#ônÊ´İ^°Q1òŞrËfd¸ZÒdIó<½/qÒaY†Sd¹-wi‹m)úÜ8`6şSÈ²Ò–V-íšu^K?g”Ê´İ’ÔiYgËzßêÇ³9÷)E2=4™Ìè½"I»-%H¦Rzî´e£Î]ÕycEEmÙ,[X­‰Rşïƒõ|k|³ÿÑğŞé‘ôİó=¦îÚN†²S¹Qg—«“Dó\Mêv>]).‚Áâ[·õÜs.¸.Ä"³ò¥iV¾3ÍÚä¯K}8G|³r21+'³ŞeÖúx6ëJmõ×Ufm@VcåXËS?WıÓÔ¸î£Ø ?íúÓ¡?_âE¢ü]J.ş¾aÜGQï§PíØl0@"[°Õ'ùp=é˜Æİ‘ÀEtEä"îÓŸmzÜ©ùv($hÖm‘å
Œñ`}°‡’\À EJrû(J$pCE—EÚA!€Š¥H›yÚB‘¶Ò*;©i/…ëÃ&>¬»°Û9ÎîÄÃ<Åùw	>{UôVOPÆ£Æ
ğNÚHÌî1Z»Šûwáˆ¯Ø±UÙ”ôñH¤£ˆÑ‹‹D^ÆX®¿¦¯7Ú#ôÌ!úø0ıø(}äÎK=J%Î+¥Wpú ôùõşÀÂÈl(b’K{ù2ƒz#~š¡4Á}Ö¶½O|ÂA}|úä5al¾„ã‡:Ó89p	OšÆ·n¬¾ˆwwn,âÛ/áô¡† ¦ñ¾mÁÎæ`ßÓy¾Äo9/?}Ò4âñ$Íu
mxŠ¦~Úğ¿ÇãQRl³¯XëMàVñËø~ü eoc(ş ~ˆrõµêËyïLL•­6J=_a9)1Ÿàƒ8ã“ØÁU±ª/à‡ãeÂúÙ½XA«ºd¬*ü˜ñ¿è{Á§ÕiÎ¤ ç¯“ç•
ƒWù4„fù2G¨Ò_ÃÈøP.âùxÇe„8?óaÔjÀÿüE¼ÀÛ”tÀn¤ÀgY^£xŸ§­¾P!êŸM-UşE#ê/™Ô®zK-ì°x„ÑæñÜOÄ†–aaKğy„Éj[KçĞK%n^}‰Ş`ñùrER4”Ü€_¦TbvÊ³Êğ@x¾¤íÃ¾–ÉK—Q§K=‡Pc±¬g¹¯VXn‰ÏH‰Z¨jè±Œûv2…=ÂOøi°öúØY„‚/ª=/c™gÖKÏ¢>âm_)âW/–xyù÷uRıO*ø«å7°W*xo¨àMï/há/K>ãı¾ÿêè´ZM÷ËE¼víd‚R[ê*¼TW²]~¿ã{‰S®¿‹ß+E©G¿:"Óøır´›(J/wÌ¥ºû#ü±±öŸàO=ZìƒAÂÇ(æè ©ş|pã«x£ˆ/wÕ<]MÁågaÎ!üşF‹2ÏbQ„IŞªv«"Hâ·…šC—aGšC´é9Ôhq>XÖ½‹šAVPÄ•¨•V,‘UˆÈjl‘µè’u|ÚùÀpèÀ ›òAÙ‚wÊ=F %uÃ?áŸ©Fˆ¡û/ø•­¥éÿÿF^KX¸ÿİäDŒíPm2¶ìFè*“!Ä€·ğ:ÿ}m•‘«¼½4`i~Ë,|æM’ÆÃùv{;ÙiQ;Hkl·yV
lo9‹~êüßüyóU\ÜXlºªÏams°©zëb	~\ª« –ê,Š}üü{«¥©º9øÊG®~QÊ¿‰ZAz±Pva±ìÁ2‰¡UÂz‰£SÑ-{Ñ'ûğÏdÈXj'šo©…ØÃ”û_†¤Ád¢NP²˜<Ö#*K¤‰êusd
ñ6ÄØ):4T›%P]÷ ís,5‰)W,Æ3a6”¯š›‰ªP“6™™Ê-›±8sI–êhxÓrç@çi)Ê
m,Ó²j]FVG.áåC‹ìiYs/•{ÎàÆĞEY«•ƒX|Óo²Ñø!cü;õ¶9Tá€¢´y&Ñä_áïshR¤@Q:t]T)Ê¦rìîbƒ<Æœ}=q-”»UF°IFq¿¤¨·ƒ]2½âbX1nÓ˜äú´dğ™ÄûåI|Pò:SŠå3~