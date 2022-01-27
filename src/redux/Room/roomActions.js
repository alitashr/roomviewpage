import { assetsFolder } from "../../constants/constants";
import { getRoomData } from "../../MiddlewareFunc/getInfo";
import { readJSON } from "../../utils/fileUtils";

const SET_ROOM_CONFIG = "SET_ROOM_CONFIG";
const SET_ROOM_BASIC_DETAILS = "SET_ROOM_BASIC_DETAILS";
const SET_ROOM_BASEURL = "SET_ROOM_BASEURL";
const SET_FLOOR_OPTIONS = "SET_FLOOR_OPTIONS";
const SET_ACTIVE_FLOOR_OPTION = "SET_ACTIVE_FLOOR_OPTION";

export const roomActions = {
  SET_ROOM_CONFIG,
  SET_ROOM_BASIC_DETAILS,
  SET_ROOM_BASEURL,
  SET_FLOOR_OPTIONS,
  SET_ACTIVE_FLOOR_OPTION,
};

const setRoomConfig = (config) => {
  return {
    type: SET_ROOM_CONFIG,
    payload: config,
  };
};
const setRoomBasicDetails = (roomData) => {
  return {
    type: SET_ROOM_BASIC_DETAILS,
    payload: roomData,
  };
};
const setRoomBaseUrl = (baseUrl) => {
  return {
    type: SET_ROOM_BASEURL,
    payload: baseUrl,
  };
};
export const setFloorOptions = (payload) => {
  return {
    type: SET_FLOOR_OPTIONS,
    payload: payload,
  };
};
export const setActiveFloorOption = (payload) => {
  return {
    type: SET_ACTIVE_FLOOR_OPTION,
    payload: payload,
  };
};

export const fetchBasicRoomDetails = () => {
  return (dispatch) => {
    let roomPath = sessionStorage.getItem("initview") || "";
    const roomDataJSON = getRoomData(window.defaultRoomdata, roomPath);
    const baseUrl = assetsFolder + roomDataJSON.Dir;
    
    readJSON(`${baseUrl}/config.json`).then(async (config) => {
      const name = roomDataJSON.Name || "";
      let roomData = { ...roomDataJSON, config, baseUrl };

      // if (config.version !== 2.1) {
      //   let mappedConfig = await config2Point1(name, baseUrl, config);
      //   dispatch(setRoomConfig(mappedConfig));
      // } else {
      //   dispatch(setRoomConfig(config));
      // }
      
      dispatch(setRoomBasicDetails(roomDataJSON));
      dispatch(setRoomConfig(config));
      dispatch(setRoomBaseUrl(baseUrl));

      // const defaultFloorOption = {
      //   show: false,
      //   floors: [],
      //   activeFloor: {}
      // };
      // const { floorOptions = defaultFloorOption, scene1 } = config;
      // const roomOptions = {
      //   carpetOptions: {
      //     rotation: scene1.surface1.rotation,
      //     position: scene1.surface1.position
      //   },
      //   floorOptions
      // };
      // console.log("readJSON -> roomOptions", roomOptions);
      //dispatch(setRoomOptions(roomOptions))
    });
  };
};
