import { assetsFolder, defaultRoomdata } from "../../constants/constants";
import { getRoomData } from "../../MiddlewareFunc/getInfo";
import { readJSON } from "../../utils/fileUtils";

const SET_ROOM_CONFIG = "SET_ROOM_CONFIG";
const SET_ROOM_BASIC_DETAILS = "SET_ROOM_BASIC_DETAILS";
const SET_ROOM_BASEURL = "SET_ROOM_BASEURL";

export const roomActions = {
  SET_ROOM_CONFIG,
  SET_ROOM_BASIC_DETAILS,
  SET_ROOM_BASEURL
}

const setRoomConfig = (config)=>{
  return {
    type: SET_ROOM_CONFIG,
    payload: config
  } 
}
const setRoomBasicDetails = (roomData)=>{
  return {
    type: SET_ROOM_BASIC_DETAILS,
    payload: roomData
  }
}
const setRoomBaseUrl = (baseUrl)=>{
  return {
    type: SET_ROOM_BASEURL,
    payload:baseUrl
  }
}

export const fetchBasicDetails=()=>{
  return (dispatch)=>{
    let roomPath = sessionStorage.getItem("initview") || "";
    const roomDataJSON = getRoomData(defaultRoomdata, roomPath);
    dispatch(setRoomBasicDetails(roomDataJSON))
    const baseUrl = assetsFolder + roomDataJSON.Dir;

    readJSON(`${baseUrl}/config.json`).then((config) => {
      const roomData = { ...roomDataJSON, config, baseUrl };

      dispatch(setRoomConfig(config));
      dispatch(setRoomBaseUrl(baseUrl));
      
    }); 
  }
}
