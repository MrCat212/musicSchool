import { Flex, Tabs } from "antd";
import { useContext, useEffect } from "react";
import { AllUserContext, UserContext } from "../../App";

import styles from './TeacherPage.module.css';
import { useNavigate } from "react-router-dom";
import { UsersRepertoire } from "./usersRepertoire/UsersRepertoire";
import { UsersList } from "../../components/UsersList/UsersList";
import { useTranslation } from "react-i18next";

export const TeacherPage = () => {

    const {allUsers, setRefetchValue} = useContext(AllUserContext);
    const {userContext} = useContext(UserContext); 
    const navigate = useNavigate();
    const {t} = useTranslation()

    useEffect(() => {
        if(!userContext?.role){
            navigate('/')
        }
    }, [allUsers, userContext])

    const tabsItems = [
        {
            key: 'part-1',
            label: t('students'),
            children: <UsersList allUsers={allUsers} setRefetchValue={setRefetchValue}/>
        },
        {
            key: 'part-2',        
            label: t('repertoire'),
            children: <UsersRepertoire allUsers={allUsers}/>
        },
    ]
    
    return(
        <Flex vertical className={styles.container}>
            <Tabs
                direction="horizontal"
                className={styles.anchor}
                items={tabsItems}
            />
        </Flex>
    );
};