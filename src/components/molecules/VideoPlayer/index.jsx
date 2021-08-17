import React, { useEffect, useState } from "react";

const VideoPlayer = (props) => {
  const {
    id = "bd_video_player",
    className = "",
    pauseVideo=false,
    src = "",
    videoType = "video/mp4",
    onVideoLoad
  } = props;
  const vidRef = React.useRef();

  
  useEffect(()=>{
    if(pauseVideo){
      vidRef.current.pause();
    }
    else{
      vidRef.current.play();
    }
  },[pauseVideo]);

  const videoLoad = () => {
    if(onVideoLoad) onVideoLoad();
    vidRef.current.play();
  };
  
  return (
    <div id={id} className={className}>
      <video className="object-fit" muted="muted" ref={vidRef} autoPlay loop onCanPlay={videoLoad}>
        <source src={src} type={videoType} />
        Sorry, your browser doesn't support embedded videos.
      </video>
    </div>
  );
};

VideoPlayer.propTypes = {};

export default VideoPlayer;
