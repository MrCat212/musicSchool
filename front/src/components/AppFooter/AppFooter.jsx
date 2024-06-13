import React from "react";
import { ReactComponent as Logo } from '../../assets/logo.svg';

import styles from './appFooter.module.css';
import { Flex, Typography } from "antd"; // Импортируем Flex и Typography из библиотеки Ant Design
import { Footer } from "antd/es/layout/layout"; // Импортируем Footer из библиотеки Ant Design
import Title from "antd/es/typography/Title"; // Импортируем компонент Title из Typography Ant Design
import { PhoneOutlined } from "@ant-design/icons"; // Импортируем иконку телефона из библиотеки Ant Design
import { useTranslation } from "react-i18next"; // Импортируем хук для перевода из библиотеки react-i18next

const AppFooter = () => { // Создаем функциональный компонент AppFooter
    const {t} = useTranslation() // Используем хук useTranslation для перевода текста

    return(
        <Footer className={styles.footer}>
            <Flex className={styles.footerContent}>
                <Logo className={styles.logo}/>
                <Title level={5}>
                    {t('footerInfo1')}
                    <br />
                    <small className={styles.terms}>
                        {t('footerInfo2')}
                    </small>
                    <small className={styles.terms}>
                        {t('footerInfo3')}
                    </small>
                </Title>
                <Typography.Text className={styles.callUs}>
                    <PhoneOutlined style={{rotate: '90deg'}}/>
                    +7-900-000-000
                    <br />
                    <b>почта@mail.ru</b>
                    <br /> 
                    {t('footerInfo5')}
                </Typography.Text>
            </Flex>
        </Footer>
    )
}

export default AppFooter; // Экспортируем компонент по умолчанию