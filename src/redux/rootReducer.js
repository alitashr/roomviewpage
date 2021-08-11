import { combineReducers } from "redux";
import designReducer from "./Design/designReducer";
import roomReducer from "./Room/roomReducer";

const rootReducer = combineReducers({
  room:roomReducer,
  design:designReducer
})

export default rootReducer;