import { Button } from "antd";
import React, { useEffect, useState } from "react";
import { assetsFolder, defaultRoomdata, initialDesignProps } from "../../../constants/constants";
import { getDesignData, getRoomData } from "../../../MiddlewareFunc/getInfo";
import { preload, readImageFromUrl, readJSON } from "../../../utils/fileUtils";
import { AtSpinner, AtSpinnerOverlay } from "../../atoms/AtSpinner";
import RoomView from "../../organisms/RoomView";

var openFile = function (file, callback) {
  var reader = new FileReader();
  reader.onload = function () {
    callback(reader.result);
  };
  reader.readAsDataURL(file);
};

const RoomViewPage = (props) => {
  const [roomData, setRoomData] = useState();
  const [designImageProps, setDesignImageProps] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let roomPath = sessionStorage.getItem("initview") || "";
    const roomDataJSON = getRoomData(defaultRoomdata, roomPath);
    const baseUrl = assetsFolder+ roomDataJSON.Dir;

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

  useEffect(() => {
    if (roomData) {
      const { Files: files, baseUrl, config } = roomData;
      preload({ baseUrl, config, files });
    }
  }, [roomData]);

  const handleBtnClick=()=>{
    const key = sessionStorage.getItem('key') ||'';
    let url =  window.urlToOpen;
    url = key!=='' ? window.urlToOpen+'&key='+key: url;
    console.log("onbtnClick -> url", url)
    window.location = url;
  }
  return (
    <>
      {roomData && designImageProps && (
        <RoomView
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
      )}
        {isLoading && (
        <div className="spinner-container">
          <AtSpinnerOverlay show={isLoading}></AtSpinnerOverlay>
        </div>
      )}
      <Button type="primary" loading={false} className='at-entrypoint-roomview-btn'
      onClick={handleBtnClick}>
          Open in exploRUG
        </Button>

    </>
  );
};

RoomViewPage.propTypes = {};

export default RoomViewPage;
