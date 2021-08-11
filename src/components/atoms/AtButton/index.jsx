import { Button } from "antd";
import classNames from "classnames";
import React, { PropTypes } from "react";

const AtButton = (props) => {
  const { size, type = "primary", icon, disabled, loading, onClick, text = "", className } = props;

  return (
    <Button
      type={type}
      className={classNames(className)}
      icon={icon}
      loading={loading}
      onClick={onClick}
      size={size}
      disabled={disabled}
    >
      {text}
    </Button>
  );
};

AtButton.propTypes = {};

export default AtButton;
