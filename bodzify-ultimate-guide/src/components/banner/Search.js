import React from 'react'

function Search() {
    const searchPlaceholder = "Search"
    return (
        <form className="search">
            <input type="text" placeholder={searchPlaceholder} />
            <button type="submit">Search</button>  
        </form>
    )
}

export default Search