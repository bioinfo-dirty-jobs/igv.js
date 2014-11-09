/*
 * The MIT License (MIT)
 *
 * Copyright (c) $year. Broad Institute
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

/**
 * Created by turner on 9/23/14.
 */
/**
 * Created by turner on 9/19/14.
 */
var cursor = (function (cursor) {

    var minimumHorizontalScrollBarDraggableWidth = 6;

    cursor.HorizontalScrollbar = function (browser, horizontalScrollBarContainer) {

        this.browser = browser;
        this.markupWithParentDivObject(horizontalScrollBarContainer);

    };

    cursor.HorizontalScrollbar.prototype.update = function () {

        var horizontalScrollBarWidth = $(".igv-horizontal-scrollbar-div").first().width(),
            horizontalScrollBarDraggable = $(".igv-horizontal-scrollbar-draggable-div").first(),
            framePixelWidth = this.browser.cursorModel.framePixelWidth,
            regionListLength = this.browser.cursorModel.filteredRegions.length,
            referenceFrame = this.browser.referenceFrame,
            regionBoundsWidth,
            trackLeft,
            horizontalScrollBarDraggableLeft,
            width;

        regionBoundsWidth = framePixelWidth * regionListLength;

        width = Math.max(minimumHorizontalScrollBarDraggableWidth, (horizontalScrollBarWidth/regionBoundsWidth) * horizontalScrollBarWidth);

        trackLeft = referenceFrame.toPixels( referenceFrame.start );
        horizontalScrollBarDraggableLeft = (horizontalScrollBarWidth/regionBoundsWidth) * trackLeft;

        // handle minification with draggable near right edge of scroll bar.
        // must reposition AND scale draggable AND pan track
        if ((horizontalScrollBarDraggableLeft + width) > horizontalScrollBarWidth) {

            // reposition/rescale draggable
            horizontalScrollBarDraggableLeft -= ((horizontalScrollBarDraggableLeft + width) - horizontalScrollBarWidth);
            width = horizontalScrollBarWidth - horizontalScrollBarDraggableLeft;

            // pan track
            referenceFrame.start = referenceFrame.toBP( (regionBoundsWidth/horizontalScrollBarWidth) * horizontalScrollBarDraggableLeft );

            // update
            if (this.browser.ideoPanel) this.browser.ideoPanel.repaint();
            if (this.browser.karyoPanel) this.browser.karyoPanel.repaint();
            this.browser.trackPanels.forEach(function (trackPanel) { trackPanel.update(); });
        }

        $( horizontalScrollBarDraggable).css({
            "left": Math.floor( horizontalScrollBarDraggableLeft ) + "px",
            "width": Math.floor( width ) + "px"
        });

    };

    cursor.HorizontalScrollbar.prototype.markupWithParentDivObject = function (horizontalScrollBarContainer) {

        var myself = this,
            horizontalScrollBar,
            horizontalScrollBarShim,
            horizontalScrollBarDraggable,
            anyViewport,
            isMouseDown = undefined,
            lastMouseX = undefined,
            isMouseIn = undefined;



        horizontalScrollBarShim = $('<div class="igv-horizontal-scrollbar-shim-div">')[0];
        horizontalScrollBarContainer.append(horizontalScrollBarShim);

        anyViewport = $("div.igv-viewport-div").first();
        $( horizontalScrollBarShim).css("left",  anyViewport.css("left"));
        $( horizontalScrollBarShim).css("right", anyViewport.css("right"));


        horizontalScrollBar = $('<div class="igv-horizontal-scrollbar-div">')[0];
        $(horizontalScrollBarShim).append(horizontalScrollBar);

        horizontalScrollBarDraggable = $('<div class="igv-horizontal-scrollbar-draggable-div">')[0];
        $(horizontalScrollBar).append(horizontalScrollBarDraggable);



        // mouse event handlers
        $( document ).mousedown(function(e) {
            //lastMouseX = e.offsetX;
            lastMouseX = e.screenX;
            isMouseIn = true;
        });

        $( horizontalScrollBarDraggable ).mousedown(function(e) {
            isMouseDown = true;
        });

        $( document ).mousemove(function (e) {

            var maxRegionPixels,
                left;

            if (isMouseDown && isMouseIn && undefined !== lastMouseX) {

                left = $(horizontalScrollBarDraggable).position().left;
                left += (e.screenX - lastMouseX);

                // clamp
                left = Math.max(0, left);
                left = Math.min(($(horizontalScrollBar).width() - $(horizontalScrollBarDraggable).outerWidth()), left);

                $( horizontalScrollBarDraggable).css({
                    "left": left + "px"
                });

                maxRegionPixels = myself.browser.cursorModel.framePixelWidth * myself.browser.cursorModel.filteredRegions.length;
                myself.browser.referenceFrame.start = myself.browser.referenceFrame.toBP(left) * (maxRegionPixels/$(horizontalScrollBar).width());

                // update
                if (myself.browser.ideoPanel) myself.browser.ideoPanel.repaint();
                if (myself.browser.karyoPanel) myself.browser.karyoPanel.repaint();
                myself.browser.trackPanels.forEach(function (trackPanel) { trackPanel.update(); });

                lastMouseX = e.screenX
            }

        });

        $( document ).mouseup(function(e) {
            isMouseDown = false;
            lastMouseX = undefined;
        });

    };

    return cursor;

})(cursor || {});
