function router(app) {
    app.use('/', (req, res) => {
        res.json({ msg: 'API of project Shaneck' });
    });
}

module.exports = router;
