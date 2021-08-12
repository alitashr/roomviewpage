import { findFolderofFile } from "../../utils/treeutils";
import { designlistActions } from "./designlistActions";

const initialState = {
  tree: null,
  filteredTree: null,
}
const designlistReducer = (state=initialState, action)=>{
  const {type, payload} = action;
  switch (type) {
    case designlistActions.SET_TREE:
      return setDesignTree(state, payload)
      case designlistActions.SELECT_DESIGN:
        return selectDesign(state, payload);
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


function selectDesign(state, payload) {
  let similarDesignsFolder = { children: [], files: [] };
  let selectedFile;
  let selectedFolder = { ...state.selectedFolder };
  //if payload contains selectdFile as an object
  if (payload.selectedFile) {
    selectedFile = { ...payload.selectedFile };
  } else {
    selectedFile = payload;
  }
  //if payload contains active variation
  let activeVariation = { ...selectedFile };

  if (payload.activeVariation) {
    activeVariation = payload.activeVariation;
  }
  //if payload contains active color scheme
  let activeColorScheme_ = state.activeColorScheme;
  if(payload.activeColorScheme){
    activeColorScheme_ = payload.activeColorScheme;
  }
  //if the selected node is not in selected folder, find and change the selected folder
  if (state.selectedFolder.files) {
    const fileinselectedFolder = state.selectedFolder.files.find(
      item => item.id === selectedFile.id
    );
    if (!fileinselectedFolder) {
      selectedFolder = findFolderofFile(state.tree, selectedFile) || {};
    }
  }
  else{
    selectedFolder =  state.tree ? findFolderofFile(state.tree, selectedFile) || {}: {};
  }
  //find the similar designs for the selected design
  if (selectedFolder.children && selectedFolder.children.length) {
    const similarDesignsCandidates =
      selectedFolder.children.filter(item => item.name.charAt(0) === ".") || [];
    if (similarDesignsCandidates.length) {
      const condition = item =>
        item.name.substr(1).toLowerCase() === selectedFile.name.toLowerCase();
      similarDesignsFolder = similarDesignsCandidates.find(condition) || {
        children: [],
        files: []
      };
    }
  }
  return { ...state, selectedFile, similarDesignsFolder, selectedFolder, activeVariation, activeColorScheme:activeColorScheme_ };
}

export default designlistReducer;