import { fetchColorList } from "../../api/appProvider";
import { compare } from "../../utils/colorUtils";

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
    if(colorlist!=='nosession' && colorlist!==''){
      dispatch(setColorList(colorlist))
    }
    })
  }
}

export const checkColorSorting=(filteredCollection, sortingKey, sortingOrder=1)=>{
  const { NumRows, ColorRows } = filteredCollection;
  //sort the colors
  const colorRowsSorted = [...ColorRows].sort((a, b) => {
    if (!sortingKey) return a - b;
    return compare(a, sortingKey, b, sortingOrder);
  });
  let sortagain = [];
  //if the sorting is by sharpness or brightness, it needs to be sorted again along the rows with decreasing lightness
  if (sortingKey === "H" || sortingKey === "S") {
    for (let i = 0; i < ColorRows.length; i += NumRows) {
      const a = [...colorRowsSorted].slice(i, i + NumRows);
      a.sort((a, b) => compare(a, "L", b, -1));
      sortagain = [...sortagain, ...a];
    }
  } else {
    sortagain = [...colorRowsSorted];
  }
  return sortagain;
}