const { Router } = require('express');

/**
 * Creates standard CRUD routes for a Mongoose model.
 * GET    /          → list all (sorted newest first)
 * GET    /:id       → get one
 * POST   /          → create
 * PUT    /:id       → update (partial)
 * DELETE /:id       → delete
 */
const crudRouter = (Model) => {
    const router = Router();

    // LIST
    router.get('/', async (req, res, next) => {
        try {
            const docs = await Model.find().sort({ createdAt: -1 });
            res.json(docs);
        } catch (err) { next(err); }
    });

    // GET ONE
    router.get('/:id', async (req, res, next) => {
        try {
            const doc = await Model.findById(req.params.id);
            if (!doc) return res.status(404).json({ error: 'Not found' });
            res.json(doc);
        } catch (err) { next(err); }
    });

    // CREATE
    router.post('/', async (req, res, next) => {
        try {
            const doc = await Model.create(req.body);
            res.status(201).json(doc);
        } catch (err) { next(err); }
    });

    // UPDATE
    router.put('/:id', async (req, res, next) => {
        try {
            const doc = await Model.findByIdAndUpdate(
                req.params.id,
                req.body,
                { new: true, runValidators: true }
            );
            if (!doc) return res.status(404).json({ error: 'Not found' });
            res.json(doc);
        } catch (err) { next(err); }
    });

    // DELETE
    router.delete('/:id', async (req, res, next) => {
        try {
            const doc = await Model.findByIdAndDelete(req.params.id);
            if (!doc) return res.status(404).json({ error: 'Not found' });
            res.json({ success: true, id: req.params.id });
        } catch (err) { next(err); }
    });

    return router;
};

module.exports = crudRouter;
