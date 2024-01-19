import React from 'react';
import GenreListItem from './GenreListItem';

const genreList = [
    ['Rock', 9],
    ['Pop', 8],
    ['Metal', 6],
    ['Country', 10000],
    ['Hip-Hop', 3],
    ['Rap', 4],
    ['Jazz', 7],
    ['R&B', 2],
    ['Electronic', 1],
    ['Folk', 0],
    ['Classical', 5],
    ['Blues', 11],
    ['Punk', 12],
    ['Reggae', 13],
    ['Soul', 14],
    ['Latin', 15],
    ['Funk', 16],
    ['Disco', 17],
    ['Techno', 18],
    ['Dance', 19],
    ['House', 20],
    ['Indie', 2],
    ['Alternative', 22],
    ['Gospel', 23],
    ['Experimental', 24],
    ['World', 25],
    ['Instrumental', 26],
    ['New Age', 27],
    ['Soundtrack', 28],
    ['Ambient', 29],
    ['Acoustic', 30],
    ['Comedy', 31],
    ['Spoken Word', 32],
    ['Cinematic', 33],
    ['Audio Drama', 34],
    ['Children\'s Music', 35],
    ['Audiobooks', 36],
    ['Holiday', 37],
    ['Ska', 38],
    ['Bluegrass', 39],
    ['Easy Listening', 40],
    ['Musical Theater', 41],
    ['Opera', 42],
    ['Podcasts', 43],
    ['Talk Show', 44],
    ['Trance', 45],
    ['Trap', 46],
    ['Drum & Bass', 47],
    ['Dubstep', 48],
    ['Hardcore', 49],
    ['Hardstyle', 50],
    ['Industrial', 51],
    ['Jungle', 52],
    ['Lo-Fi', 53],
    ['Noise', 54],
    ['Techno', 55],
    ['Trance', 56],
    ['Breakbeat', 57],
    ['Chillout', 58],
    ['Downtempo', 59],
    ['Dub', 60],
    ['Electro', 61],
    ['Electronica', 62],
    ['Funk', 63],
    ['Garage', 64],
    ['House', 65],
    ['IDM', 66],
    ['Trip-Hop', 67],
    ['Drum & Bass', 68],
    ['Bass', 69],
    ['Grime', 70],
    ['Dubstep', 71],
    ['Reggae', 72],
    ['Dancehall', 73],
    ['Ska', 74],
    ['Rocksteady', 75]
]

function GenreList() {
    return (
        <div>
            <h2>Genre</h2>
            <ul>
                {genreList.map((genre, index) => (
                        <GenreListItem key={index} genreLabel={genre[0]} genreRating={genre[1]} />
                ))}
            </ul>
        </div>
    )
}

export default GenreList