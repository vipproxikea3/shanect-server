const usersRouter = require('./users');
const categoriesRouter = require('./categories');
const emailRouter = require('./email');
const subCategoriesRouter = require('./subCategories');

function router(app) {
    app.use('/api/users', usersRouter);
    app.use('/api/email', emailRouter);
    app.use('/api/categories', categoriesRouter);
    app.use('/api/sub-categories', subCategoriesRouter);

    app.use('/', (req, res) => {
        res.json({ msg: 'API of project Shanect' });
    });
}

module.exports = router;
