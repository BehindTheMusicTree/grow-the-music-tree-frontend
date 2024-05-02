import PropTypes from 'prop-types';

export default function BadRequestErrorComponent ({ popupContentObject }) {
    return (
        <div>
            <h1>{popupContentObject.title}</h1>
            <p>{popupContentObject.message}</p>
        </div>
    );
}

BadRequestErrorComponent.propTypes = {
    popupContentObject: PropTypes.shape({
        title: PropTypes.string.isRequired,
        message: PropTypes.string.isRequired,
    }).isRequired,
}