import { initialDesignProps } from "../../constants/constants";
import { getDesignData } from "../../MiddlewareFunc/getInfo";
import { openFile, readImageFromUrl } from "../../utils/fileUtils";

const SET_DESIGN_NAME = "SET_DESIGN_NAME";
const SET_DESIGN_IMAGE_PATH = "SET_DESIGN_IMAGE_PATH";
const SET_DESIGN_DETAILS = "SET_DESIGN_DETAILS";
const SET_FULLPATH = "SET_FULLPATH";

export const designActions = {
  SET_DESIGN_NAME,
  SET_DESIGN_IMAGE_PATH,
  SET_DESIGN_DETAILS,
  SET_FULLPATH
};

const setDesignName = (name) => {
  return {
    type: SET_DESIGN_NAME,
    payload: name,
  };
};
export const setDesignImagePath = (path) => {
  return {
    type: SET_DESIGN_IMAGE_PATH,
    payload: path,
  };
};
const setDesign_Details = (payload)=>{
  return {
    type: SET_DESIGN_DETAILS,
    payload: payload
  }
}
const setFullpath = (payload)=>{
  return {
    type: SET_FULLPATH,
    payload: payload
  }
}

export const setInitialDesignProps = () => {
  return (dispatch) => {
    let designPath = sessionStorage.getItem("initdesign") || "";
    const designDataJSON = getDesignData(initialDesignProps, designPath);
    readImageFromUrl(designDataJSON.designImagePath).then((blob) => {
      openFile(blob, (designImagePath) => {
        dispatch(setDesignName(designDataJSON.designName));
        dispatch(setDesignImagePath(designImagePath));
      });
    });
  };
};

export const setDesignDetails =({name, fullpath,designProps})=>{
  return (dispatch)=>{
    if(name)  dispatch(setDesignName(name))
    if(fullpath)  dispatch(setFullpath(fullpath))
    if(designProps)  dispatch(setDesign_Details(designProps))
  }
}