import { designlistActions } from "./designlist.actions";

const initialState = {
  tree: null,
  filteredTree: null,
}
const designlistReducer = (state=initialState, action)=>{
  switch (action.type) {
    case designlistActions.SET_TREE:
      return setDesignTree(state, action.payload)
    default:
      return state;
  }
}

function setDesignTree(state, payload) {
  const { selectedFolder, selectedFile, tree } = payload;
  if (selectedFolder && selectedFile) {
    const similarDesignsCandidates =
      selectedFolder.children.filter(item => item.name.charAt(0) === ".") || [];
    const similarDesignsFolder = similarDesignsCandidates.find(
      item => item.name.substr(1).toLowerCase() === selectedFile.name.toLowerCase()
    ) || { children: [], files: [] };

    return { ...state, selectedFolder, selectedFile, tree, similarDesignsFolder };
  }
  return { ...state, tree };
}
export default designlistReducer;