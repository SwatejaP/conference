const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        res.status(err.statusCode).json({
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack
        });
    } else {
        // Production style (less details)
        if (err.isOperational) {
            res.status(err.statusCode).json({
                status: err.status,
                error: err.message // Frontend expects "error" key currently
            });
        } else {
            console.error('ERROR 💥', err);
            res.status(500).json({
                status: 'error',
                error: 'Something went very wrong!'
            });
        }
    }
};

module.exports = errorHandler;
