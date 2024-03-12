import React from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import './Button.scss'

const Button = (props) => {
  const { children, className, ...otherProps } = props

  return (
    <button className={classnames('button', className)} {...otherProps}>
      {children}
    </button>
  )
}

Button.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string
}

export default Button