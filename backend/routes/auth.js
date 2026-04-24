const { Router } = require('express');
const bcrypt = require('bcryptjs');
const User   = require('../models/User');

const router = Router();

/* ══════════════════════════════════════════════════════════════════════════
   Seed the default admin account once on startup (called from server.js).
   Idempotent — safe to call multiple times.
══════════════════════════════════════════════════════════════════════════ */
const DEFAULT_USERS = [
    {
        name: 'Admin',
        username: 'admin',
        email: 'admin@geovision.com',
        password: 'admin123',
        role: 'admin',
    },
    {
        name: 'Boatemaa',
        username: 'boatemaa',
        email: 'boatemaa@geovisionservices.com',
        password: 'Maame1234',
        role: 'user',
    },
    {
        name: 'Ellis',
        username: 'ellis',
        email: 'ellis@geovisionservices.com',
        password: 'Ellis1234',
        role: 'user',
    },
    {
        name: 'Nina',
        username: 'nina',
        email: 'nina@geovisionservices.com',
        password: 'Nina1234',
        role: 'user',
    },
];

const seedUsers = async () => {
    try {
        for (const seed of DEFAULT_USERS) {
            const exists = await User.findOne({
                $or: [{ email: seed.email }, { username: seed.username }],
            });
            if (!exists) {
                await User.create(seed);
                console.log(`✅  Seeded user ${seed.email}`);
            }
        }
    } catch (err) {
        console.error('⚠️  User seed error:', err.message);
    }
};

/* ── POST /api/auth/register ─────────────────────────────────────────────── */
router.post('/register', async (req, res) => {
    try {
        const { name, username, email, password, role } = req.body;

        if (!name || !username || !email || !password) {
            return res.status(400).json({ message: 'name, username, email and password are required.' });
        }
        if (String(password).length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters.' });
        }

        const emailNorm    = String(email).toLowerCase().trim();
        const usernameNorm = String(username).toLowerCase().trim();

        const exists = await User.findOne({
            $or: [{ email: emailNorm }, { username: usernameNorm }],
        });
        if (exists) {
            return res.status(409).json({ message: 'Email or username already exists.' });
        }

        const user = await User.create({
            name: String(name).trim(),
            username: usernameNorm,
            email: emailNorm,
            password,                // pre-save hook hashes this
            role: role || 'user',
        });

        res.status(201).json(user.toSafeObject());
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/* ── POST /api/auth/login ────────────────────────────────────────────────── */
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const value = String(email || '').toLowerCase().trim();

        const user = await User.findOne({
            $or: [{ email: value }, { username: value }],
        });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email/username or password.' });
        }

        const match = await user.comparePassword(String(password || ''));
        if (!match) {
            return res.status(401).json({ message: 'Invalid email/username or password.' });
        }

        res.json(user.toSafeObject());
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/* ── GET /api/auth/users — list all users (no passwords) ─────────────────── */
router.get('/users', async (req, res) => {
    try {
        const users = await User.find({}, '-password');
        res.json(users.map(u => u.toObject()));
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/* ── PUT /api/auth/users/:id — update name / email / photo / role ─────────── */
router.put('/users/:id', async (req, res) => {
    try {
        const { password, ...updates } = req.body;
        if (password) {
            if (String(password).length < 6) {
                return res.status(400).json({ message: 'Password must be at least 6 characters.' });
            }
            updates.password = await bcrypt.hash(password, 10);
        }
        const user = await User.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true, runValidators: true, select: '-password' }
        );
        if (!user) return res.status(404).json({ message: 'User not found.' });
        res.json(user.toObject());
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = { router, seedUsers };
