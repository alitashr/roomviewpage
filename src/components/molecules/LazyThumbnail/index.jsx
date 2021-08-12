import React, { PropTypes } from 'react';
import Thumbnail from '../Thumbnail';
import { useInView } from "react-intersection-observer";
import { useEffect } from 'react';

const LazyThumbnail = props => {
  
  const { node, onThumbnailClick, ...otherProps } = props;
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.25
  });
  useEffect(()=>{
    if(!inView) return;
    const loadDesignThumbnail = async () => {
      if (node.thumbUrl) return;
      //noe get thumbs
    }
    loadDesignThumbnail()
  },[inView, node])

  const handleThumbClick = (node, e) => {
    if (onThumbnailClick) {
      onThumbnailClick(node, e);
    }
  };
  return (
    <div ref={ref} className="thumb-item-container">
      {renderThumbnails({
        template: 1,
        node,
        handleThumbClick,
        otherProps
      })}
      {/* <Thumbnail {...otherProps} thumb={node} onThumbnailClick={handleThumbClick} /> */}
    </div>
  );
};
const renderThumbnails = ({template=1,  node, handleThumbClick, otherProps})=>{
  switch (template) {
    case 1:
      return <Thumbnail {...otherProps} thumb={node} onThumbnailClick={handleThumbClick} />;
    default:
      return <Thumbnail {...otherProps} thumb={node} onThumbnailClick={handleThumbClick} />;
  
  }
}

LazyThumbnail.propTypes = {
  
};


export default LazyThumbnail;