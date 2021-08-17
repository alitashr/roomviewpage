import { Popover } from "antd";
import React, { PropTypes, useEffect } from "react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getDesignThumbnails, onDesignThumbnailClick, setDesignDetails } from "../../../redux";
import {CloseOutlined } from '@ant-design/icons';
import { getAllFiles } from "../../../utils/treeutils";
import AtButton from "../../atoms/AtButton";
import DesignThumblist from "../DesignThumblist";

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
    if(node.designProps)
      dispatch(setDesignDetails({
        name: node.name, 
        fullpath: node.fullPath,
        designProps: node.designProps}))

  };
  const handleVisibleChange = visible => {  
    setShowPopover(visible);
  };
  const onSelectRug = () => {
    setShowPopover(true);
  };
  return (
    <>
    {selectedFolder && selectedFolder.files && (
      <Popover
        content={<div className="at-designlist-container"> 
        <div className="ant-popover-title">Select Rug <CloseOutlined className="at-icon-close" onClick={()=>handleVisibleChange(false)} /></div>
        <DesignThumblist
        className='at-popover-design-list'
          files={selectedFolder.files}
          selectedFile={selectedFile}
          onThumbnailClick={onThumbnailClick}
        ></DesignThumblist>
        </div>}
        title={null}
        trigger="click"
        visible={showPopover}
        onVisibleChange={(visible)=>handleVisibleChange(visible)}
      >
       <AtButton text="Select Rug" type="primary" className="at-room-studio-page at-btn-selectrug" onClick={onSelectRug}></AtButton>

      </Popover>

     
      )}
    </>
  );
};

DesignlistContainer.propTypes = {};

export default DesignlistContainer;
