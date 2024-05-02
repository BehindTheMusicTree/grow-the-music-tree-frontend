import PropTypes from 'prop-types';

export default function BadRequestErrorComponent ({ popupContentObject }) {
    return (
        <div>
            {popupContentObject.operationErrors.map((errorObject, index) => (
                <div key={index}>
                    <h3>{errorObject.name}</h3>
                    {errorObject.errors.map((error, index) => (
                        <div key={index}>{error}</div>
                    ))}
                </div>
            ))}
        </div>
    );
}

BadRequestErrorComponent.propTypes = {
    popupContentObject: PropTypes.shape({
        title: PropTypes.string.isRequired,
        operationErrors: PropTypes.arrayOf(PropTypes.shape({
            name: PropTypes.string.isRequired,
            errors: PropTypes.arrayOf(PropTypes.string).isRequired,
        })).isRequired,
    }).isRequired,
}