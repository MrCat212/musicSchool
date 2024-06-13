import React, { useContext, useEffect } from "react";
import { UserContext } from "../../App";
import { Flex, Tabs } from "antd";

import styles from './userPage.module.css';
import { UserStats } from './../../components/UserStats/UserStats';
import Calendar from "../../components/Calendar/Calendar";
import { useNavigate } from "react-router-dom";
import Repertoire from "../../components/Repertoire/Repertoire";
import { useTranslation } from "react-i18next";


export const UserPage = () => {
    
    const {userContext} = useContext(UserContext);
    const navigate = useNavigate();
    const {t} = useTranslation();
    
    const tabsItems = [
        {
            key: 'part-1',
            label: t('tracker'),
            children: <Calendar />
        },
        {
            key: 'part-2',        
            label: t('stats'),
            children: <UserStats />
        },
        {
            key: 'part-3',
            label: t('repertoire'),
            children: <Repertoire />
        },
    ]

    useEffect(() => {
        if(!userContext || userContext?.role){
            navigate('/')
        }
    }, [userContext, navigate])

    return(
        <Flex className={styles.container}>
            <Tabs
                direction="horizontal"
                className={styles.anchor}
                items={tabsItems}
                defaultActiveKey="part-3"
            >
            </Tabs>
        </Flex>
    )
}