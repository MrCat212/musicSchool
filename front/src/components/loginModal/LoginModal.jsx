import React, { useCallback, useContext, useEffect, useReducer, useState } from "react"; // Импорт необходимых хуков из React
import { Anchor, Button, Form, Input, Modal, message } from "antd"; // Импорт компонентов из библиотеки Ant Design
import AppModal from "../UI/appModal/AppModal"; // Импорт пользовательского компонента модального окна
import Title from "antd/es/typography/Title"; // Импорт компонента Title из Ant Design

import { changePassword, checkIsUserExist, confirmEmail, createAccount } from '../../utils/api'; // Импорт функций API для взаимодействия с сервером
// import { loginFields, recoveryFields, registrationFields } from "../../utils/formFields";
import { UserContext } from "../../App"; // Импорт контекста пользователя
import { useTranslation } from "react-i18next";

const emailRegexp =
  /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/g;

const phoneRegexp =
  /(\+?( |-|\.)?\d{1,2}( |-|\.)?)?(\(?\d{3}\)?|\d{3})( |-|\.)?(\d{3}( |-|\.)?\d{4})/;


// Управление состоянием модального окна
const reducer = (state, action) => { 
    switch(action.type){
        case('loginResult'): {
            return({
                ...state,
                success: action.payload?.success, // Обновление статуса успеха
                error: action.payload?.error, // Обновление статуса ошибки
                emailCode: undefined,
                isConfirmed: false,
                isConfirmEmailModalOpen: false,
            })
        }
        case('emailConfirm'): {
            return({
                ...state,
                emailCode: action.payload?.emailCode, // Обновление кода подтверждения email
                isConfirmed: action.payload?.isConfirmed ?? false, // Обновление статуса подтверждения
                isConfirmEmailModalOpen: action.payload?.isConfirmEmailModalOpen // Обновление статуса открытия модального окна подтверждения email
            })
        }
        default: {

        }
    }
}

// Начальное состояние
const initialState = { 
    success: undefined,
    error: undefined,
    emailCode: undefined,
    isConfirmed: false,
    isConfirmEmailModalOpen: false,
}

const LoginModal = ({
    open, 
    setIsOpen, 
    modalType, 
    setModalType
}) => {
    
    const [messageApi, contextHolder] = message.useMessage(); // Получение API для отображения сообщений
    const [{
        emailCode, 
        isConfirmEmailModalOpen, 
        isConfirmed, 
        error: errorMessage, 
        success: successMessage
    }, dispatch] = useReducer(reducer, initialState);
    
    const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false); // Состояние открытия модального окна смены пароля
    const [user, setUser] = useState(); 
    const {setUserContext} = useContext(UserContext);
    const {t} = useTranslation();

    // Поля формы для входа
    const loginFields = [
        {
          label: t("mail"),
          validateTrigger: "onBlur",
          name: "login",
          rules: [
            { required: true, message: t('enterLogin') },
            { pattern: emailRegexp, message: "Введите корректную почту" },
          ],
        },
        {
          label: t("password"),
          validateTrigger: "onBlur",
          name: "password",
          rules: [{ required: true, message: "Введите пароль" }],
        },
      ];

      // Поля формы для регистрации
      const registrationFields = [
        ...loginFields,
        {
          label: t("LFS"),
          validateTrigger: "onBlur",
          name: "fullName",
          rules: [
            { required: true, message: t("error1") },
            { pattern: /[А-яёЁ]+\s[А-яёЁ]+\s?([А-яёЁ]+)?/, message: t("error2") },
          ],
        },
        {
          label: t("phone"),
          validateTrigger: "onBlur",
          name: "phoneNumber",
          rules: [
            { required: true, message: t("error1") },
            { pattern: phoneRegexp, message: t("error3") },
          ],
        },
        {
          label: t("timeZone"),
          validateTrigger: "onBlur",
          name: "GMT",
          rules: [
            { required: true, message: t("error1") },
            { pattern: /[+-]\d?\d/g, message: "Введите правильный часовой пояс" },
          ],
        },
        {
          label: t("instrument"),
          validateTrigger: "onBlur",
          name: "tool",
          rules: [{ required: true, message: t("error1") }],
        },
        {
          label: t("howMany"),
          validateTrigger: "onBlur",
          name: "spendTime",
          rules: [
            { required: true, message: t("error1") },
            { pattern: /\d?\d/g, message: t("error4") },
          ],
        },
      ];

    // Список типов модальных окон (регистрация и вход)
    const anchorTypes = [t('signUp'), t('logIn')];

    // Функция для отображения сообщения об ошибке
    const error = useCallback((message) => {
        messageApi.open({
        type: 'error',
        content: message ?? 'Произошла ошибка',
        });
    }, [messageApi]);

    // Функция для отображения сообщения об успехе
    const success = useCallback((message) => {
        messageApi.open({
        type: 'success',
        content: message ?? 'Аккаунт успешно создан',
        });
    }, [messageApi])

    const handleAnchorClick = (e, link) => {
        setModalType(anchorTypes[link.href]);
        e.preventDefault();
    }

     // Обработчик отправки формы логина
    const handleSubmit = async (user) => {
        setUser(user);
        if(modalType === t('logIn')){
            try{
                const profile = await checkIsUserExist({login: user.login, password: user.password});
                if(profile?.result ?? true){
                    dispatch({
                        type: 'loginResult',
                        payload: {success: t('log')}
                    });
                    setUserContext(profile);
                    localStorage.setItem('user', JSON.stringify(profile));
                }else{
                    dispatch({
                        type: 'loginResult',
                        payload: {error: t('error')}
                    })
                }
            }catch(e){
                console.log(e)
                dispatch({
                    type: 'loginResult',
                    payload: {error: 'Произошла ошибка при входе'}
                })
            }

        // Регистрация
        }else{
            try{
                const isExist = (await checkIsUserExist(user.login)).includes('exist');
                if(isExist){
                    error('Пользователь с такой почтой уже существует')
                }else{
                    const code = await confirmEmail(user.login);
                    dispatch({
                        type: 'emailConfirm',
                        payload: {
                            emailCode: code, // Открывается модальное окно кода и сохраняется сам код
                            isConfirmEmailModalOpen: true,
                        }
                    });
                }
            }catch(e){
                console.log(e);
            }
        }
    }

