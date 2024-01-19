import '../../styles/Banner.css'
import logo from '../../assets/ouai.jpg'
import React from 'react'
import Header from './Header'
import Description from './Description'
import SearchForm from './Search'

function Banner() {
    return (
    <div className='banner'>
        <img src={logo} className='banner-logo' alt='logo' />
        <Header />
        <Description />
        <SearchForm />
    </div>)
}

export default Banner