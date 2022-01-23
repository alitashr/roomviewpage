import { roomActions } from "./roomActions";

const initialState = {
  roomDetails: {
    Dir: "",
    Name: "",
    Files: [],
    config: null,
    baseUrl: "",
  },
  floorOptions: null,
  activeFloor: null,
};

const roomReducer = (state = initialState, action) => {
  switch (action.type) {
    case roomActions.SET_ROOM_BASIC_DETAILS:
      return {
        ...state,
        roomDetails: {
          ...state.roomDetails,
          Dir: action.payload.Dir,
          Name: action.payload.Name,
          Files: action.payload.Files,
        },
      };
    case roomActions.SET_ROOM_CONFIG:
      return {
        ...state,
        roomDetails: {
          ...state.roomDetails,
          config: action.payload,
        },
      };
    case roomActions.SET_ROOM_BASEURL:
      return {
        ...state,
        roomDetails: {
          ...state.roomDetails,
          baseUrl: action.payload,
        },
      };
    case roomActions.SET_FLOOR_OPTIONS:
      return {
        ...state,
        floorOptions: action.payload,
      };
    case roomActions.SET_ACTIVE_FLOOR_OPTION:
      return {
        ...state,
        activeFloor: action.payload,
      };
    default:
      return state;
  }
};
export default roomReducer;
