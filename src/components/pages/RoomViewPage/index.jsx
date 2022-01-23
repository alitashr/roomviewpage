import { Button } from "antd";
import classNames from "classnames";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { autoLogin, getApiKey, getFloor, getPageName, uploadRoomviewBlob } from "../../../api/appProvider";
import { assetsFolder } from "../../../constants/constants";
import { setFloorOptions } from "../../../redux";
import { getFilename } from "../../../utils/utils";
import { AtSpinnerOverlay } from "../../atoms/AtSpinner";
import VideoPlayer from "../../molecules/VideoPlayer";
import ExplorugIframePopup from "../../organisms/ExplorugIframePopup";
import ImageDropContainer from "../../organisms/ImageDropContainer";
import RoomContainer from "../../organisms/RoomContainer";

import { setDesignName, setDesignImagePath } from "../../../redux/Design/designActions";
import { canvasToBlobPromise, createCanvas } from "../../../utils/canvasUtils";

const RoomViewPage = (props) => {
  const { showButton = true, className = "", onButtonClick, allowDesignUpload = true } = props;
  const [isLoading, setIsLoading] = useState(true);
  const [showIframe, setShowIframe] = useState(false);
  const [customDesignLoaded, setCustomDesignLoaded] = useState(false);
  let hasOverlayVideo = sessionStorage.getItem("hasOverlayVideo") || false;
  const dispatch = useDispatch();
  const roomData = useSelector((state) => state.room);

  useEffect(() => {
    window.flags = {};
    window.InterfaceElements = {};

    getFloor().then((floors) => {
      dispatch(setFloorOptions(floors));
    });

    // let roomPath = sessionStorage.getItem("initview") || "";
    // const roomDataJSON = getRoomData(defaultRoomdata, roomPath);
    // const baseUrl = assetsFolder + roomDataJSON.Dir;

    // readJSON(`${baseUrl}/config.json`).then((config) => {
    //   const roomData = { ...roomDataJSON, config, baseUrl };
    //   setRoomData(roomData);
    // });

    // let designPath = sessionStorage.getItem("initdesign") || "";
    // const designDataJSON = getDesignData(initialDesignProps, designPath);

    // readImageFromUrl(designDataJSON.designImagePath).then((blob) => {
    //   openFile(blob, (designImagePath) => {
    //     setDesignImageProps({ designName: designDataJSON.designName, designImagePath });
    //   });
    // });
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
  const handleBtnClick = () => {
    const key = sessionStorage.getItem("key") || "";
    let url = window.urlToOpen;
    url = key !== "" ? window.urlToOpen + "&key=" + key : url;
    console.log("handleBtnClick -> url---", url);
    let customDesignUrl = "https://explorug.net/ruglife/images-for/carpet-design/Cubinia.jpg";
    if (customDesignLoaded) {
      let newUrl = window.getUrlToOpen(customDesignUrl);
      window.open(newUrl, "_blank");
    } else {
      if (onButtonClick) {
        onButtonClick();
      } else {
        //window.location = url;
        setShowIframe(true);
      }
    }
  };

  const handleImageChange = (imageFile) => {
    if (!imageFile) return;
    setIsLoading(true);

    console.time();
    var reader = new FileReader();
    reader.readAsDataURL(imageFile);
    reader.onloadend = function (e) {
      console.timeLog();
      var myImage = new Image();
      myImage.src = e.target.result;
      let filename = getFilename(imageFile.name);
      let fileType = imageFile.type;
      myImage.onload = function (ev) {
        console.timeLog();

        myImage.onload = null;
        setIsLoading(true);

        const tmpCanvas = createCanvas(myImage.width, myImage.height);
        tmpCanvas.getContext("2d").drawImage(myImage, 0, 0, myImage.width, myImage.height);
        canvasToBlobPromise(tmpCanvas).then((canvasBlob) => {
          uploadRoomviewBlob({ blob: canvasBlob, filename: filename }).then((response) => {
            console.log("uploadRoomviewBlob -> response", response);
            if (response.toLowerCase() === "success") {
              setIsLoading(true);

              dispatch(setDesignName(filename));
              let key = getApiKey();
              console.log("uploadRoomviewBlob -> key", key);
              let designPath = "https://s3.amazonaws.com/attestbucket/" + filename;
              if (key) {
                designPath =
                  "https://v3.explorug.com/appproviderv3.aspx?action=downloadimage&key=" + key + "&url=" + designPath;
                  dispatch(setDesignImagePath(designPath));
                  setCustomDesignLoaded(true);
                } else {
                const page = getPageName().page || "ruglife";
                autoLogin(page).then(apikey=>{
                  key = apikey;
                  dispatch(setDesignImagePath(designPath));
                  setCustomDesignLoaded(true);
                });
              }
             
            } else {
              console.error("could not upload image");
            }
            // return resolve(response);
          });
        });
      };
      myImage.onerror = function () {
        //openNotification = { message: "Couldn't upload the file", description: "Please try again" };
      };
    };
  };
  return (
    <div className={classNames("at-roomview-container", className)}>
      <>
        {hasOverlayVideo && roomData && (
          <VideoPlayer
            className={getVideoPlayerClassName(roomData.Dir)}
            src={getVideoPlayerSrc(roomData.Dir)}
          ></VideoPlayer>
        )}
        <RoomContainer
          onRoomRendered={() => {
            console.log("set loading false");
            setIsLoading(false);
          }}
        ></RoomContainer>
      </>

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
          className={classNames({ hidden: !showIframe })}
          showExplorugPopup={showIframe}
          explorugPopUpUrl={window.urlToOpen}
          onClose={() => setShowIframe(false)}
        ></ExplorugIframePopup>
      )}
      {allowDesignUpload && <ImageDropContainer onImageChange={handleImageChange} />}
    </div>
  );
};

RoomViewPage.propTypes = {};

export default RoomViewPage;
