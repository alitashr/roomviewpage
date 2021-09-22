import React, { useState, useRef, useEffect } from 'react';

import PropTypes from "prop-types";
import classNames from "classnames";
const Thumbnail = props => {
  const {
    className,
    thumb,
    onRemoveClicked,
    onThumbnailClick,
    hasRemove,
    imageRotated,
    aspect = "portrait",
    showTitle = true,
    active,
    thumbType,
    datatitle=''
  } = props;
  let { thumbUrl, name} = thumb;
  const { Thumb, Name } = thumb;
  thumbUrl = thumbUrl ? thumbUrl: Thumb;
  name = name ? name:Name;
  const [isHovering, setIsHovering] = useState(false);
  const [isloading, setIsloading] = useState(true);
  const thumbImg = useRef(null);
  const ref = useRef(null);

  useEffect(() => {
    setIsloading(true);
    if (!thumbUrl) return;
    const image = new Image();
    image.src = thumbUrl;
    image.onload = () => {
      try {
        if(thumbImg.current)
        {
          thumbImg.current.src = image.src;
          thumbImg.current.backgroundImage = image.src;  
        }
      } catch (error) {
        console.error(error);
      }
      setIsloading(false);
    };
  }, [thumbUrl]);
  const rendername = name => {
    return (
      <>
        {name &&
          name.split("~").map((item, i) => {
            return <p key={i}>{item}</p>;
          })}
      </>
    );
  };

  const getBgImage = (designThumbsAsBg= false) => {
    if (
      !designThumbsAsBg ||
      thumbType === "ROOM_THUMBS"
    )
      return "none";
    const thumbSrc = thumbImg.current !== null ? "url(" + thumbImg.current.src + ")" : "none";
    return thumbSrc;
  };
  
  return (
    <div
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className={classNames("designThumb-template0 thumb-item", { active: active }, className)}
      onClick={e => {
        if (onThumbnailClick) onThumbnailClick(e);
      }}
      ref={ref}
      datatitle={datatitle!==''? datatitle : null}
    >
      <div
        className={classNames("thumb-image-container", aspect, {
          "skeleton": !thumbUrl || isloading
        })}
        style={{
          backgroundImage: getBgImage(),
          backgroundSize: thumbImg && thumbImg.current && thumbImg.current.width<100? "auto": "contain"
        }}
      >
        <img
          className={classNames(`thumb-image fit-width`, {
            rotated: imageRotated,
            "thumb-hidden": getBgImage() !== "none"
          })}
          ref={thumbImg}
          alt="thumbnail"
        />
      </div>
      {/* {hasRemove && isHovering && (
        <CircularButton
          icon="close"
          size="small"
          className="close-button"
          onClick={e => {
            e.stopPropagation();
            if (onRemoveClicked) onRemoveClicked(e);
          }}
        />
      )} */}
      {showTitle && (
        <span className="thumb-title" title={name}>
          {rendername(name)}
        </span>
      )}
    </div>
  );
};

Thumbnail.propTypes = {
  className: PropTypes.string,
  thumb: PropTypes.object,
  hasRemove: PropTypes.bool,
  onRemoveClicked: PropTypes.func,
  onThumbnailClick: PropTypes.func,
  thumbnailType: PropTypes.oneOf(["portrait", "landscape"]),
  showTitle: PropTypes.bool
};
export default Thumbnail;
