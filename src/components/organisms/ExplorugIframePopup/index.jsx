import React, { PropTypes } from 'react';
import PopupContainer from '../../molecules/PopupContainer';

const ExplorugIframePopup = props => {
  
  const { iframeID = "explorugIframe",showExplorugPopup, explorugPopUpUrl='', onClose} = props;
 
  const onIframeLoad = () => {
    console.log("loaded.....explorugIframe...... iframe");
  //const url = "https://v3.explorug.com/explorug.html?page=beyonddreams2&?&initdesign=Artwork/Assorted Design/Tappeto Classico.ctf&mode=ecat&customclass=no-color-cust selected-views-only view-tappeto";

  //   // explorugLinkDomain +
  //   // "explorug.html?page=beyonddreams2&?&initdesign=Designs/Artwork/Transitional/Fritanas.ctf&mode=ecat&customclass=selected-views-only view-monalisa";
  // postMessageToExplorugIframe(url);

  };

  const onPopupClose=(e)=>{
   if(onClose) onClose();
  }

  return (
    <React.Fragment>
    <PopupContainer
    className="explorugIframe-wrapper"
     showIframePopup={showExplorugPopup}
      iframeUrl = {explorugPopUpUrl}
      //onLoad={onIframeLoad}
       onIframeLoadSuccess = {onIframeLoad}
       onClose={onPopupClose} 
       isMosaic={false}
       iframeID={iframeID}

    ></PopupContainer>
    </React.Fragment>
  );
};

ExplorugIframePopup.propTypes = {
  
};

export default ExplorugIframePopup;