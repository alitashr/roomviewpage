import { Button } from "antd";
import classNames from "classnames";
import React, { useEffect, useState } from "react";
import { assetsFolder, defaultRoomdata, initialDesignProps } from "../../../constants/constants";
import { getDesignData, getRoomData } from "../../../MiddlewareFunc/getInfo";
import { openFile, preload, readImageFromUrl, readJSON } from "../../../utils/fileUtils";
import { AtSpinnerOverlay } from "../../atoms/AtSpinner";
import VideoPlayer from "../../molecules/VideoPlayer";
import ExplorugIframePopup from "../../organisms/ExplorugIframePopup";
import RoomView from "../../organisms/RoomView";

const RoomViewPage = (props) => {
  const { showButton = true, className = "", onButtonClick } = props;
  const [roomData, setRoomData] = useState();
  const [designImageProps, setDesignImageProps] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showIframe, setShowIframe] = useState(false);
  let hasOverlayVideo = sessionStorage.getItem("hasOverlayVideo") || false;
  useEffect(() => {
    let roomPath = sessionStorage.getItem("initview") || "";
    const roomDataJSON = getRoomData(defaultRoomdata, roomPath);
    const baseUrl = assetsFolder + roomDataJSON.Dir;

    readJSON(`${baseUrl}/config.json`).then((config) => {
      const roomData = { ...roomDataJSON, config, baseUrl };
      setRoomData(roomData);
    });

    let designPath = sessionStorage.getItem("initdesign") || "";
    const designDataJSON = getDesignData(initialDesignProps, designPath);

    readImageFromUrl(designDataJSON.designImagePath).then((blob) => {
      openFile(blob, (designImagePath) => {
        setDesignImageProps({ designName: designDataJSON.designName, designImagePath });
      });
    });
  }, []);
  const getVideoPlayerClassName = (roomDir) => {
    const roomNameParts = roomDir.split("/");
    const roomName = roomNameParts.pop();
    let classNameText = roomName.replace(/ /g, "-").toLowerCase();
    classNameText = `${classNameText}-clip`;
    return classNameText;
  };

  const getVideoPlayerSrc = (roomDir) => {
    const roomNameParts = roomDir.split("/");
    const roomName = roomNameParts.pop();
    let videoPath = `${assetsFolder}OverlayVideos/${roomName}.mp4`;
    return videoPath;
  };
  useEffect(() => {
    if (roomData) {
      const { Files: files, baseUrl, config } = roomData;
      preload({ baseUrl, config, files });
    }
  }, [roomData]);

  const handleBtnClick = () => {
    const key = sessionStorage.getItem("key") || "";
    let url = window.urlToOpen;
    url = key !== "" ? window.urlToOpen + "&key=" + key : url;
    //console.log("handleBtnClick -> url", url)
    if (onButtonClick) {
      onButtonClick();
    } else {
      //window.location = url;
      setShowIframe(true);
    }
  };
  return (
    <div className={classNames("at-roomview-container", className)}>
      {roomData && designImageProps && (
        <>
          {hasOverlayVideo && (
            <VideoPlayer
              className={getVideoPlayerClassName(roomData.Dir)}
              src={getVideoPlayerSrc(roomData.Dir)}
            ></VideoPlayer>
          )}

          <RoomView
            className={classNames({ "room-view-overlay": hasOverlayVideo })}
            onRendered={() => {
              setIsLoading(false);
              console.log("room has been rendered");
            }}
            onRoomLoaded={() => {
              // console.log("room has been loaded");
            }}
            roomData={roomData}
            designImageProps={designImageProps}
          />
        </>
      )}
      {isLoading && (
        <div className="spinner-container">
          <AtSpinnerOverlay show={isLoading}></AtSpinnerOverlay>
        </div>
      )}
      {showButton && (
        <Button type="primary" loading={false} className="at-entrypoint-roomview-btn" onClick={handleBtnClick}>
          Open in exploRUG
        </Button>
      )}
      {showButton && (
        <ExplorugIframePopup
          className={classNames({'hidden': !showIframe})}
          showExplorugPopup={showIframe}
          explorugPopUpUrl={window.urlToOpen}
          onClose={() => setShowIframe(false)}
        ></ExplorugIframePopup>
      )}
    </div>
  );
};

RoomViewPage.propTypes = {};

export default RoomViewPage;
