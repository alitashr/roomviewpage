import React, { PropTypes, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getDesignThumbnails } from '../../../redux';
import { getAllFiles } from '../../../utils/treeutils';
import DesignThumblist from '../DesignThumblist';

const DesignlistContainer = props => {
  
  const selectedFolder = useSelector(state=> state.designlist.selectedFolder);
  
  const selectedFile = useSelector(state=> state.designlist.selectedFile);
  const tree = useSelector(state=> state.designlist.tree);
  const dispatch = useDispatch();
  useEffect(()=>{
    if(!selectedFolder) return;
    const files = selectedFolder.files;
  dispatch(getDesignThumbnails({designs: files, tree}))
    
  }, [selectedFolder])
  const onThumbnailClick=()=>{
    console.log('onThumbnailClick--')
  }
  return (
    <div>
      this is designlist

      {selectedFolder && selectedFolder.files && (
      <DesignThumblist files={selectedFolder.files}
      selectedFile={selectedFile}
      onThumbnailClick={onThumbnailClick}>

      </DesignThumblist>)}
    </div>
  );
};

DesignlistContainer.propTypes = {
  
};

export default DesignlistContainer;