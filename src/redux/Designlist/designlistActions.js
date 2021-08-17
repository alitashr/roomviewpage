import { fetchDesignList, fetchDesignThumbnails } from "../../api/appProvider";
import { arrangeTree, findInTree, updateFilesInEveryNode } from "../../utils/treeutils";

const SET_TREE = "SET_TREE";
const SELECT_DESIGN = "SELECT_DESIGN";

export const designlistActions = {
  SET_TREE,
  SELECT_DESIGN,
};

const setDesignList = (payload) => {
  return {
    type: designlistActions.SET_TREE,
    payload: payload,
  };
};
const selectDesign = (payload) => {
  return {
    type: designlistActions.SELECT_DESIGN,
    payload: payload,
  };
};

export const getDesignList = (initDesignPath='Designs/Artwork/Assorted Design/Thornure.ctf') => {
  return (dispatch) => {
    fetchDesignList({ struct: true }).then((nestedDesignList) => {
      const {
        copiedNode: tree,
        selectedFile,
        selectedFolder,
      } = arrangeTree({
        tree: nestedDesignList,
        initDesignPath:initDesignPath!==''? initDesignPath : null,
        setActiveItem: true,
        expandSelectedFolder: true,
        keepFoldersExpanded: false,
      });
      dispatch(
        setDesignList({
          tree: tree,
          selectedFolder,
          selectedFile,
        })
      );
    });
  };
};

export const getDesignThumbnails = ({ designs, tree }) => {
  return (dispatch) => {
    fetchDesignThumbnails({ designs }).then((thumbs) => {
      tree = updateFilesInEveryNode(tree, thumbs);
      dispatch(
        setDesignList({
          tree: tree,
        })
      );
    });
  };
};

export const onDesignThumbnailClick = (node, index, activeVariation) => {
 
  return (dispatch) => {
    dispatch(
      selectDesign({
        selectedFile: node,
        activeVariation: activeVariation,
      })
    );
  };
};
