import { fetchColorList } from "../../api/appProvider";

const SET_COLORS = "SET_COLORS";
const SELECT_COLOR = "SELECT_COLOR";
const SELECT_COLLECTION = "SELECT_COLLECTION";


export const colorlistActions = {
  SET_COLORS,
  SELECT_COLOR,
  SELECT_COLLECTION
}


const setColorList = (payload) => {
  return {
    type: colorlistActions.SET_COLORS,
    payload: payload,
  };
};
const selectColor = (payload) => {
  return {
    type: colorlistActions.SELECT_COLOR,
    payload: payload,
  };
};
const selectCollection  = (payload)=>{
  return {
    type: colorlistActions.SELECT_COLLECTION,
    payload: payload
  }
}

export const getColorList = ()=>{
  return (dispatch)=>{
    fetchColorList().then(colorlist=>{
      dispatch(setColorList(colorlist))
    })
  }
}