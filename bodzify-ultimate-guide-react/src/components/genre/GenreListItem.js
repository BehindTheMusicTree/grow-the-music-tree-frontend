import React from 'react'
import PropTypes from 'prop-types'

function GenreListItem({genreLabel, genreRating}) {

    const handleGenreClick = (genreLabel) => {
        alert(genreLabel)
    }

    return (
        <li onClick={() => handleGenreClick(genreLabel)}>
            <span>{genreLabel} {genreRating}</span>
        </li>
    )
}

GenreListItem.propTypes = {
    genreLabel: PropTypes.string.isRequired,
    genreRating: PropTypes.number.isRequired
}

export default GenreListItem;