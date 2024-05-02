import PropTypes from 'prop-types';

export default function BadRequestErrorComponent ({ badRequestPopupObject }) {
    return (
        <div>
            <h1>{badRequestPopupObject.operation}</h1>
            <p>{badRequestPopupObject.message}</p>
        </div>
    );
}

BadRequestErrorComponent.propTypes = {
    badRequestPopupObject: PropTypes.shape({
        operation: PropTypes.string.isRequired,
        message: PropTypes.string.isRequired,
    }).isRequired,
}