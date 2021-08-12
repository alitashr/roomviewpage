import { CaretDownOutlined } from '@ant-design/icons';
import { Menu, Popover } from 'antd';
import MenuItem from 'antd/lib/menu/MenuItem';
import React, { PropTypes } from 'react';

const ColorPaletteDropdown = props => {
  const { collections, collectionIndex}= props;
  const handleMenuItemClick = (index) => {};
  const renderCollectionDropdown = () => {
    return (
      collections && (
        <Menu>
          {collections.map((collection, index) => {
            return (
              <MenuItem key={index} onClick={() => handleMenuItemClick(index)}>
                {collection.Name}
              </MenuItem>
            );
          })}
        </Menu>
      )
    );
  };

  return (
    <div className="color-palette-dropdown">
    <div className="at-color-palette-options">
      <Popover className="at-sorting-options" placement="bottomLeft" content={renderCollectionDropdown()}>
        <span className="at-color-palette-options__selected">
          {collections[collectionIndex].Name}
          {collections.length && <CaretDownOutlined className="at-color-palette-options__caret" />}
        </span>
      </Popover>
    </div>
  </div>
  );
};

ColorPaletteDropdown.propTypes = {
  
};

export default ColorPaletteDropdown;