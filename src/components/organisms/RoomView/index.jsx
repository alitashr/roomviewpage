import classNames from "classnames";
import React, { PropTypes, useEffect, useRef, useState } from "react";
import { useMount, useWindowSize } from "react-use";
import { usePrevious } from "../../../hooks";
import { downloadRendered3dIllHQ, downloadRendered3dIllNQ } from "../../../MiddlewareFunc/download";
import { createCanvas, downloadImageData } from "../../../utils/canvasUtils";
import InputCanvas from "../../molecules/InputCanvas";
import RoomViewHelper from "./roomviewhelper";
import { getRenderedDesign } from "../../../api/appProvider";

let roomViewHelper = new RoomViewHelper();
const RoomView = (props) => {
  const { roomData, designImageProps, onRendered, onRoomLoaded, className = "" } = props;
  const { Name: roomName, Dir: dir, Files, baseUrl, config, activeFloor } = roomData;
  console.log("RoomView -> activeFloor", activeFloor);
  const { designImagePath, designName, designDetails, fullpath } = designImageProps;

  const containerRef = useRef(null);
  const bgCanvasRef = useRef(null);
  const threeCanvasRef = useRef(null);
  const maskCanvasRef = useRef(null);
  const shadowCanvasRef = useRef(null);
  const inputCanvasRef = useRef(null);
  const transitionCanvasRef = useRef();

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
    const canvasConfig = {
      bgCanvas: bgCanvasRef.current,
      threeCanvas: threeCanvasRef.current,
      maskCanvas: maskCanvasRef.current,
      shadowCanvas: shadowCanvasRef.current,
      container: containerRef.current,
      inputCanvas: inputCanvasRef.current,
      transitionCanvas: transitionCanvasRef.current
    };
    roomViewHelper.initCanvas(canvasConfig);
  });
  useEffect(() => {
    console.log("RoomView -> activeFloor", activeFloor);
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

  useEffect(() => {
    let la = true;
    const renderFloorInRoom = (activeFloor) => {
      console.log("useEffect, renderFloorInRoom -> activeFloor", activeFloor);
      if (!activeFloor) return Promise.resolve();
      return roomViewHelper.renderFloor(activeFloor);
    };

    const loadRoom = async () => {
      try {
        //if room has been changed
        if (prevRoomDetails !== roomData) {
          roomViewHelper.makeTransitionCanvas();
          if (!Files.length) return;
          const files = Files.map((file) => (file[0] === "/" ? file : "/" + file));
          console.log("loadRoom -> baseUrl", baseUrl)
          
          await Promise.all(roomViewHelper.initConfig({ baseUrl, config, files }));
          if (!la) return;
          roomViewHelper.updateBackground();
          roomViewHelper.updateMask();
          onRoomLoaded();
          if (prevDesignImagePath === designImagePath) {
            await roomViewHelper.updatethreeCanvas();
            if (!la) return;
            roomViewHelper.updateShadow();
          }
        } else {
          onRoomLoaded();
        }
        if (prevDesignImagePath !== designImagePath) {
          await roomViewHelper.updatethreeCanvas();
          if (typeof designImagePath === "string") {
            await roomViewHelper.renderDesignFromCustomUrl({
              customUrl: designImagePath,
            });
            await renderFloorInRoom(activeFloor);

            onRendered();
          } else {
            await roomViewHelper.renderFromJpg({ designImage: designImagePath });
            onRendered();
          }
          roomViewHelper.updateShadow();
        } else if (prevDesignDetails !== designDetails) {
          await roomViewHelper.updatethreeCanvas();
          if (!la) return;
          const renderedDesignImage = await getRenderedDesign({
            designDetails: designDetails,
            fullpath,
            zoom: 1,
            applyKLRatio: false,
          });
          roomViewHelper.renderImage({ image: renderedDesignImage });
          await renderFloorInRoom(activeFloor);

          roomViewHelper.updateShadow();
          await roomViewHelper.makeTransitionCanvas({ clear: true });
        } else {
          onRendered();
        }
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
        <canvas className="canvas" ref={bgCanvasRef} style={{ zIndex: 1, pointerEvents: "none" }} />
        <canvas className="canvas" ref={threeCanvasRef} style={{ zIndex: 2, pointerEvents: "all" }} />
        <canvas className="canvas" ref={maskCanvasRef} style={{ zIndex: 3, pointerEvents: "none" }} />
        <canvas className="canvas" ref={shadowCanvasRef} style={{ zIndex: 4, pointerEvents: "none" }} />
        <canvas className="canvas" ref={transitionCanvasRef} style={{ zIndex: 5, pointerEvents: "none" }} />
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
