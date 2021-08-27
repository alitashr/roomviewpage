import classNames from 'classnames';
import React from 'react';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setInitialDesignProps, setDesignName, setDesignImagePath } from '../../../redux/Design/designActions';
import { fetchBasicDetails } from '../../../redux/Room/roomActions';
import { preload } from '../../../utils/fileUtils';
import RoomView from '../RoomView';

const RoomContainer = props => {
  const {className} = props;
  const roomData = useSelector(state=> state.room);
  const dispatch = useDispatch();  
  const designData = useSelector(state=> state.design);
  const designlist = useSelector(state=> state.designlist);
 

  useEffect(()=>{
    dispatch(setInitialDesignProps()) 
    dispatch(fetchBasicDetails()) 
  },[]);

  useEffect(() => {
    if (roomData.config) {
      const { Files: files, baseUrl, config } = roomData;
      preload({ baseUrl, config, files });
    }
  }, [roomData]);

 
  useEffect(() => {
    console.log('designData ', designData)
  }, [designData]);
  
  useEffect(() => {
    console.log(designData, designlist);
    if(!designlist.selectedFile || !designData.designName) return;
    
    if(designlist.selectedFile.name.toLowerCase() !== designData.designName.toLowerCase()){
      console.log('designlist ', designlist.selectedFile.name, designData.designName )
      //dispatch(setDesignName(designlist.selectedFile.name));

      //(setDesignImagePath(designImagePath));
  
    }
    
  }, [designlist.selectedFile]);
  
 
  
  return (
    <div className={classNames("at-roomview-container", className)}>
    {roomData.config && designData.designImagePath!=='' && (
      <RoomView
        onRendered={() => {
        
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