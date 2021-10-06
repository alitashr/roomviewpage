import React, { PropTypes } from 'react';
import { useDispatch } from 'react-redux';
import { useMount } from 'react-use';
import { autoLogin } from '../../../api/appProvider';
import { getDesignList } from '../../../redux';
import VisualizationJpeg from '../../organisms/Visualization/VisualizationJpeg';

const BorderRugsPage = props => {
  const dispatch = useDispatch();
  useMount(() => {
    window.flags = {};
    window.InterfaceElements = {};

    autoLogin().then((key) => {
      if (key.Key && key.Key !== "") {
        dispatch(getDesignList());
        //get flags
      }
    });
  });
  return (
    <div>
      BorderRugsPage
      <VisualizationJpeg></VisualizationJpeg>
    </div>
  );
};

BorderRugsPage.propTypes = {
  
};

export default BorderRugsPage;