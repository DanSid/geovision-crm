// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
    console.error(err.stack);

    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map((e) => e.message);
        return res.status(400).json({ error: 'Validation error', details: messages });
    }

    if (err.name === 'CastError') {
        return res.status(400).json({ error: 'Invalid ID format' });
    }

    if (err.code === 11000) {
        return res.status(409).json({ error: 'Duplicate entry', field: Object.keys(err.keyPattern)[0] });
    }

    res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
};

module.exports = errorHandler;
