import React, { PropTypes, useRef, useState } from "react";

const VisualizationJpeg = (props) => {
  const canvasRef = useRef();
  
  const [diff, setDiff] = useState({ x: 0, y: 0 });

  const handleMouseDown=()=>{

  }
  const handleMouseMove=()=>{

  }
  const handleMouseUp=()=>{

  }
  return (
    <div className="tile-container" style={{ width: "100%", height: "100%", overflow: "hidden", position: "relative" }}>
      <canvas
        style={{ transform: `translate(${diff.x}px, ${diff.y}px)` }}
        className="jpeg-canvasrender"
        ref={canvasRef}
        onMouseLeave={handleMouseUp}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchMove={handleMouseMove}
        onTouchEnd={handleMouseUp}
      />
    </div>
  );
};

VisualizationJpeg.propTypes = {};

export default VisualizationJpeg;
