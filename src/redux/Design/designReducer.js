import { designActions } from "./designActions";

const initialState = {
  designImagePath:'',
  designName:''
}
const designReducer = (state=initialState, action)=>{
  switch (action.type) {
    case designActions.SET_DESIGN_NAME:
      return {
        ...state,
        designName: action.payload
      }
      case designActions.SET_DESIGN_PATH:
        return {
          ...state,
          designImagePath: action.payload
        }
    default:
      return state;
  }
}

export default designReducer;