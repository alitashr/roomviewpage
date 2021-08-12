import classNames from 'classnames';
import React, { PropTypes, useState } from 'react';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { checkColorSorting } from '../../../redux';
import ColorPaletteDropdown from '../../molecules/ColorPaletteDropdown';
import SwatchBox from '../../molecules/SwatchBox';
import SwatchContainer from '../../molecules/SwatchContainer';

const ColorSelectionBox = props => {
  const {
    onColorSwatchClick,
    swatchSpace = 0.15,
    className = "",
    selectColorOnClick = true,
    selectionColor,
    style,
    renderTexturedPreview = true,
    onClose,
    swatchSize =2,
    ...otherprops
  } = props;

  const colorData = useSelector((state) => state.color);
  const { collections, collectionIndex, loading, activeColor, filteredCollection, colorTextures } = colorData;
  const dispatch = useDispatch();
  const [colorCollection, setColorCollection] = useState(null);
  const [hoveredBox, setHoveredBox] = useState(null);
  useEffect(()=>{
    if (!filteredCollection) return;
    const sortColorCollection = checkColorSorting(filteredCollection);
    setColorCollection({ ...filteredCollection, ColorRows: sortColorCollection });
  }, [collectionIndex, filteredCollection]);
  const handleColorSwatchClick = (color, e) => {
    e.stopPropagation();
    console.log('handleColorSwatchClick')
  };

  return (
    <div className={classNames("color-selection-box")}>
    {
      collections.length>1 && 
      <ColorPaletteDropdown collections={collections} collectionIndex={collectionIndex}></ColorPaletteDropdown>}
    {
      colorCollection && (
        <div className="color-palette-area">
          <div className="color-palette-area__wrapper">
            <SwatchContainer 
             swatchSpace={swatchSpace}
             swatchSize={swatchSize}
             colorRows={colorCollection.NumRows}
      >
          {colorCollection.ColorRows.map((colorRow, index) => (
                    <SwatchBox
                      key={index}
                      swatchSize={swatchSize}
                      swatchSpace={swatchSpace}
                      colorRow={colorRow}
                      showColorName = {false}
                      onColorSwatchClick={e => {
                        handleColorSwatchClick(colorRow, e);
                      }}
                      active={colorRow === activeColor}
                      handleHover={elem => setHoveredBox({ elem, colorRow })}
                    />
                  ))}

      </SwatchContainer>
          </div>
        </div>
      )
      
    }
    </div>
  );
};

ColorSelectionBox.propTypes = {
  
};

export default ColorSelectionBox;