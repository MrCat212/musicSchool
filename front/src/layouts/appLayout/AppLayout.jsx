import React from "react";
// AppLayout позволяет избежать дублирования кода.
//Вместо того чтобы повторять разметку заголовка и футера на каждой странице, можно просто обернуть содержимое страницы в компонент AppLayout.
// Это упрощает поддержку и обновление кода, так как изменения в заголовке или футере нужно делать только в одном месте.
import AppHeader from "../../components/AppHeader/AppHeader";
import { Layout } from "antd";

import styles from './appLayout.module.css';
import AppFooter from "../../components/AppFooter/AppFooter";

const AppLayout = ({ children }) => {
    return(
        <Layout className={styles.layout}>
            <div>
                <AppHeader/>
                <div className={styles.bodyStyles}>
                    {children}
                </div>
            </div>
            <AppFooter />
        </Layout>
    )
}

export default AppLayout;