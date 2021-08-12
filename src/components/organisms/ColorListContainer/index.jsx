import { CaretDownOutlined } from "@ant-design/icons";
import { Menu, Popover } from "antd";
import MenuItem from "antd/lib/menu/MenuItem";
import classNames from "classnames";
import React, { PropTypes, useState } from "react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getColorList } from "../../../redux";
import AtButton from "../../atoms/AtButton";
import ColorSelectionBox from "../ColorSelectionBox";

const ColorlistContainer = (props) => {
  const loading = useSelector((state) => state.color.loading);
  const dispatch = useDispatch();
  const [showPopover, setShowPopover] = useState(false);

  useEffect(() => {
    dispatch(getColorList());
  }, []);

  const handleVisibleChange = (visible) => {
    setShowPopover(visible);
  };
  const onSelectColor = () => {  setShowPopover(true);};

  return (
    <>
      {!loading && (
        <Popover overlayClassName="color-selection-box-popover"
          content={<ColorSelectionBox></ColorSelectionBox>}
          trigger="click"
          visible={showPopover}
          onVisibleChange={(visible) => handleVisibleChange(visible)}
        >
          <AtButton
            text="Select Color"
            type="primary"
            className="at-room-studio-page at-btn-selectcolor"
            onClick={onSelectColor}
          ></AtButton>
        </Popover>
      )}
    </>
  );
};

ColorlistContainer.propTypes = {};

export default ColorlistContainer;
