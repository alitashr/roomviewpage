import { CloseOutlined } from "@ant-design/icons";
import { Popover } from "antd";
import classNames from "classnames";
import React, { PropTypes, useState } from "react";
import { useEffect } from "react";

const PopoverWrapper = (props) => {
  const { className, show, contentWrapperClassname='', hasTitleBar=true, title='Select Floor', hasCloseBtn=true, content, children, trigger="click" } = props;
  const [showPopover, setShowPopover] = useState(false);

  const handleVisibleChange = (visible) => {
    setShowPopover(visible);
  };
  useEffect(()=>{
    setShowPopover(show);
  }, [show])
  return (
    <Popover
      overlayClassName={className}
      content={    
      <div className={classNames("at-popup", contentWrapperClassname)}>
        {
          hasTitleBar && (
            <div className="ant-popover-title">
            {title} 
            { hasCloseBtn && (<CloseOutlined className="at-icon-close" onClick={() => handleVisibleChange(false)} />)}
          </div>
          )
        }
      {content} 
    </div>
}
      trigger={trigger}
      visible={showPopover}
      onVisibleChange={(visible) => handleVisibleChange(visible)}
    >
      {children}
    </Popover>
  );
};

PopoverWrapper.propTypes = {};

export default PopoverWrapper;
