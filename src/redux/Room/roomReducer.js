import { roomActions } from "./roomActions";

const initialState = {
  Dir:'',
  Name:'',
  Files:[],
  config: null,
  baseUrl:''
}

const roomReducer = (state=initialState, action)=>{
//console.log("roomReducer -> action", action.type, action.payload)
  switch (action.type) {
    case roomActions.SET_ROOM_BASIC_DETAILS:
      return{
        ...state,
        Dir: action.payload.Dir,
        Name: action.payload.Name,
        Files: action.payload.Files,
      }
    case roomActions.SET_ROOM_CONFIG:
      return {
        ...state,
        config: action.payload
      }
    case roomActions.SET_ROOM_BASEURL:
      return {
        ...state,
        baseUrl: action.payload
      }
    default:
      return state;
  }
}
export default roomReducer