function generateErrorJsonResponse(message) {
    return {
        'success': false,
        'message': message
    }
};

module.exports = {generateErrorJsonResponse}