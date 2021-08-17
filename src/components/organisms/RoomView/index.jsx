import classNames from "classnames";
import React, { PropTypes, useEffect, useRef, useState } from "react";
import { useMount, useWindowSize } from "react-use";
import { usePrevious } from "../../../hooks";
import { downloadRendered3dIllHQ, downloadRendered3dIllNQ } from "../../../MiddlewareFunc/download";
import { createCanvas, downloadImageData } from "../../../utils/canvasUtils";
import InputCanvas from "../../molecules/InputCanvas";

import RoomViewHelper from "./roomviewhelper";

let roomViewHelper = new RoomViewHelper();
const RoomView = (props) => {
  const { roomData, designImageProps, onRendered, onRoomLoaded, className='' } = props;
  const { Name: roomName, Dir: dir, Files, baseUrl, config } = roomData;
  const { designImagePath, designName } = designImageProps;

  const containerRef = useRef(null);
  const bgCanvasRef = useRef(null);
  const threeCanvasRef = useRef(null);
  const maskCanvasRef = useRef(null);
  const shadowCanvasRef = useRef(null);
  const inputCanvasRef = useRef(null);

  const prevRoomDetails = usePrevious(roomData);
  const prevDesignImagePath = usePrevious(designImagePath);
  const windowSize = useWindowSize();
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(()=>{
 //window.downloadRendered3dIllNQ = downloadRendered3dIllNQ({ designName, roomName, roomViewHelper });
 window.downloadRendered3dIllNQ = async () => {
  const mime = "jpeg";
  const downloadName = `${designName} in ${roomName}.${mime}`;
  roomViewHelper.downloadRendering(downloadName, mime);
};

  window.downloadRendered3dIllHQ = async () => {
    if (isDownloading) return;
    if(setIsDownloading) setIsDownloading(true);
    const { Name: roomName, Dir: dir, Files: files, baseUrl, config } = roomData;
    const mime = "jpg";
    const downloadName = `${designName} in ${roomName}.${mime}`;  
    const { width, height } = config;
    const bgCanvas = createCanvas(width, height);
    const threeCanvas = createCanvas(width, height);
    const maskCanvas = createCanvas(width, height);
    const shadowCanvas = createCanvas(width, height);
    const container = { clientWidth: width, clientHeight: height };
    const inputCanvas = createCanvas(width, height);
    const canvasConfig = {
        bgCanvas,
        threeCanvas,
        maskCanvas,
        shadowCanvas,
        container,
        inputCanvas,
    };
    const rh = new RoomViewHelper();
    rh.initCanvas(canvasConfig);
    await Promise.all(rh.initConfig({ baseUrl, config, files }));
    rh.updateBackground();
  
    rh.updateMask();
    await rh.updatethreeCanvas();
    if (typeof designImagePath === "string") {
      await roomViewHelper.renderDesignFromCustomUrl({
        customUrl: designImagePath,
      });
    } else {
      await roomViewHelper.renderFromJpg({ designImage: designImagePath });
    }
  
    const objectConfig = roomViewHelper.threeView.getObjectConfig();
    if (objectConfig) {
        rh.threeView.carpetMesh.position.copy(objectConfig.position);
        rh.threeView.carpetMesh.rotation.copy(objectConfig.rotation);
        rh.threeView.render();
    }
    await rh.updateShadow();
    const renderedCanvas = rh.renderInCanvas();
    setIsDownloading(false);
    downloadImageData(renderedCanvas, downloadName, "image/" + mime);
  };
  
  },[])
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
    };
    roomViewHelper.initCanvas(canvasConfig);
  });
  useEffect(() => {
    let la = true;
    const loadRoom = async () => {
      try {
        //if room has been changed
        if (prevRoomDetails !== roomData) {
          if (!la) return;
          if (!Files.length) return;
          const files = Files.map((file) => (file[0] === "/" ? file : "/" + file));
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
            onRendered();
          } else {
            await roomViewHelper.renderFromJpg({ designImage: designImagePath });
            onRendered();
          }

          roomViewHelper.updateShadow();

        }
        else{
          onRendered();
        }
        
      } catch (error) {
        console.error(error);
        return;
      }
    };
    loadRoom();
  }, [roomData, designImagePath]);

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