// Эффект для выполнения кода после подтверждения email
    useEffect(() => {
        const func = async () => {
            if(isConfirmed){
                const name = user.fullName.split(' ');
                const formattedUser = {...user, firstName: name[1], lastName: name[0], surname: name[2] ?? ''};
                try{
                    await createAccount(formattedUser);
                    dispatch({
                        type: 'loginResult',
                        payload: {
                            success: 'Аккаунт успешно создан'
                        }
                    })
                }catch(e){
                    console.log(e)
                    dispatch({
                        type: 'loginResult',
                        payload: {
                            success: 'Произошла ошибка при создании аккаунта'
                        }
                    })
                }
            }
        }
        func();
    }, [isConfirmed, user])

    // Эффект для отображения сообщений об ошибке или успехе
    useEffect(() => {
        if(successMessage){
            success(successMessage);
            setIsOpen(false);
        }else if(errorMessage){
            error(errorMessage);
        }
        dispatch({
            type: 'loginResult',
            payload: {}
        })
    }, [errorMessage, successMessage, success, error, setIsOpen])

    return(
        <AppModal 
            open={open} 
            handleClose={() => setIsOpen(false)}
            title={modalType}
            fields={modalType === t('logIn') ? loginFields : registrationFields}
            handleSubmit={handleSubmit}
            footer={false}
            changePassword={() => setIsChangePasswordOpen(true)}
        >
            {contextHolder}
            <Anchor 
                direction="horizontal"
                onClick={handleAnchorClick}
                items={[
                    {
                        key: '0',
                        href: '0',
                        title: anchorTypes[0]
                    },
                    {
                        key: '1',
                        href: '1',
                        title: anchorTypes[1]
                    }
                ]}
            />
            <ConfirmEmailModal 
                open={isConfirmEmailModalOpen} 
                handleClose={() => dispatch({type: 'emailConfirm', payload: {isConfirmEmailModalOpen: false}})} 
                pattern={emailCode} //Код подтверждения, который был отправлен на почту пользователя используется для сравнения с введенным пользователем кодом.
                setIsConfirmed={() => dispatch({type: 'emailConfirm', payload: {isConfirmed: true}})} // При успешном подтверждении, dispatch отправляет действие, которое обновляет состояние, указывая, что email подтвержден (isConfirmed: true).
            />
            <ChangePasswordModal 
                open={isChangePasswordOpen}
                handleClose={() => setIsChangePasswordOpen(false)}
                setError={(e) => dispatch({
                    type: 'loginResult',
                    payload: {
                        error: e
                    }
                })}
                setSuccess={(e) => dispatch({
                    type: 'loginResult',
                    payload: {
                        success: e
                    }
                })}
            />
        </AppModal>
    )
}

