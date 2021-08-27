import React, { useEffect } from 'react';
import { useMount } from 'react-use';
import { useDispatch, useSelector } from 'react-redux';
import { autoLogin } from '../../../api/appProvider';
import AtButton from '../../atoms/AtButton';
import RoomContainer from '../../organisms/RoomContatiner';

import { getDesignList } from '../../../redux';
import DesignlistContainer from '../../organisms/DesignlistContainer';
import ColorlistContainer from '../../organisms/ColorListContainer';
import FloorOptionsContainer from '../../organisms/FloorOptionsContainer/index-';

const RoomStudioPage = props => {
  const designlist = useSelector(state=> state.designlist);
  const dispatch = useDispatch();
  useMount(()=>{
    autoLogin()
    .then(key => {
    if(key.Key && key.Key!==''){
      dispatch(getDesignList())
    }
    })
  });

  const onCustomizeRug = () => {
    window.open(window.urlToOpen, "_blank");
  };
  const onMyroomClick = () => {
    let url = window.urlToOpen;
    url = url.substr(url.indexOf("?"), url.length - 1);
    const json = window.getJsonFromUrl(url);
    const myRoomUrl = window.getExplorugUrl({ page: json.page, initDesign: json.initdesign, initView: "myroom" });
    window.open(myRoomUrl, "_blank");
  };
  return (
    <div className='room-studio-page'>
      
      <RoomContainer></RoomContainer>
      <div className="at-mainbuttons-container">
      <AtButton text="See in your own room" className="at-room-studio-page at-btn-myroom" onClick={onMyroomClick}></AtButton>
      <AtButton text="Customize Rug" className="at-room-studio-page -btn-myroom" onClick={onCustomizeRug}></AtButton>

      <DesignlistContainer></DesignlistContainer>
      <ColorlistContainer></ColorlistContainer>
      <FloorOptionsContainer></FloorOptionsContainer>
    
      </div>
      </div>
  );
};

RoomStudioPage.propTypes = {
  
};

export default RoomStudioPage;