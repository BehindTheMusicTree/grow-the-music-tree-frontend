import '../../styles/Banner.css'
import logo from '../../assets/ouai.jpg'
import React from 'react'
import Header from './Header'
import Description from './Description'
import Search from './Search'

function Banner() {
    return (
    <div className='banner'>
        <img src={logo} className='banner-logo' alt='logo' />
        <Header />
        <Description />
        <Search />
    </div>)
}

export default Banner