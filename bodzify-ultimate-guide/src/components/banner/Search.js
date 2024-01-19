import React from 'react'
import { useState } from 'react'

function SearchForm() {

    const [formData, setFormData] = useState({
        search: 'search',
    })

    const handleChange = (e) => {
        const { name, value } = e.target

        setFormData({
            ...formData,
            [name]: value,
        });
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        if (formData.search === '') {
            alert('Please enter a search term')
            return
        }
        alert(formData.search)
    }

    const handleFocus = (e) => {
      const { name } = e.target;
      setFormData({
        ...formData,
        [name]: '',
      });
    };

    return (
        <form onSubmit={handleSubmit}>
          <label>
            Search:
            <input
              type="text"
              name="search"
              value={formData.search}
              onChange={handleChange}
              onFocus={handleFocus}
            />
            </label>
        </form>        
    )
}

export default SearchForm