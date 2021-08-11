import classNames from 'classnames';
import React, { PropTypes } from 'react';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setDesignDetails } from '../../../redux/Design/designActions';
import { fetchBasicDetails } from '../../../redux/Room/roomActions';
import { preload } from '../../../utils/fileUtils';
import RoomView from '../RoomView';

const RoomContainer = props => {
  const {className} = props;
  const roomData = useSelector(state=> state.room);
  const dispatch = useDispatch();
  
  const designData = useSelector(state=> state.design);
 // const designDispatch = useDispatch();

  useEffect(()=>{
    dispatch(setDesignDetails()) 
    dispatch(fetchBasicDetails()) 
  },[]);

  useEffect(() => {
    if (roomData.config) {
      console.log("useEffect -> roomData", roomData)
      const { Files: files, baseUrl, config } = roomData;
      preload({ baseUrl, config, files });
    }
  }, [roomData]);
  useEffect(()=>{
    console.log("designData", designData)

  }, [designData])
  return (
    <div className={classNames("at-roomview-container", className)}>
    {roomData.config && designData.designImagePath!=='' && (
      <RoomView
        onRendered={() => {
          console.log("room has been rendered");
        }}
        onRoomLoaded={() => {
          // console.log("room has been loaded");
        }}
        roomData={roomData}
        designImageProps={designData}
      />
    )}
    
  </div>
  );
};

RoomContainer.propTypes = {
  
};

export default RoomContainer;