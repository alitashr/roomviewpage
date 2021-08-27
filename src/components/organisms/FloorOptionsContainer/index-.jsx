import { useDispatch, useSelector } from 'react-redux';
import React, { useEffect, useState } from "react";
import { Popover } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import AtButton from "../../atoms/AtButton";
import Thumbnail from '../../molecules/Thumbnail';
import { getFloor } from '../../../api/appProvider';
import LazyThumbnail from '../../molecules/LazyThumbnail';
import { setActiveFloorOption, setFloorOptions } from '../../../redux';

const FloorOptionsContainer = (props) => {
  const { handleClose, className='' } = props;
  
  const floorOptions = useSelector(state=> state.room.floorOptions);
  const dispatch = useDispatch();  
  const [showPopover, setShowPopover] = useState(false);
  const onSelectFloor = () => {
    setShowPopover(true);
  };
  useEffect(()=>{
    getFloor().then(floors=>{
      dispatch(setFloorOptions(floors))
    });
  },[]);

  const handleThumbClick = (floor)=>{
    dispatch(setActiveFloorOption(floor))
  }

  const handleVisibleChange = (visible) => {
    setShowPopover(visible);
  };
  return (
    <>
    { floorOptions && 
      <Popover
        overlayClassName="color-selection-box-popover"
        content={
          <div className="at-popup flooroptions-popup">
            <div className="ant-popover-title">
              Select Floor <CloseOutlined className="at-icon-close" onClick={() => handleVisibleChange(false)} />
            </div>
            <div className="thumb-container flooroptions-thumbs-wrapper">
              {floorOptions.floors.map((floor, i) => (
                <LazyThumbnail
                {...props}
                node={{ Thumb: floor.path, label: floor.name }}
                active={floor.path === floorOptions.activeFloor.path}
                key={i}
                aspect="landscape"
                onThumbnailClick={() => handleThumbClick(floor)}
              />
              ))}
            </div>
          </div>
        }
        trigger="click"
        visible={showPopover}
        onVisibleChange={(visible) => handleVisibleChange(visible)}
      >
        <AtButton
          text="Select Floor"
          type="primary"
          className="at-room-studio-page at-btn-selectFloor"
          onClick={onSelectFloor}
        ></AtButton>
      </Popover>
    }
    </>
  );
};


FloorOptionsContainer.propTypes = {
  
};

export default FloorOptionsContainer;