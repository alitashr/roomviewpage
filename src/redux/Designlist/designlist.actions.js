import { fetchDesignList, fetchDesignThumbnails } from "../../api/appProvider";
import { arrangeTree, findInTree, updateFilesInEveryNode } from "../../utils/treeutils";

const SET_TREE = "SET_TREE";
export const designlistActions = {
  SET_TREE,
};

const setDesignList = (payload) => {
  return {
    type: designlistActions.SET_TREE,
    payload: payload,
  };
};

export const getDesignList = () => {
  return (dispatch) => {
    fetchDesignList({ struct: true }).then((nestedDesignList) => {
      const {
        copiedNode: tree,
        selectedFile,
        selectedFolder,
      } = arrangeTree({
        tree: nestedDesignList,
        setActiveItem: true,
        expandSelectedFolder: true,
        keepFoldersExpanded: false,
      });
      console.log("fetchDesignList -> selectedFile, selectedFolder", selectedFile, selectedFolder);
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
