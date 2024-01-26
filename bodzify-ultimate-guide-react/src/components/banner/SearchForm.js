import React from 'react'
import { useState, useEffect } from 'react'
import PropTypes from 'prop-types';

function SearchForm({setSearchSubmitted}) {

    const [searchNumber, setSearchNumber] = useState(0)
    const [isFirstFocus, setIsFirstFocus] = useState(true)
    const [searchUnsubmitted, setSearchUnsubmitted] = useState('search')

    useEffect(() => {
        document.title = `${searchNumber} searches`
    });

    const handleSubmit = (e) => {
        e.preventDefault()
        const value = e.target.value
        if (value === '') {
            alert('Please enter a search term')
            return
        }
        else {
            setSearchNumber(searchNumber + 1)
            setSearchSubmitted(searchUnsubmitted)
        }
    }

    const handleFocus = () => {
        if (isFirstFocus) {
            setSearchUnsubmitted('')
            setIsFirstFocus(false)
        }
    }

    const handleChange = (e) => {
        setSearchUnsubmitted(e.target.value)
    }

    return (
        <form onSubmit={handleSubmit}>
            <label>
                Search no {searchNumber}:
            </label>
            <input
                type="text"
                name="search"
                onChange={handleChange}
                value={searchUnsubmitted}
                onFocus={handleFocus}
            />
        </form>   
    )
}

SearchForm.propTypes = {
    setSearchSubmitted: PropTypes.func.isRequired
}

export default SearchForm