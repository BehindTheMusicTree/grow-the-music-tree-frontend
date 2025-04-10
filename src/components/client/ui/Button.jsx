"use client";

import PropTypes from "prop-types";
import classnames from "classnames";

export default function Button({ children, className, ...otherProps }) {
  return (
    <button className={classnames("button", className)} {...otherProps}>
      {children}
    </button>
  );
}

Button.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};
