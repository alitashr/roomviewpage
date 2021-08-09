import React, { useState, forwardRef } from "react";
function isTouchEvent(event) {
    return event.nativeEvent.type === "touchstart" || event.nativeEvent.type === "touchmove";
}
const InputCanvas = (props, ref) => {
    const { onStart, onMove, onEnd, zIndex, pointerEvent, remapCoord, ...otherprops } = props;
    const [mouseDown, setMouseDown] = useState(false);

    const handleMouseDown = (e) => {
        const location = getlocation(e, ref.current.getBoundingClientRect());
        if (!location) return;
        setMouseDown(true);
        if (!onStart) return;
        onStart(location);
    };

    const handleMouseMove = (e) => {
        if (!mouseDown || !onMove) return;
        const location = getlocation(e, ref.current.getBoundingClientRect());
        if (!location) return;
        onMove(location);
    };
    const handleMouseUp = (e) => {
        if (e.cancelable) {
            e.stopPropagation();
        }
        setMouseDown(false);
        if (onEnd) onEnd();
    };

    function getlocation(event, rect) {
        const { clientX, clientY } = isTouchEvent(event) ? event.nativeEvent.targetTouches[0] : event;
        const { top, left, width, height } = rect;
        const xabs = clientX - left;
        const yabs = clientY - top;
        if (!remapCoord)
            return {
                x: xabs,
                y: yabs,
            };

        const { width: mapWidth, height: mapHeight } = remapCoord;
        const x = (mapWidth * xabs) / width;
        const y = (mapHeight * yabs) / height;
        return { x, y };
    }
    return (
        <canvas
            {...otherprops}
            style={{ pointerEvents: pointerEvent ? "all" : "none", zIndex: zIndex }}
            ref={ref}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onTouchStart={handleMouseDown}
            onTouchMove={handleMouseMove}
            onTouchEnd={handleMouseUp}
        />
    );
};

export default forwardRef(InputCanvas);
