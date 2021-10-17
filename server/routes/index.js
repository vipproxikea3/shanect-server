const usersRouter = require('./users');
const emailRouter = require('./email');

function router(app) {
    app.use('/api/users', usersRouter);
    app.use('/api/email', emailRouter);

    app.use('/', (req, res) => {
        res.json({ msg: 'API of project Shaneck' });
    });
}

module.exports = router;