export const ConfirmEmailModal = ({open, handleClose, pattern, setIsConfirmed}) => {
    const {t} = useTranslation()
    
    const handleSubmit = () => {
        handleClose();
        setIsConfirmed(true);
    }

    const codeRegexp = new RegExp(pattern); // Регулярное выражение для проверки кода подтверждения

    return(
        <Modal open={open} onCancel={handleClose} footer={false} centered style={{top: '-150px'}}>
            <Title level={5}>
                {t('sendCode')}
            </Title>
            <Form onFinish={handleSubmit }>
                <Form.Item
                    name='pipipi'
                    rules={[
                        {
                            required: true, 
                            message: t('code'), 
                            validateTrigger: "onBlur"
                        }, 
                        {
                            pattern: codeRegexp, 
                            message: 'Неверный код',
                            validateTrigger: "onBlur"
                        }
                    ]}>
                    <Input.OTP />
                </Form.Item>
                <Button htmlType="submit">{t('send')}</Button>
            </Form>
        </Modal>
    )
}

const ChangePasswordModal = ({open, handleClose, setError, setSuccess}) => {
    const [isEnterCodeOpened, setIsEnterCodeOpened] = useState(false); // Состояние, чтобы отслеживать, открыто ли модальное окно для ввода кода
    const [userValues, setUserValues] = useState(); // Состояние для хранения данных пользователя
    const [code, setCode] = useState(); // Состояние кода подтверждения
    const {t} = useTranslation()

    // Поля для формы восстановления пароля
    const recoveryFields = [
        {
          label: t("mail"),
          validateTrigger: "onBlur",
          name: "login",
          rules: [
            { required: true, message: t('enterLogin') },
            { pattern: emailRegexp, message: "Введите корректную почту" },
          ],
        },
        {
          label: t("password"),
          validateTrigger: "onBlur",
          name: "password",
          rules: [{ required: true, message: "Введите пароль" }],
        },
      ];

    // Функция для получения кода подтверждения по email
    const getCode = async (login) => {
        const codeEmail = await confirmEmail(login); // Вызов API для получения кода подтверждения
        setCode(codeEmail); // Установка кода подтверждения
    }

    // Функция для обработки отправки формы
    const handleSubmit = (values) => {
        setUserValues(values); // Установка значений пользователя
        setIsEnterCodeOpened(true); // Открытие модального окна ввода кода
        getCode(values.login); // Получение кода подтверждения
    }

    return(
        <>
            {!isEnterCodeOpened
                ?   <AppModal
                        fields={[...recoveryFields]}
                        title={t('recoveryPass')}
                        open={open}
                        handleClose={handleClose}
                        handleSubmit={handleSubmit}
                        footer={false}
                    >
                    </AppModal>
                :   <AppModal
                        open={isEnterCodeOpened}
                        title={t('code')}
                        handleClose={() => setIsEnterCodeOpened(false)}
                        fields={[{
                            label: t('code'),
                            validateTrigger: "onBlur",
                            name: 'code',
                            rules: [
                                {required: true, message: t('code')},
                                {pattern: new RegExp(code), message: 'Неправильный код'} // Валидация на соответствие коду подтверждения
                            ]
                        }]}
                        handleSubmit={() => {
                            try{
                                changePassword(userValues)
                                setSuccess('Пароль успешно изменен')
                            }catch(e){
                                console.log(e);
                                setError('Произошла ошибка при смене пароля')
                            }
                            setIsEnterCodeOpened(false);
                            handleClose(); // Закрытие основного модального окна
                        }}
                        footer={false}
                    >

                    </AppModal>
            }
        </>
    )
}

export default LoginModal;