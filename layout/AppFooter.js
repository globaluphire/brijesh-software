import React, { useContext } from 'react';
import { LayoutContext } from './context/layoutcontext';

const AppFooter = () => {
    const { layoutConfig } = useContext(LayoutContext);

    return (
        <div className="layout-footer">
            © 2024
            <span className="font-medium ml-2">Raftaar Logistics.</span>
            &nbsp;All Rights Reserved.
        </div>
    );
};

export default AppFooter;
