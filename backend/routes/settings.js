const { Router } = require('express');
const Setting = require('../models/Setting');

const router = Router();

// GET /api/settings/:key   (e.g. pipeline, permissions)
router.get('/:key', async (req, res, next) => {
    try {
        const setting = await Setting.findOne({ key: req.params.key });
        if (!setting) return res.json(null);
        res.json(setting.value);
    } catch (err) { next(err); }
});

// PUT /api/settings/:key   — upsert the value
router.put('/:key', async (req, res, next) => {
    try {
        const setting = await Setting.findOneAndUpdate(
            { key: req.params.key },
            { value: req.body },
            { new: true, upsert: true, runValidators: false }
        );
        res.json(setting.value);
    } catch (err) { next(err); }
});

module.exports = router;
