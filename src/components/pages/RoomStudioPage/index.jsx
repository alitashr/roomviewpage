import React, { useEffect } from "react";
import { useMount } from "react-use";
import { useDispatch, useSelector } from "react-redux";
import { autoLogin, getFloor } from "../../../api/appProvider";
import AtButton from "../../atoms/AtButton";
import RoomContainer from "../../organisms/RoomContainer";

import { getDesignList, setFloorOptions } from "../../../redux";
import DesignlistContainer from "../../organisms/DesignlistContainer";
import ColorlistContainer from "../../organisms/ColorListContainer";
import FloorOptionsContainer from "../../organisms/FloorOptionsContainer";
import { getJsonFromUrl } from "../../../utils/domUtils";

const RoomStudioPage = (props) => {
  const designlist = useSelector((state) => state.designlist);
  const roomData = useSelector((state) => state.room);
  const {config, floorOptions} = roomData;
  //const { scene1} = config;
  //console.log("RoomStudioPage -> scene1", scene1)
  //console.log("RoomStudioPage -> roomData", roomData)

  const dispatch = useDispatch();
  useMount(() => {
    window.flags = {};
    window.InterfaceElements = {};

    autoLogin().then((key) => {
      if (key.Key && key.Key !== "") {
        dispatch(getDesignList({}));
        //get flags
      }
    });
  });
  
  useEffect(()=>{
    getFloor().then(floors=>{
      dispatch(setFloorOptions(floors))
    });
  },[]);

  const onCustomizeRug = () => {
    window.open(window.urlToOpen, "_blank");
  };
  const onMyroomClick = () => {
    let url = window.urlToOpen;
    url = url.substr(url.indexOf("?"), url.length - 1);
    const json = getJsonFromUrl(url);
    const myRoomUrl = window.getExplorugUrl({ page: json.page, initDesign: json.initdesign, initView: "myroom" });
    window.open(myRoomUrl, "_blank");
  };
  return (
    <div className="room-studio-page">
      <RoomContainer></RoomContainer>
      <div className="at-mainbuttons-container">
        <AtButton
          text="See in your own room"
          className="at-room-studio-page at-btn-myroom"
          onClick={onMyroomClick}
        ></AtButton>
        <AtButton
          text="Customize Rug"
          className="at-room-studio-page at-btn-myroom"
          onClick={onCustomizeRug}
        ></AtButton>

        <DesignlistContainer></DesignlistContainer>
        <ColorlistContainer></ColorlistContainer>

        {floorOptions && config && config.scene1.floor &&  (
          <FloorOptionsContainer
            floorOptions={roomData.floorOptions}
            activeFloor={roomData.activeFloor ? roomData.activeFloor: roomData.floorOptions.activeFloor}
          ></FloorOptionsContainer>
        )}
      </div>
    </div>
  );
};

RoomStudioPage.propTypes = {};

export default RoomStudioPage;
