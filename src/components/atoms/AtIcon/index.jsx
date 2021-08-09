import React from "react";
import PropTypes from "prop-types";
const AtIcon = props => {
  const { icon, size = 24, className = "", color = "", ...otherprops } = props;
  return (
    <span {...otherprops} className={`bp3-icon at-icon ${className}`} style={{ color: color }}>
      <svg className={`icon-${icon}`} width={`${size}px`} height={`${size}px`}>
        <use xlinkHref={`#icon-${icon}`} />
      </svg>
    </span>
  );
};
// export const CollapseIcon = props => {
//   const { isOpen } = props;
//   return (
//     <AtIcon
//       {...props}
//       className={`at-collapse-toggle ${isOpen ? "open" : ""}`}
//       icon="chevron-down"
//     />
//   );
// };
AtIcon.propTypes = {
  icon: PropTypes.string,
  size: PropTypes.number,
  className: PropTypes.string,
  color: PropTypes.string
};
export default AtIcon;
