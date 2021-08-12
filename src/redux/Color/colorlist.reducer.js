import { colorlistActions } from "./colorlistActions";

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
        collections: payload,
        filteredCollection: payload[defColIndex],
        loading: false,
      };
    case colorlistActions.SELECT_COLLECTION:
      return {
        ...state,
        collectionIndex: payload,
        filteredCollection: state.collections[payload],
      };

    default:
      return state
  }
};

export default colorlistReducer;
