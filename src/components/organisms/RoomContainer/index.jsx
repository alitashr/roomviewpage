import classNames from 'classnames';
import React from 'react';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setInitialDesignProps } from '../../../redux/Design/designActions';
import { fetchBasicRoomDetails } from '../../../redux/Room/roomActions';
import { preload } from '../../../utils/fileUtils';
import RoomViewNew from '../RoomviewNew';

const RoomContainer = props => {
  const {className, onRoomRendered} = props;
  const roomDetails = useSelector(state=> state.room.roomDetails);
  const roomData = useSelector(state=> state.room);
  const dispatch = useDispatch();  
  const designData = useSelector(state=> state.design);
 
  useEffect(()=>{
    dispatch(setInitialDesignProps()) 
    dispatch(fetchBasicRoomDetails()) 
  },[]);

  useEffect(() => {
   
    if (roomDetails.config) {
      const { Files: files, baseUrl, config } = roomDetails;
      if(!files || !files.length || !baseUrl || !config) return;
      preload({ baseUrl, config, files });
    }
  }, [roomDetails]);
  
 
  
  return (
    <div className={classNames("at-roomview-container", className)}>
    {roomDetails && roomDetails.Files.length && roomDetails.baseUrl && roomDetails.config && (
      <RoomViewNew
        onRendered={() => {
          console.log("room has been Rendered");
          
          if(onRoomRendered) onRoomRendered();
        }}
        onRoomLoaded={() => {
          console.log("room has been loaded");

          if(onRoomRendered) onRoomRendered();
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