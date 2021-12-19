const usersRouter = require('./users');
const categoriesRouter = require('./categories');
const emailRouter = require('./email');
const subCategoriesRouter = require('./subCategories');
const postsRouter = require('./posts');
const areasRouter = require('./areas');
const messagesRouter = require('./messages');
const contactsRouter = require('./contacts');
const commentsRouter = require('./comments');
const advisesRouter = require('./advises');

function router(app) {
    app.use('/api/users', usersRouter);
    app.use('/api/email', emailRouter);
    app.use('/api/categories', categoriesRouter);
    app.use('/api/sub-categories', subCategoriesRouter);
    app.use('/api/posts', postsRouter);
    app.use('/api/areas', areasRouter);
    app.use('/api/messages', messagesRouter);
    app.use('/api/contacts', contactsRouter);
    app.use('/api/comments', commentsRouter);
    app.use('/api/advises', advisesRouter);

    app.use('/', (req, res) => {
        res.json({ msg: 'API of project Shanect' });
    });
}

module.exports = router;
