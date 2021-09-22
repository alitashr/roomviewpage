import classNames from "classnames";
import React, { PropTypes, useEffect, useRef, useState } from "react";
import { useMount, useWindowSize } from "react-use";
import { usePrevious } from "../../../hooks";
import { downloadRendered3dIllHQ, downloadRendered3dIllNQ } from "../../../MiddlewareFunc/download";
import { createCanvas, downloadImageData } from "../../../utils/canvasUtils";
import InputCanvas from "../../molecules/InputCanvas";
import RoomViewHelper from "./roomviewhelper";
import { getRenderedDesign } from "../../../api/appProvider";
import { getDominantColor } from "../../../utils/colorUtils";

let roomViewHelper = new RoomViewHelper();
let designRendered = false;
let designRendering = false;


const RoomView = (props) => {
  const { roomData, designImageProps, onRendered, onRoomLoaded, className = "" } = props;
  const { Name: roomName, Dir: dir, Files, baseUrl, config, activeFloor, floorOptions } = roomData;
  const { designImagePath, designName, designDetails, fullpath } = designImageProps;

  const containerRef = useRef(null);
  const bgCanvasRef = useRef(null);
  const threeCanvasRef = useRef(null);
  const maskCanvasRef = useRef(null);
  const shadowCanvasRef = useRef(null);
  const inputCanvasRef = useRef(null);
  const transitionCanvasRef = useRef();
  const videoRef = useRef();

  const prevRoomDetails = usePrevious(roomData);
  const prevDesignImagePath = usePrevious(designImagePath);
  const prevDesignDetails = usePrevious(designDetails);
  const windowSize = useWindowSize();
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    window.downloadRendered3dIllNQ = async () => {};
    window.downloadRendered3dIllHQ = async () => {};
  }, []);

  useEffect(() => {
    roomViewHelper.resize(windowSize);
  }, [windowSize]);

  useMount(() => {
    roomViewHelper.initFlags({});
    
    const canvasConfig = {
      bgCanvas: bgCanvasRef.current,
      threeCanvas: threeCanvasRef.current,
      maskCanvas: maskCanvasRef.current,
      shadowCanvas: shadowCanvasRef.current,
      container: containerRef.current,
      inputCanvas: inputCanvasRef.current,
      transitionCanvas: transitionCanvasRef.current,
      bgVideo: videoRef.current
    };
    roomViewHelper.initCanvas(canvasConfig);
  });
  useEffect(() => {
    if (!activeFloor) return;
    //if (isRendering || !activeFloor || designDetailState.loading) return;

    const updateFloor = async () => {
      roomViewHelper.makeTransitionCanvas();
      // setLoading(true);
      await roomViewHelper.renderFloor(activeFloor);
      await roomViewHelper.updateShadow();
      // setLoading(false);
    };
    updateFloor();
  }, [activeFloor]);
  const renderFloorInRoom = (activeFloor) => {
    if (!floorOptions) return Promise.resolve();
    const floor = activeFloor && activeFloor.path ? activeFloor : floorOptions.activeFloor;
    return roomViewHelper.renderFloor(floor);
  };
   
  const renderDesign= async()=>{
    if (typeof designImagePath === "string") {
      await roomViewHelper.renderDesignFromCustomUrl({
        customUrl: designImagePath,
      });
      await renderFloorInRoom(activeFloor);
    } else {
      await roomViewHelper.renderFromJpg({ designImage: designImagePath });
    }
  }


  useEffect(() => {
    let la = true;
   

    const loadRoom = async () => {
      try {
        console.log('load room')
        //if room has been changed
        if (prevRoomDetails !== roomData) {
          roomViewHelper.makeTransitionCanvas();
          if (!Files.length) return;
          const files = Files.map((file) => (file[0] === "/" ? file : "/" + file));
          await Promise.all(roomViewHelper.initConfig({ baseUrl, config, files }));
          if (!la) return;
          const dominantColorHex = getDominantColor(designDetails);
          roomViewHelper.updateBackground({ dominantColorHex });
          roomViewHelper.updateShadow({ clear: true });
          roomViewHelper.updateMask();
          
          onRoomLoaded();
          if (prevDesignImagePath === designImagePath) {
            await roomViewHelper.updatethreeCanvas();
            if (!la) return;
            if (
              (!designRendering && !designRendered)) {
                designRendering = true;
                await renderDesign()
            } 
            roomViewHelper.updateShadow();
            await renderFloorInRoom(activeFloor);
            if (!la) return;
          }
        } else {
          onRoomLoaded();
        }
        if (prevDesignImagePath !== designImagePath) {
          await roomViewHelper.updatethreeCanvas();
        await renderDesign();
          onRendered();
          
          roomViewHelper.updateShadow();
        } 
        else if (prevDesignDetails !== designDetails) {
          if (roomViewHelper.patchImage) {
            const dominantColorHex = getDominantColor(designDetails);
            roomViewHelper.updateBackground({ dominantColorHex });
            roomViewHelper.updateMask();
          }
          designRendered = false;
          designRendering = false;
          //await setRoomTileDetails();
          await roomViewHelper.updatethreeCanvas();
          if (!la) return;
           designRendering = true
          const renderedDesignImage = await getRenderedDesign({
            designDetails: designDetails,
            fullpath,
            zoom: 1,
            applyKLRatio: false,
          });
          roomViewHelper.renderImage({ image: renderedDesignImage });
          await renderFloorInRoom(activeFloor);

          designRendered = true;
            designRendering = false;
        } else {
          onRendered();
        }
        roomViewHelper.updateShadow();
        await roomViewHelper.makeTransitionCanvas({ clear: true });
     

      } catch (error) {
        console.error(error);
        return;
      }
    };
    loadRoom();
    return () => {
      la = false;
    };
  }, [roomData, designImageProps]);
 
  const handleInputStart = (e) => {
    roomViewHelper.mouseDownTouchStart(e);
  };
  const handleinputMove = (e) => {
    roomViewHelper.mouseDownTouchMove(e);
  };
  const handleInputEnd = (e) => {
    roomViewHelper.mouseDownTouchEnd(e);
  };

  return (
    <React.Fragment>
      <div className={classNames("canvas-container", className)} ref={containerRef}>
        <canvas className="canvas bgCanvas" ref={bgCanvasRef} style={{ zIndex: 1, pointerEvents: "none" }} />
        <canvas className="canvas threeCanvas" ref={threeCanvasRef} style={{ zIndex: 2, pointerEvents: "all" }} />
        <canvas className="canvas maskCanvas" ref={maskCanvasRef} style={{ zIndex: 3, pointerEvents: "none" }} />
        
      <video className={classNames("video", {show: config.backgroundVideo})} width="100%" height="100%" loop muted autoPlay playsInline
        ref={videoRef}

        //style={{ opacity: config.backgroundVideo? 1:0}}
      />
        <canvas className="canvas shadowCanvas" ref={shadowCanvasRef} style={{ zIndex: 4, pointerEvents: "none" }} />
        <canvas className="canvas transitionCanvas" ref={transitionCanvasRef} style={{ zIndex: 5, pointerEvents: "none" }} />
        <InputCanvas
          zIndex={50}
          pointerEvent
          ref={inputCanvasRef}
          onStart={handleInputStart}
          onMove={handleinputMove}
          onEnd={handleInputEnd}
        />
      </div>
    </React.Fragment>
  );
};

RoomView.propTypes = {};

export default RoomView;
