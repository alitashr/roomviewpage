import {v4 as uuid} from "uuid";
import { getPathOffile } from "./stringUtils";

export const getAllFiles = array => {
  const arr = [...array];
  console.log("arr", arr)
  const files = [];
  arr.forEach(function iter(a) {
    files.push(...a.files);
    Array.isArray(a.children) && a.children.forEach(iter);
  });
  return files;
};
export const updateFilesInEveryNode = (tree, fileList) => {
  const arr = [...tree];
  arr.forEach(function iter(a) {
    const files = fileList.filter(item => item.location.toLowerCase() === a.fullPath.toLowerCase());
    a.files = files;
    Array.isArray(a.children) && a.children.forEach(iter);
  });
  return arr;
};

export function findInTree({ rawTree, initDesignPath, initDesignFolder, initDesignName }) {
  if (!initDesignPath && !initDesignName) return;
  const arr = [...rawTree];
  let designPath;

  arr.forEach(function iter(a) {
    if (designPath) return;
    let des;
    des = a.Children.find(item => {
      const findType = initDesignFolder ? "folder" : "file";
      let requiredItem =
        item.Type === findType && item.FullPath.toLowerCase() === initDesignPath.toLowerCase();

      if (initDesignName && initDesignName !== "") {
        requiredItem =
          item.Type === findType &&
          (item.FullPath.toLowerCase() === initDesignPath.toLowerCase() ||
            item.FullPath.toLowerCase().indexOf(initDesignName.toLowerCase()) >= 0);
      }
      return requiredItem;
    });

    if (des) {
      designPath = des.FullPath;
    }
    Array.isArray(a.Children) && a.Children.forEach(iter);
  });

  return designPath;
}


