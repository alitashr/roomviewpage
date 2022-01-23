import React, { PropTypes, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useMount } from 'react-use';
import { autoLogin, fetchDesignThumbnails } from '../../../api/appProvider';
import { changeRugPhySize, getDesignList, getDesignThumbnails, selectThisDesign, setDesignDetails } from '../../../redux';
import RoomContainer from '../../organisms/RoomContainer';
import VisualizationJpeg from '../../organisms/Visualization/VisualizationJpeg';

const BorderRugsPage = props => {
  const designlist = useSelector((state) => state.designlist);
  const design = useSelector((state) => state.design);

  const dispatch = useDispatch();

  useMount(() => {
    window.flags = {};
    window.InterfaceElements = {};

   const initDesign = sessionStorage.getItem('initdesign')
   console.log("useMount -> initDesign", initDesign)
    autoLogin().then((key) => {
      if (key.Key && key.Key !== "") {
        dispatch(getDesignList({initDesignPath:initDesign}));
        //get flags
      }
    });
  });

  useEffect(() => {
    if(!designlist.selectedFile) return;

    console.log("useEffect -> designlist.selectedFile", designlist.selectedFile, [designlist.selectedFile.fullPath]);
    //dispatch(getDesignThumbnails({ designs: [designlist.selectedFile.fullPath], tree }));
    
   fetchDesignThumbnails({ designs:[designlist.selectedFile] }).then((thumbs) => {
    const selectedThumb = thumbs[0];
     dispatch(
      setDesignDetails({
        name: selectedThumb.name,
        fullpath: selectedThumb.fullPath,
        designProps:selectedThumb.designProps,
      })
    );
    });
    
  }, [designlist.selectedFile]);
  
  const handleRugPhysicalSizeChange = () => {
    const payload= {
          PhysicalHeight: parseFloat(4),
          PhysicalWidth: parseFloat(8)
        }
        dispatch(changeRugPhySize(design,payload))
  };
  return (
    <div>
      BorderRugsPage
      <button class="changeSize" onClick={handleRugPhysicalSizeChange}> change size</button>
      {
        design && <RoomContainer></RoomContainer>
      }
      
      <VisualizationJpeg></VisualizationJpeg>
    </div>
  );
};

BorderRugsPage.propTypes = {
  
};

export default BorderRugsPage;