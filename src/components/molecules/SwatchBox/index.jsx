import classNames from 'classnames';
import React, { PropTypes, useState } from 'react';

const SwatchBox = props => {
  
  const { swatchSize, colorRow, onColorSwatchClick, active, handleHover, swatchSpace, showColorName=true } = props;
  const disabledSwatch = colorRow.ColorName.toLowerCase() === "_blank";
  const [hover, setHover] = useState(null);
  //const ref = useRef(null);
  return (
    <div
    style={{
      margin: `${swatchSpace}rem`,
      width: `${swatchSize}rem`,
      height: `${swatchSize}rem`,
      backgroundColor: `${!disabledSwatch ? colorRow.Color : "transparent"}`
    }}
    onClick={e => {
      // setScrollTo(false);
      if (onColorSwatchClick) onColorSwatchClick(e);
    }}
    className={classNames("color-swatch", { "color-swatch--disabled": disabledSwatch, active })}
  
    >
        {showColorName && <span className="at-swatchbox__text">{colorRow.ColorName}</span>}
    
    </div>
  );
};

SwatchBox.propTypes = {
  
};

export default SwatchBox;