import React, { useEffect } from "react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getDesignThumbnails, onDesignThumbnailClick, setDesignDetails } from "../../../redux";
import AtButton from "../../atoms/AtButton";
import DesignThumblist from "../DesignThumblist";
import PopoverWrapper from "../PopoverWrapper";

const DesignlistContainer = (props) => {
  const selectedFolder = useSelector((state) => state.designlist.selectedFolder);
  const selectedFile = useSelector((state) => state.designlist.selectedFile);
  const tree = useSelector((state) => state.designlist.tree);
  const dispatch = useDispatch();
  const [showPopover, setShowPopover] = useState(false);

  useEffect(() => {
    if (!selectedFolder) return;
    const files = selectedFolder.files;
    dispatch(getDesignThumbnails({ designs: files, tree }));
  }, [selectedFolder]);

  const onThumbnailClick = (node, index, activeVariation) => {
    // //if (!file.designProps) return;
    dispatch(onDesignThumbnailClick(node, index, activeVariation));
    if (node.designProps)
      dispatch(
        setDesignDetails({
          name: node.name,
          fullpath: node.fullPath,
          designProps: node.designProps,
        })
      );
  };

  const onSelectRug = () => {
    setShowPopover(true);
  };
  return (
    <>
      {selectedFolder && selectedFolder.files && (
        <PopoverWrapper
          className="designlist-popover"
          show={showPopover}
          contentWrapperClassname="designlist-popup"
          title="Select Rug"
          content={
            <DesignThumblist
              className="at-popover-design-list"
              files={selectedFolder.files}
              selectedFile={selectedFile}
              onThumbnailClick={onThumbnailClick}
            ></DesignThumblist>
          }
        >
          <AtButton
            text="Select Rug"
            type="primary"
            className="at-room-studio-page at-btn-selectrug"
            onClick={onSelectRug}
          ></AtButton>
        </PopoverWrapper>
      )}
    </>
  );
};

DesignlistContainer.propTypes = {};

export default DesignlistContainer;
