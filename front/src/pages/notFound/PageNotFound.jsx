import React from "react";

import styles from './notFound.module.css';

const PageNotFound = () => {
    return(
        <div className={styles.not_found_container}>
            <h1>Oops!</h1>
            <p>Looks like you try to get where we don't like you to be</p>
            <p>or we do not handle some error...</p>
        </div>
    )
}

export default PageNotFound