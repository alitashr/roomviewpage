import { domain } from "../api/appProvider";
import HttpClient from "../api/httpClient";

export const getKey = (pageName = "") => {
  if (pageName === "") return;
  HttpClient.get(`${domain}/login/${pageName}.aspx`).then((response) => {
    const { Key } = response.data;
    sessionStorage.setItem("apikey", Key);
  });
};

export const getRoomData = (defaultRoomdata, roomPath = "") => {
  let roomData = defaultRoomdata;
  if (roomPath !== "") {
    let roomName = sessionStorage.getItem("roomName") || "";
      const fileName = roomPath.split("/").pop();
      roomData.Dir = roomPath;
      roomData.Name =  roomName === "" ? fileName.substr(0, fileName.lastIndexOf(".")) : roomName;
  }
  return roomData;
};

export const getDesignData = (initialDesignProps, designPath = "") => {
  let designData = initialDesignProps;
  if (designPath !== "") {
    let designName = sessionStorage.getItem("designName") || "";
    if (designName === "") {
      const fileName = designPath.split("/").pop();
      designName = fileName.substr(0, fileName.lastIndexOf("."));
    }
    designData.designName = designName;
    designData.fullpath = designPath;
  }
  return designData;
};
 