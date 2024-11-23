import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';  // Import Outlet để hiển thị route con
import SideMenu from './SideMenu';  
import './MainLayout.css'; 
import Header from './Header';
import { WidthFull } from '@mui/icons-material';

const MainLayout = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [headerTitle, setHeaderTitle] = useState('Trang chủ');

    const toggleCollapse = () => {
        setIsCollapsed(!isCollapsed);
    };

    const updateHeaderTitle = (title) => {
        setHeaderTitle(title);
    };

    return (
        <div className="main-layout">
            <div className={`sidemenu  ${isCollapsed ? 'collapsed' : ''}`}>
                <SideMenu 
                    isCollapsed={isCollapsed} 
                    toggleCollapse={toggleCollapse} 
                    updateHeaderTitle={updateHeaderTitle} 
                />  
            </div>
            
            <div className="layout-body">
                <div className={`content-container ${isCollapsed ? 'collapsed' : ''}`}>
                    <div className='header '>
                        <Header title={headerTitle} style={{ WidthFull }}/>
                    </div>
                    <div className="main-content">
                        {/* Outlet sẽ hiển thị nội dung của route con */}
                        <Outlet />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MainLayout;
