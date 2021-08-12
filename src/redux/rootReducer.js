import { combineReducers } from "redux";
import colorlistReducer from "./Color/colorlist.reducer";
import designReducer from "./Design/designReducer";
import designlistReducer from "./Designlist/designlistReducer";
import roomReducer from "./Room/roomReducer";

const rootReducer = combineReducers({
  room:roomReducer,
  design:designReducer,
  designlist: designlistReducer,
  color: colorlistReducer
})

export default rootReducer;