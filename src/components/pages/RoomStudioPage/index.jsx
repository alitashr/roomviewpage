import React, { useEffect } from 'react';
import { useMount } from 'react-use';
import { useDispatch, useSelector } from 'react-redux';
import { autoLogin } from '../../../api/appProvider';
import AtButton from '../../atoms/AtButton';
import RoomContainer from '../../organisms/RoomContatiner';

import { getDesignList } from '../../../redux';
import DesignlistContainer from '../../organisms/DesignlistContainer';

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
  useEffect (()=>{
    console.log('roomstudiopage=> ',designlist)
  }, [designlist])

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
    <div>
      <RoomContainer></RoomContainer>
      <AtButton text="See in your own room" className="at-room-studio-page at-btn-myroom" onClick={onMyroomClick}></AtButton>
      <AtButton text="Customize Rug" className="at-room-studio-page -btn-myroom" onClick={onCustomizeRug}></AtButton>

      <DesignlistContainer></DesignlistContainer>
    </div>
  );
};

RoomStudioPage.propTypes = {
  
};

export default RoomStudioPage;