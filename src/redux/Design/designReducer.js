import { designActions } from "./designActions";

const initialState = {
  designImagePath:'',
  designName: null,
  designDetails:{},
  fullpath:null
}
const designReducer = (state=initialState, action)=>{
  switch (action.type) {
    case designActions.SET_DESIGN_NAME:
      return {
        ...state,
        designName: action.payload
      }
      case designActions.SET_DESIGN_IMAGE_PATH:
        return {
          ...state,
          designImagePath: action.payload
        }
    case designActions.SET_DESIGN_DETAILS:
      return {
        ...state,
        designDetails: action.payload
      }
    case designActions.SET_FULLPATH:
      return {
        ...state,
        fullpath: action.payload
      }
    default:
      return state;
  }
}

export default designReducer;