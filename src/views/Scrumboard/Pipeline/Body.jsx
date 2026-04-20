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

// Default PRD-aligned pipeline stages (empty — populated by real data)
const DEFAULT_DATASET = {
    tasks: {},
    cards: {
        'card-lead':        { id: 'card-lead',        title: 'LEAD IN',     taskIds: [] },
        'card-opportunity': { id: 'card-opportunity', title: 'OPPORTUNITY',  taskIds: [] },
        'card-proposed':    { id: 'card-proposed',    title: 'PROPOSED',     taskIds: [] },
        'card-followup':    { id: 'card-followup',    title: 'FOLLOW UP',    taskIds: [] },
        'card-conversion':  { id: 'card-conversion',  title: 'CONVERSION',   taskIds: [] },
    },
    cardOrder: ['card-lead', 'card-opportunity', 'card-proposed', 'card-followup', 'card-conversion'],
};

// Map opportunity stage → pipeline column
const STAGE_CARD_MAP = {
    'Prospecting':   'card-lead',
    'Qualification': 'card-opportunity',
    'Proposal':      'card-proposed',
    'Negotiation':   'card-followup',
    'Closed Won':    'card-conversion',
    'Closed Lost':   'card-conversion',
};

const buildDatasetFromOpportunities = (opportunities, existingDataset) => {
    // Start from stored dataset or default
    const base = existingDataset || DEFAULT_DATASET;

    // Build a fresh dataset that includes all opportunities as tasks
    const tasks = { ...base.tasks };
    const cards = {};

    // Reset all columns (keep custom columns added by user, reset taskIds for default ones)
    base.cardOrder.forEach(cardId => {
        cards[cardId] = { ...base.cards[cardId], taskIds: [] };
    });

    // Insert all opportunities into their matching pipeline column
    opportunities.forEach(opp => {
        const taskId = `opp-${opp.id}`;
        const targetCardId = STAGE_CARD_MAP[opp.stage] || 'card-lead';

        // Add/update the task
        tasks[taskId] = {
            id: taskId,
            oppId: opp.id,
            brandName: opp.name,
            price: opp.value ? `$${parseFloat(opp.value).toLocaleString()}` : '',
            type: opp.company || '',
            contactName: opp.contactName || '',
            stage: opp.stage,
            lastUsed: opp.closeDate || '',
            growth: opp.stage === 'Closed Won' ? 'high' : opp.stage === 'Closed Lost' ? 'low' : 'normal',
            status: opp.stage === 'Closed Won' ? 'won' : opp.stage === 'Closed Lost' ? 'lost' : undefined,
            notes: opp.notes || '',
            initLogo: opp.name?.charAt(0)?.toUpperCase() || '?',
            logoBg: 'avatar-primary',
        };

        // Add to the target card if not already there
        if (cards[targetCardId] && !cards[targetCardId].taskIds.includes(taskId)) {
            cards[targetCardId].taskIds.push(taskId);
        }
    });

    // Keep any tasks NOT from opportunities (user-manually-added pipeline tasks)
    Object.keys(base.tasks).forEach(tid => {
        if (!tid.startsWith('opp-')) {
            tasks[tid] = base.tasks[tid];
            // Restore their position in cards
            base.cardOrder.forEach(cardId => {
                if (base.cards[cardId]?.taskIds.includes(tid)) {
                    if (cards[cardId] && !cards[cardId].taskIds.includes(tid)) {
                        cards[cardId].taskIds.push(tid);
                    }
                }
            });
        }
    });

    return { tasks, cards, cardOrder: base.cardOrder };
};

const PipelineBody = ({ pipelineState, opportunities, setPipeline }) => {
    const [dataset, setDataset] = useState(() => {
        // Build from stored pipeline + live opportunities
        return buildDatasetFromOpportunities(opportunities, pipelineState);
    });

    const [tasks, setTasks] = useState(dataset.tasks);
    const [cards, setCards] = useState(dataset.cards);
    const [cardOrder, setCardOrder] = useState(dataset.cardOrder);
    const [addNewBoard, setAddNewBoard] = useState(false);
    const [newBoardName, setNewBoardName] = useState('');

    // Re-sync when opportunities change (new ones added)
    useEffect(() => {
        const newDataset = buildDatasetFromOpportunities(opportunities, { tasks, cards, cardOrder });
        setTasks(newDataset.tasks);
        setCards(newDataset.cards);
        setCardOrder(newDataset.cardOrder);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [opportunities]);

    // Persist to Redux/localStorage on every change
    useEffect(() => {
        const snapshot = { tasks, cards, cardOrder };
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
                                            placeholder="e.g. Negotiation"
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
