import React, { useState } from 'react';
import classNames from 'classnames';
import Sidebar from '../Sidebar';
import BoardHeader from './BoardHeader';
import TaskboardInfo from './TaskboardInfo';
import TaskDetails from './TaskDetails';
import EditTaskList from './EditTaskList';
import Board from './Board';

const KanbanBoard = () => {
    const [showSidebar, setShowSidebar] = useState(true);
    const [showInfo, setShowInfo] = useState(false);
    const [selectedMembers, setSelectedMembers] = useState([]);

    const onToggleMember = (name) => {
        setSelectedMembers(prev =>
            prev.includes(name) ? prev.filter(m => m !== name) : [...prev, name]
        );
    };

    const onClearFilter = () => setSelectedMembers([]);

    return (
        <div className="hk-pg-body py-0">
            <div className={classNames(
                'taskboardapp-wrap',
                { 'taskboardapp-sidebar-toggle': !showSidebar },
                { 'taskboardapp-info-active': showInfo }
            )}>
                <Sidebar />
                <div className="taskboardapp-content">
                    <div className="taskboardapp-detail-wrap">
                        <BoardHeader
                            showSidebar={showSidebar}
                            toggleSidebar={() => setShowSidebar(!showSidebar)}
                            showInfo={showInfo}
                            toggleInfo={() => setShowInfo(!showInfo)}
                            selectedMembers={selectedMembers}
                            onToggleMember={onToggleMember}
                            onClearFilter={onClearFilter}
                        />
                        <Board memberFilter={selectedMembers} />
                        <TaskboardInfo onHide={() => setShowInfo(false)} />
                    </div>
                    <TaskDetails />
                    <EditTaskList />
                </div>
            </div>
        </div>
    );
};

export default KanbanBoard;
