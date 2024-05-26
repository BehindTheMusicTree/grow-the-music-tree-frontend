import PropTypes from "prop-types";

import { AiFillStar, AiOutlineStar } from "react-icons/ai";
import { FORM_RATING_NULL_VALUE } from "../../utils/constants";

export default function Rating({ rating, handleChange }) {
  return (
    <div className="flex items-center">
      {[...Array(6)].map((_, i) => (
        <div key={i} className={`relative ${i === 0 ? "mr-4" : "mr-1"}`}>
          <input
            id={`star-${i}`}
            className="w-6 h-6 opacity-0"
            type="radio"
            name="rating"
            value={i === 0 ? FORM_RATING_NULL_VALUE : i + 5}
            checked={rating === (i === 0 ? null : i + 5)}
            onChange={handleChange}
          />
          <label htmlFor={`star-${i}`} className="cursor-pointer">
            {i === 0 ? (
              <div className="flex">
                <AiOutlineStar
                  className={`w-7 h-7 absolute top-0 left-0 ${
                    rating === FORM_RATING_NULL_VALUE ? "text-yellow-500" : "text-gray-500"
                  }`}
                />
                <span className="flex-grow w-8"></span>{" "}
              </div>
            ) : (
              <AiFillStar
                className={`w-7 h-7 absolute top-0 left-0 ${rating >= i + 5 ? "text-yellow-500" : "text-gray-500"}`}
              />
            )}
          </label>
        </div>
      ))}
    </div>
  );
}

Rating.propTypes = {
  rating: PropTypes.number,
  handleChange: PropTypes.func.isRequired,
};
