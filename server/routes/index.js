const usersRouter = require('./users');
const categoriesRouter = require('./categories');
const emailRouter = require('./email');
const subCategoriesRouter = require('./subCategories');
const postsRouter = require('./posts');
const areasRouter = require('./areas');

function router(app) {
    app.use('/api/users', usersRouter);
    app.use('/api/email', emailRouter);
    app.use('/api/categories', categoriesRouter);
    app.use('/api/sub-categories', subCategoriesRouter);
    app.use('/api/posts', postsRouter);
    app.use('/api/areas', areasRouter);

    app.use('/', (req, res) => {
        res.json({ msg: 'API of project Shanect' });
    });
}

module.exports = router;