const findVariations = (fileNode, parentNode) => {
  const { Children } = parentNode;
  const { Name } = fileNode;
  const filtered = Children.filter(item => item.Name[0] === ".");
  const varFolder = filtered.find(item => item.Name.toLowerCase() === `.${Name.toLowerCase()}`);
  if (!varFolder) return null;
  const varFiles = varFolder.Children.filter(child => child.Type === "file").map(item => ({
    name: item.Name,
    type: item.Type,
    fullPath: item.FullPath,
    location: item.Location,
    id: uuid()
  }));
  if (varFiles.length) return { vars: varFiles };
  let colors = [];
  let shapes = [];
  const varColorsFolder = varFolder.Children.find(
    child => child.Type === "folder" && child.Name.toLowerCase() === "colors"
  );
  if (varColorsFolder) {
    colors = varColorsFolder.Children.filter(item => item.Type === "file").map(item => ({
      name: item.Name,
      type: item.Type,
      fullPath: item.FullPath,
      location: item.Location,
      id: uuid()
    }));
  }
  const varShapesFolder = varFolder.Children.find(
    child => child.Type === "folder" && child.Name.toLowerCase() === "shapes"
  );
  if (varShapesFolder) {
    shapes = varShapesFolder.Children.filter(item => item.Type === "file").map(item => ({
      name: item.Name,
      type: item.Type,
      fullPath: item.FullPath,
      location: item.Location,
      id: uuid()
    }));
  }
  return { colors, shapes };
};
export function arrangeTree({
  tree,
  initDesignPath,
  setActiveItem = true,
  designfromFolder = false,
  expandSelectedFolder = false,
  keepFoldersExpanded
}) {  
  let defaultFileLocation;
  if (!!initDesignPath)
    defaultFileLocation = designfromFolder ? initDesignPath : getPathOffile(initDesignPath);
  return deepCopy(tree[0]);
  function deepCopy(node) {
    const { Children, Type, Name, FullPath, Location } = node;
    const fileNodes = Children.filter(child => child.Type === "file");
    const files = fileNodes.map(item => ({
      type: item.Type,
      name: item.Name,
      fullPath: item.FullPath,
      location: item.Location,
      id: uuid(),
      variations: findVariations(item, node)
    }));
    let level = 0;
    let selectedFile = null;
    let selectedFolder = null;
    let isSelected = false;
    let isExpanded = false;
    let showThumbnails = false;
    if (!selectedFile) {
      if (initDesignPath) {
        if (!designfromFolder) {
          const item = files.find(
            item => item.fullPath.toLowerCase() === initDesignPath.toLowerCase()
          );
          showThumbnails = !!item;
          selectedFile = item;
          isSelected =
            setActiveItem && FullPath.toLowerCase() === defaultFileLocation.toLowerCase();
          isExpanded = setActiveItem && initDesignPath.split("/").includes(Name);
        } else {
          isSelected =
            setActiveItem && FullPath.toLowerCase() === defaultFileLocation.toLowerCase();
          isExpanded = setActiveItem && initDesignPath.split("/").includes(Name);
          if (isSelected) {
            if (files.length) {
              selectedFile = files[0];
              showThumbnails = true;
            } else {
              isSelected = false;
              initDesignPath = null;
            }
          }
        }
      } else {
        if (Name.charAt(0) !== "." && files.length) {
          selectedFile = files[0];
          isSelected = setActiveItem;
          isExpanded = showThumbnails = expandSelectedFolder && setActiveItem;
        } else {
          isExpanded = true;
        }
      }
    }
    if (keepFoldersExpanded) isExpanded = true;
    let copiedNode = {
      type: Type,
      name: Name,
      fullPath: FullPath,
      location: Location,
      children: [],
      showThumbnails,
      files,
      isSelected,
      isExpanded,
      level,
      id: uuid()
    };
    const folderNodes = Children.filter(child => child.Type === "folder");
    copiedNode["children"] = Array(folderNodes.length);
    folderNodes.forEach((child, index) => {
      copiedNode.children[index] = {
        type: null,
        name: null,
        fullPath: null,
        location: null,
        children: [],
        files: null
      };
      traverse(child, copiedNode.children[index]);
    });
    if (isSelected) selectedFolder = copiedNode;

    function traverse(node, copyNode) {
      const { Children, Type, Name, FullPath, Location } = node;
      const fileNodes = Children.filter(child => child.Type === "file");
      const files = fileNodes.map(item => ({
        type: item.Type,
        name: item.Name,
        fullPath: item.FullPath,
        location: item.Location,
        id: uuid(),
        variations: findVariations(item, node)
      }));
      let isSelected = false;
      let isExpanded = false;
      let showThumbnails = false;
      if (!selectedFile)
        if (initDesignPath) {
          if (!designfromFolder) {
            const item = files.find(
              item => item.fullPath.toLowerCase() === initDesignPath.toLowerCase()
            );
            showThumbnails = !!item;
            selectedFile = item;
            isSelected =
              setActiveItem && FullPath.toLowerCase() === defaultFileLocation.toLowerCase();
            isExpanded = setActiveItem && initDesignPath.split("/").includes(Name);
          } else {
            isSelected =
              setActiveItem && FullPath.toLowerCase() === defaultFileLocation.toLowerCase();
            isExpanded = setActiveItem && initDesignPath.split("/").includes(Name);
            if (isSelected) {
              if (files.length) {
                selectedFile = files[0];
                showThumbnails = true;
              } else {
                isSelected = false;
                showThumbnails = false;
                initDesignPath = null;
              }
            }
          }
        } else {
          if (Name.charAt(0) !== "." && files.length) {
            isSelected = setActiveItem;
            isExpanded = showThumbnails = expandSelectedFolder && setActiveItem;
            selectedFile = files[0];
          } else {
            isExpanded = true;
          }
        }
      if (keepFoldersExpanded) isExpanded = true;
      copyNode["type"] = Type;
      copyNode["name"] = Name;
      copyNode["fullPath"] = FullPath;
      copyNode["location"] = Location;
      copyNode["children"] = Type;
      copyNode["files"] = files;
      copyNode["isSelected"] = isSelected;
      copyNode["isExpanded"] = isExpanded;
      copyNode["showThumbnails"] = showThumbnails;
      copyNode["level"] = Location.split("/").length;
      copyNode["id"] = uuid();
      const folderNodes = Children.filter(child => child.Type === "folder");
      copyNode["children"] = Array(folderNodes.length);

      folderNodes.forEach((child, index) => {
        copyNode.children[index] = {
          type: null,
          name: null,
          fullPath: null,
          location: null,
          children: [],
          files: null
        };
        traverse(child, copyNode.children[index]);
      });
      if (isSelected) selectedFolder = copyNode;
    }
    return { copiedNode: [copiedNode], selectedFile, selectedFolder };
  }
}