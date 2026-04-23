const { Router } = require('express');

/**
 * Creates standard CRUD routes for a Mongoose model.
 *
 * GET    /      → list all (newest first)
 * GET    /:id   → get one
 * POST   /      → create
 * PUT    /:id   → partial update ($set — strips _id/__v, strict:false so
 *                 extra fields aren't silently dropped by Mongoose)
 * DELETE /:id   → delete
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

    // UPDATE (partial — $set semantics)
    router.put('/:id', async (req, res, next) => {
        try {
            // Remove Mongoose-internal fields the client may echo back
            // eslint-disable-next-line no-unused-vars
            const { _id, __v, id: _clientId, ...body } = req.body;

            const doc = await Model.findByIdAndUpdate(
                req.params.id,
                { $set: body },
                {
                    new:           true,   // return updated doc
                    runValidators: false,  // skip validators on partial update
                    strict:        false,  // allow fields not in schema (future-proofing)
                }
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
