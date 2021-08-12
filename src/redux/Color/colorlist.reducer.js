import { colorlistActions } from "./colorlist.actions";

const defColIndex = 0;

const initialState = {
  loading: true,
  collections: null,
  filteredCollection: null,
  collectionIndex: defColIndex,
  activeColor: null,
};

const colorlistReducer = (state = initialState, action) => {
  const { type, payload } = action;
  switch (type) {
    case colorlistActions.SET_COLORS:
      return {
        ...state,
        collections: action.payload,
        filteredCollection: action.payload[defColIndex],
        loading: false,
      };
    case colorlistActions.SELECT_COLLECTION:
      return {
        ...state,
        collectionIndex: action.payload,
        filteredCollection: state.collections[action.payload],
      };

    default:
      return state
  }
};

export default colorlistReducer;
