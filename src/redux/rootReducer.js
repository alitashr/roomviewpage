import { combineReducers } from "redux";
import designReducer from "./Design/designReducer";
import designlistReducer from "./Designlist/designlist.reducer";
import roomReducer from "./Room/roomReducer";

const rootReducer = combineReducers({
  room:roomReducer,
  design:designReducer,
  designlist: designlistReducer
})

export default rootReducer;