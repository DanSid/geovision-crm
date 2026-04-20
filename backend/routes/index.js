const { Router } = require('express');
const crudRouter = require('./crudRouter');
const settingsRouter = require('./settings');

const Contact         = require('../models/Contact');
const Opportunity     = require('../models/Opportunity');
const Customer        = require('../models/Customer');
const Company         = require('../models/Company');
const Group           = require('../models/Group');
const Activity        = require('../models/Activity');
const Note            = require('../models/Note');
const History         = require('../models/History');
const Document        = require('../models/Document');
const SecondaryContact= require('../models/SecondaryContact');
const Invoice         = require('../models/Invoice');
const Task            = require('../models/Task');
const Board           = require('../models/Board');
const Equipment       = require('../models/Equipment');
const StockLocation   = require('../models/StockLocation');
const CrewMember      = require('../models/CrewMember');
const Vehicle         = require('../models/Vehicle');
const Maintenance     = require('../models/Maintenance');
const Request         = require('../models/Request');

const router = Router();

// ── Standard CRUD endpoints ───────────────────────────────────────────────────
router.use('/contacts',          crudRouter(Contact));
router.use('/opportunities',     crudRouter(Opportunity));
router.use('/customers',         crudRouter(Customer));
router.use('/companies',         crudRouter(Company));
router.use('/groups',            crudRouter(Group));
router.use('/activities',        crudRouter(Activity));
router.use('/notes',             crudRouter(Note));
router.use('/history',           crudRouter(History));
router.use('/documents',         crudRouter(Document));
router.use('/secondary-contacts',crudRouter(SecondaryContact));
router.use('/invoices',          crudRouter(Invoice));
router.use('/tasks',             crudRouter(Task));
router.use('/boards',            crudRouter(Board));
router.use('/equipment',         crudRouter(Equipment));
router.use('/stock-locations',   crudRouter(StockLocation));
router.use('/crew-members',      crudRouter(CrewMember));
router.use('/vehicles',          crudRouter(Vehicle));
router.use('/maintenance',       crudRouter(Maintenance));
router.use('/requests',          crudRouter(Request));

// ── Settings (pipeline + permissions — single document per key) ───────────────
router.use('/settings',          settingsRouter);

module.exports = router;
