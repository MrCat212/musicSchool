import { Flex } from "antd";
import React, { useContext, useEffect } from "react";
import Text from 'antd/es/typography/Text';

import styles from './home.module.css';
import { UserContext } from './../../App';
import { useNavigate } from "react-router-dom";
import { Trans, useTranslation } from "react-i18next";

const Home = () => {

    const {userContext} = useContext(UserContext);

    const navigate = useNavigate();
    const {t} = useTranslation();

    useEffect(() => {
        if(userContext?.login){
            if(!userContext?.role){
                navigate('/user-page');
            }else{
                navigate('/teacher-page');
            }
        }
    }, [userContext, navigate])
    return(
        <Flex className={styles.home}>
            <h1 className={styles.title}>{t('info')}</h1>
            <Text>{t('infoDescription')}</Text>
            <h1 className={styles.subTitle}>{t('onlineLessons')}</h1>
            <Text>
                <Trans
                    i18nKey='infoList'
                    components={{
                        item: <li className={styles.listElement}/>
                    }}
                />
            </Text>
        </Flex>
    )
}

export default Home;