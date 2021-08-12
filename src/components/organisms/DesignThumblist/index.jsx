import classNames from 'classnames';
import React, { PropTypes } from 'react';
import LazyThumbnail from '../../molecules/LazyThumbnail';

const DesignThumblist = props => {
  const { onThumbnailClick, selectedFile = {}, files = [], className='' } = props;
  return (
    <div className={classNames("thumb-container", className)}>
      {files.map((file, index) => (
        <LazyThumbnail
          {...props}
          node={file}
          key={index}
          onThumbnailClick={() => onThumbnailClick && onThumbnailClick(file, index)}
          active={file.id === selectedFile.id}
        />
      ))}
    </div>
  );
};

DesignThumblist.propTypes = {
  
};

export default DesignThumblist;