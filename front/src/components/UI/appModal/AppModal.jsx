import React, { useState } from "react";
import Modal from "antd/es/modal/Modal";
import Title from "antd/es/typography/Title";
import { Button, Form, Input, Select } from "antd";
import { gmtFields } from "../../../utils/formFields";

import styles from './appModal.module.css';
import { useTranslation } from "react-i18next";

const modalStyles = { // Стили для модального окна
    mask: {
        backdropFilter: 'blur(10px)', // Применение эффекта размытия фона
    },
};

const AppModal = ({ // Определение компонента AppModal с пропсами
        open, 
        handleClose, // Функция для закрытия модального окна
        title, 
        children, 
        fields, 
        handleSubmit,  // Функция для обработки отправки формы
        changePassword, // Функция для изменения пароля
        fullWidth,
        ...rest
    }) => {

    const [form] = Form.useForm();

    const onGmtChange = (value) => { // Обработчик изменения часового пояса GMT
        form.setFieldsValue({GMT: value}) // Установка значения часового пояса в форме
    }

    const {t} = useTranslation()

    return(
        <Modal 
            open={open} 
            onCancel={handleClose}
            className={styles.modal}
            styles={modalStyles}
            {...rest} 
        >
            {children}
            <Title className={styles.title}>{title}</Title>
            <Form onFinish={handleSubmit} layout="vertical" autoComplete='true' form={form}>
                {fields.map((item, index) => {
                    return(
                        <Form.Item 
                            label={item.label} 
                            validateTrigger="onBlur" 
                            name={item.name} 
                            rules={[...item.rules]} // Правила валидации поля формы
                            key={index}
                            initialValue={item.defaultValue}
                        >
                            {
                                item.name === 'GMT' // Если имя поля GMT
                                ? 
                                
                                // Отображение выпадающего списка для выбора часового пояса
                                  <Select onChange={onGmtChange}>
                                    {gmtFields.map((item, index) => ( // Проход по массиву часовых поясов
                                        <Select.Option key={index} value={item.value}>{item.value + ' ' + item.name}</Select.Option> // Отображение вариантов выбора часового пояса
                                    ))}
                                  </Select>
                                : item.name === 'password'
                                ? <Input.Password /> // Отображение поля для ввода пароля с маскировкой
                                : <Input /> // Отображение поля для ввода
                            }
                        </Form.Item>   
                    )
                })}
                <Form.Item>
                    <Button type="primary" htmlType="submit" style={{marginInlineEnd: '1em', width: fullWidth ? '100%' : ''}}>{t('send')}</Button> // Кнопка для отправки формы
                    {(fields.length === 2 && title !== t('recoveryPass')) && <Button onClick={changePassword}>{t('forgot')}</Button>} // Условие отображения кнопки для смены пароля
                </Form.Item>
            </Form>
        </Modal>
    )
}

export default AppModal;