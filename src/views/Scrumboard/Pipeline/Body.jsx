import React, { useEffect, useState } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import 'react-perfect-scrollbar/dist/css/styles.css';
import { Button, Card, Col, Form, Modal, Row } from 'react-bootstrap';
import { Plus } from 'react-feather';
import { connect } from 'react-redux';
import { nanoid } from 'nanoid';
import DragDropCard from './DragDropCard';
import PipelineHeader from './PipelineHeader';
import { setPipeline } from '../../../redux/action/Crm';

// ── Version flag — bump this to force a pipeline layout reset for all users ──
const PIPELINE_VERSION = 2;

// ── Pipeline columns aligned with Opportunity STAGES ─────────────────────────
const DEFAULT_DATASET = {
    version: PIPELINE_VERSION,
    tasks: {},
    cards: {
        'card-prospecting':   { id: 'card-prospecting',   title: 'PROSPECTING',   taskIds: [] },
        'card-qualification': { id: 'card-qualification', title: 'QUALIFICATION', taskIds: [] },
        'card-proposal':      { id: 'card-proposal',      title: 'PROPOSAL',      taskIds: [] },
        'card-negotiation':   { id: 'card-negotiation',   title: 'NEGOTIATION',   taskIds: [] },
        'card-closed-won':    { id: 'card-closed-won',    title: 'CLOSED WON',    taskIds: [] },
        'card-closed-lost':   { id: 'card-closed-lost',   title: 'CLOSED LOST',   taskIds: [] },
    },
    cardOrder: [
        'card-prospecting', 'card-qualification', 'card-proposal',
        'card-negotiation', 'card-closed-won', 'card-closed-lost',
    ],
};

// ── Opportunity stage → pipeline column mapping ────────────────────────────────
const STAGE_CARD_MAP = {
    'Prospecting':   'card-prospecting',
    'Qualification': 'card-qualification',
    'Proposal':      'card-proposal',
    'Negotiation':   'card-negotiation',
    'Closed Won':    'card-closed-won',
    'Closed Lost':   'card-closed-lost',
};

const buildDatasetFromOpportunities = (opportunities, existingDataset) => {
    // If stored dataset is old format (no version or wrong version), reset to default
    const base = (existingDataset && existingDataset.version === PIPELINE_VERSION)
        ? existingDataset
        : DEFAULT_DATASET;

    // Build a fresh dataset that includes all opportunities as tasks
    const tasks = { ...base.tasks };
    const cards = {};

    // Reset all column taskIds (keep columns, clear task assignments)
    base.cardOrder.forEach(cardId => {
        cards[cardId] = { ...base.cards[cardId], taskIds: [] };
    });

    // Insert each opportunity into its matching pipeline column
    opportunities.forEach(opp => {
        const taskId = `opp-${opp.id}`;
        const targetCardId = STAGE_CARD_MAP[opp.stage] || 'card-prospecting';

        tasks[taskId] = {
            id: taskId,
            oppId: opp.id,
            brandName: opp.name,
            price: opp.dealValue
                ? `${opp.dealCurrency === 'GHS' ? '₵' : '$'}${parseFloat(opp.dealValue).toLocaleString()}`
                : opp.value ? `$${parseFloat(opp.value).toLocaleString()}` : '',
            type: opp.company || '',
            contactName: opp.contactName || '',
            stage: opp.stage,
            lastUsed: opp.expectedCloseDate || opp.closeDate || '',
            growth: opp.stage === 'Closed Won' ? 'high' : opp.stage === 'Closed Lost' ? 'low' : 'normal',
            status: opp.stage === 'Closed Won' ? 'won' : opp.stage === 'Closed Lost' ? 'lost' : undefined,
            notes: opp.notes || '',
            initLogo: opp.name?.charAt(0)?.toUpperCase() || '?',
            logoBg: 'avatar-primary',
        };

        if (cards[targetCardId] && !cards[targetCardId].taskIds.includes(taskId)) {
            cards[targetCardId].taskIds.push(taskId);
        }
    });

    // Keep any manually-added pipeline tasks (not from opportunities)
    Object.keys(base.tasks).forEach(tid => {
        if (!tid.startsWith('opp-')) {
            tasks[tid] = base.tasks[tid];
            base.cardOrder.forEach(cardId => {
                if (base.cards[cardId]?.taskIds.includes(tid)) {
                    if (cards[cardId] && !cards[cardId].taskIds.includes(tid)) {
                        cards[cardId].taskIds.push(tid);
                    }
                }
            });
        }
    });

    return { version: PIPELINE_VERSION, tasks, cards, cardOrder: base.cardOrder };
};

