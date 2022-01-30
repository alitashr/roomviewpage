import { getDesignData } from "../../MiddlewareFunc/getInfo";
import { openFile, readImageFromUrl } from "../../utils/fileUtils";

const SET_DESIGN_NAME = "SET_DESIGN_NAME";
const SET_DESIGN_DETAILS = "SET_DESIGN_DETAILS";
const SET_FULLPATH = "SET_FULLPATH";
const SET_DESIGN_IMAGE = "SET_DESIGN_IMAGE";

export const designActions = {
  SET_DESIGN_NAME,
  SET_DESIGN_DETAILS,
  SET_FULLPATH,
  SET_DESIGN_IMAGE
};

export const setDesignName = (name) => {
  return {
    type: SET_DESIGN_NAME,
    payload: name,
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

const setDesignImage = (payload)=>{
  return {
    type: SET_DESIGN_IMAGE,
    payload: payload
  }
}

export const setInitialDesignProps = () => {
  return (dispatch) => {
    let designPath = sessionStorage.getItem("initdesign") || "";

    const designDataJSON = getDesignData(designPath);
    readImageFromUrl(designDataJSON.fullpath).then((blob) => {
      if(typeof blob !== Blob){
        dispatch(setDesignName(designDataJSON.designName));
        dispatch(setFullpath(designDataJSON.fullpath));
     
      }
      else{
      openFile(blob, (fullpath) => {
        dispatch(setDesignName(designDataJSON.designName));
        dispatch(setFullpath(designDataJSON.fullpath));

      });}
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

export const changeCurrentDesignImage =(payload)=>{
  return (dispatch)=>{
    dispatch(setDesignImage(payload))
    dispatch(setFullpath(null))
  }
}

export const changeRugPhySize = (state, payload) => {
  return (dispatch)=>{
  const widRatio = state.designDetails.Width / state.designDetails.PhysicalWidth;
  const hgtRatio = state.designDetails.Height / state.designDetails.PhysicalHeight;
  const PhysicalWidth = payload.PhysicalWidth
    ? payload.PhysicalWidth
    : state.designDetails.PhysicalWidth;
  const PhysicalHeight = payload.PhysicalHeight
    ? payload.PhysicalHeight
    : state.designDetails.PhysicalHeight;
  const Width = Math.round(PhysicalWidth * widRatio);
  const Height = Math.round(PhysicalHeight * hgtRatio);
  const designDetails = {
    ...state.designDetails,
    PhysicalWidth,
    Width,
    Height,
    PhysicalHeight
  };

  const finalstate =  {
    ...state,
    designDetails
  };
  // console.log("changeRugPhySize -> finalstate", finalstate)
  dispatch(setDesign_Details(designDetails))
}
  //return finalstate;
};