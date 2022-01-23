import classNames from 'classnames';
import React, { useState } from 'react';

function preventDefaults(e) {
  e.preventDefault();
  e.stopPropagation();
}
const ImageDropContainer = props => {
  const {onImageChange} = props;
  const [highlight, setHighlight] = useState(false);
  
  const handleDragEnter = (e)=>{
    preventDefaults(e);
    setHighlight(true)
  }
  const handleDragLeave = (e)=>{
    preventDefaults(e);
    setHighlight(false)
  }
  const handleDrop=(e)=>{
    preventDefaults(e);
  let dt = e.dataTransfer;
      let files = dt.files;
      onImageChange(files[0]);
      setHighlight(false)
    
  }
  const handleFileInput=(e)=>{
    if(e.target.files){
      onImageChange(e.target.files[0])
    }
  }
  return (
    <>
         <label className="custom-file-label" htmlFor="customFile">
          <div id="imageDropContainer" className={classNames({'highlight': highlight})} 
          onDragEnter={handleDragEnter}
          onDrop={handleDrop}
          onDragLeave={handleDragLeave}
          onDragOver={preventDefaults}
          >
            <div className="col-sm-12 btn-container">
              <div className="custom-file">
                <input type="file" className="custom-file-input" id="customFile" accept="image/*"
                onChange={handleFileInput} />
                <div className='custom-file-title'>View your own design in this room</div> 
                <div id="uploadMessage">
                {/* For best result, please select a high resolution image */}
                </div>
              </div>
            </div>
          </div>
        </label>

    </>
  );
};

ImageDropContainer.propTypes = {
  
};

export default ImageDropContainer;