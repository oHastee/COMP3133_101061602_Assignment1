const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

const authenticate = (req) => {
    const token = req.headers.authorization || '';
    if (token) {
        try {
            // Remove 'Bearer ' if present
            const decoded = jwt.verify(token.replace('Bearer ', ''), JWT_SECRET);
            return decoded;
        } catch (err) {
            console.error('Invalid token:', err);
            return null;
        }
    }
    return null;
};

module.exports = authenticate;
