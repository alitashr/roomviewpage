import React, { PropTypes } from 'react';

const SwatchContainer = props => {
  const { swatchSize ,  swatchSpace, colorRows, children} = props;
  return (
    <div className="swatch-container"
    style={{
      height: `${(props.swatchSize + 2 * props.swatchSpace) * props.colorRows + 1.25}rem`,
      padding: `${props.swatchSpace}rem`
    }}>
{children}
      
    </div>
  );
};

SwatchContainer.propTypes = {
  
};

export default SwatchContainer;