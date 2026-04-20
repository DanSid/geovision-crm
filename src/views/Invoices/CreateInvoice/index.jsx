import React, { useState } from 'react';
import classNames from 'classnames';
import { useLocation } from 'react-router-dom';
import InvoiceAppSidebar from '../InvoiceAppSidebar';
import Body from './Body';
import Header from './Header';
import SettingPannel from './SettingPannel';

const CreateInvoice = () => {
    const [showSidebar, setShowSidebar] = useState(true);
    const [openSettingPannel, setOpenSettingPannel] = useState(false);

    const location = useLocation();
    const query = new URLSearchParams(location.search);
    const templateParam = query.get('template') || 'standard';
    const editId = query.get('id') || null;

    // Derive a human-readable label from the template id
    const templateLabel = templateParam
        .split('-')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');

    return (
        <div className="hk-pg-body py-0">
            <div className={classNames(
                "invoiceapp-wrap",
                { "invoiceapp-sidebar-toggle": !showSidebar },
                { "invoiceapp-setting-active": openSettingPannel }
            )}>
                <InvoiceAppSidebar />
                <div className="invoiceapp-content">
                    <div className="invoiceapp-detail-wrap">
                        <Header
                            toggleSidebar={() => setShowSidebar(!showSidebar)}
                            show={showSidebar}
                            handleSettings={() => setOpenSettingPannel(!openSettingPannel)}
                            selectedTemplate={templateParam}
                            templateLabel={templateLabel}
                        />
                        <Body
                            key={editId || 'new'}
                            selectedTemplate={templateParam}
                            editId={editId}
                        />
                        <SettingPannel onHide={() => setOpenSettingPannel(false)} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateInvoice;