const PipelineBody = ({ pipelineState, opportunities, setPipeline }) => {
    const [dataset] = useState(() =>
        buildDatasetFromOpportunities(opportunities, pipelineState)
    );

    const [tasks, setTasks] = useState(dataset.tasks);
    const [cards, setCards] = useState(dataset.cards);
    const [cardOrder, setCardOrder] = useState(dataset.cardOrder);
    const [addNewBoard, setAddNewBoard] = useState(false);
    const [newBoardName, setNewBoardName] = useState('');

    // Re-sync when opportunities change (stage updates, new additions)
    useEffect(() => {
        const newDataset = buildDatasetFromOpportunities(opportunities, { version: PIPELINE_VERSION, tasks, cards, cardOrder });
        setTasks(newDataset.tasks);
        setCards(newDataset.cards);
        setCardOrder(newDataset.cardOrder);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [opportunities]);

    // Persist to Redux/localStorage on every change
    useEffect(() => {
        const snapshot = { version: PIPELINE_VERSION, tasks, cards, cardOrder };
        setPipeline(snapshot);
    }, [tasks, cards, cardOrder, setPipeline]);

    const onAddNewCard = () => {
        if (!newBoardName.trim()) return;
        const newCard = {
            id: 'card-' + nanoid(),
            title: newBoardName.toUpperCase(),
            taskIds: [],
        };
        setCards(prev => ({ ...prev, [newCard.id]: newCard }));
        setCardOrder(prev => [...prev, newCard.id]);
        setNewBoardName('');
        setAddNewBoard(false);
    };

    return (
        <>
            <PipelineHeader
                addNewDeal={() => setAddNewBoard(!addNewBoard)}
                tasks={tasks}
                cards={cards}
                cardOrder={cardOrder}
            />
            <div className="taskboard-body taskboard-body-alt">
                <div>
                    <PerfectScrollbar className="tasklist-scroll position-relative">
                        <div id="tasklist_wrap" className="tasklist-wrap">
                            <DragDropCard
                                cards={cards}
                                tasks={tasks}
                                cardOrder={cardOrder}
                                setCards={setCards}
                                setTasks={setTasks}
                                setCardOrder={setCardOrder}
                            />

                            <Card className="card-simple card-border spipeline-list create-new-list">
                                <Card.Header className="card-header-action">
                                    <Button
                                        variant="light"
                                        className="btn-block bg-transparent border-0 text-primary"
                                        onClick={() => setAddNewBoard(!addNewBoard)}
                                    >
                                        <span>
                                            <span className="icon">
                                                <span className="feather-icon"><Plus /></span>
                                            </span>
                                            <span className="btn-text">Add New Stage</span>
                                        </span>
                                    </Button>
                                </Card.Header>
                            </Card>
                        </div>
                    </PerfectScrollbar>
                </div>
            </div>

            <Modal show={addNewBoard} onHide={() => setAddNewBoard(false)} size="sm" centered>
                <div className="modal-content">
                    <Modal.Body>
                        <Button bsPrefix="btn-close" onClick={() => setAddNewBoard(false)}>
                            <span aria-hidden="true">×</span>
                        </Button>
                        <h5 className="mb-4">Add New Stage</h5>
                        <Form>
                            <Row className="gx-3">
                                <Col sm={12}>
                                    <Form.Group>
                                        <Form.Label>Stage Name</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="e.g. Due Diligence"
                                            value={newBoardName}
                                            onChange={e => setNewBoardName(e.target.value)}
                                            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); onAddNewCard(); } }}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                        </Form>
                    </Modal.Body>
                    <div className="modal-footer align-items-center">
                        <Button variant="secondary" onClick={() => setAddNewBoard(false)}>Cancel</Button>
                        <Button variant="primary" onClick={onAddNewCard}>Add Stage</Button>
                    </div>
                </div>
            </Modal>
        </>
    );
};

const mapStateToProps = ({ pipeline, opportunities }) => ({
    pipelineState: pipeline,
    opportunities,
});

export default connect(mapStateToProps, { setPipeline })(PipelineBody);
