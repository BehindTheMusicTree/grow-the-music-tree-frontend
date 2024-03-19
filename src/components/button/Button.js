import React from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import './Button.module.scss'

const Button = ({ children, className, ...otherProps }) => {

  console.log('Rerender')

  return (
    <button className={classnames('button', className)} {...otherProps} >
      {children}
    </button>
  )
}

Button.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
}

export default Button