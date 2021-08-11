import { initialDesignProps } from "../../constants/constants";
import { getDesignData } from "../../MiddlewareFunc/getInfo";
import { openFile, readImageFromUrl } from "../../utils/fileUtils";

const SET_DESIGN_NAME = "SET_DESIGN_NAME";
const SET_DESIGN_PATH = "SET_DESIGN_PATH";

export const designActions = {
  SET_DESIGN_NAME,
  SET_DESIGN_PATH,
};

const setDesignName = (name) => {
  return {
    type: SET_DESIGN_NAME,
    payload: name,
  };
};
const setDesignPath = (path) => {
  return {
    type: SET_DESIGN_PATH,
    payload: path,
  };
};

export const setDesignDetails = () => {
  return (dispatch) => {
    let designPath = sessionStorage.getItem("initdesign") || "";
    const designDataJSON = getDesignData(initialDesignProps, designPath);

    readImageFromUrl(designDataJSON.designImagePath).then((blob) => {
      openFile(blob, (designImagePath) => {
        dispatch(setDesignName(designDataJSON.designName));
        dispatch(setDesignPath(designImagePath));
      });
    });
  };
};
