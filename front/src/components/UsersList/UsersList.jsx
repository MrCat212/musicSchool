import { Button, Flex, InputNumber, Table } from "antd";
import { getTimeInTimezone } from "../../utils/default";
import { createConf, editUser } from "../../utils/api";
import { useEffect, useState } from "react";

import styles from './UsersList.module.css'
import useScreenSize from './../../hooks/useScreenSize'; // Импортируем хук для получения размера экрана
import { useTranslation } from "react-i18next";


export const UsersList = ({allUsers: users, setRefetchValue}) => { // Определяем компонент UsersList, который принимает всех пользователей и функцию для обновления данных
    
    const [isLoading, setIsLoading] = useState(false); // Создаем состояние для отслеживания загрузки
    const [timer, setTimer] = useState(null); // Создаем состояние для таймера
    const [allUsers, setAllUsers] = useState(users);  // Создаем состояние для всех пользователей
    const {width} = useScreenSize()// Используем хук для получения ширины экрана
    const {t} = useTranslation();

    const columns = [
        {
            title: 'ФИО',
            dataIndex: 'name',
        },
        {
            title: t('phone'),
            dataIndex: 'phone',
        },
        {
            title: t('instrument'),
            dataIndex: 'tool',
        },
        {
            title: t('time'),
            dataIndex: 'time',
        },
        {
            title: t('howManyYears'),
            dataIndex: 'spendTime'
        },
        {
            title: t('numberClasses1'),
            dataIndex: 'status'
        },
        {
            title: 'Создание конференции',
            dataIndex: 'button'
        }
    ];

    useEffect(() => { // Хук, который срабатывает при изменении users
        setAllUsers(users) // Обновляем состояние allUsers
    }, [users])

    const handleCreateConf = (user) => { // Функция для создания конференции
        setIsLoading(true); // Устанавливаем состояние загрузки
        createConf().then(res => { // Создаем конференцию
            return editUser({...user, conf: res, status: user.status - 1}).then(_ => { // Редактируем пользователя, добавляя конференцию и уменьшая статус
                setRefetchValue(prev => prev + 1); // Обновляем данные
            })
        }).finally(() => {
            setIsLoading(false); // Сбрасываем состояние загрузки
        })
    }

    const handleDeleteConf = (user) => { // Функция для удаления конференции
        setIsLoading(true);
        editUser({...user, conf: null}).then(_ => { // Редактируем пользователя, удаляя конференцию
            setRefetchValue(prev => prev + 1); // Обновляем данные
        })
        .finally(() => {
            setIsLoading(false); // Сбрасываем состояние загрузки
        })
    }
    //Таймер, который нужен для запросов на сервер раз в 0,5 секнуд
    const handleChange = (user, value) => { // Функция для изменения статуса пользователя
        if(timer){
            clearTimeout(timer); // Очищаем таймер, если он установлен
            const timerId = setTimeout(() => {
                editUser({...user, status: value});
                setRefetchValue(prev => prev + 1);
            }, 500);
            setTimer(timerId)
        }else{
            const timerId = setTimeout(() => {
                editUser({...user, status: value});
                setRefetchValue(prev => prev + 1); // Обновляем данные (для обновления списка пользователей)
            }, 500); // Задержка в 500 миллисекунд (0,5 секунды)
            setTimer(timerId)
        }
    }

    const tableData = // Подготавливаем данные для таблицы пользователей
        allUsers
            .map(
                item => 
                {
                    return (
                        {
                            name: item.firstName + ' '  // Формируем полное имя пользователя
                            + item.lastName + ' '
                            + item?.surname,
                            phone: item.phoneNumber, // Номер телефона пользователя
                            tool: item.tool, // Инструмент пользователя
                            time: getTimeInTimezone(item.GMT).toString().match(/\d\d:\d\d/), // Время пользователя в его часовом поясе
                            // Поле для изменения статуса пользователя
                            status: (<InputNumber style={{textAlign: 'center', width: 'fit-content'}} className={styles.status} value={item?.status ?? 0} onChange={(value) => handleChange(item, value)}></InputNumber>),
                            spendTime: item?.spendTime ?? 1, // Сколько лет занимается
                            button: item?.conf ? (  // Если конференция существует
                                <>
                                    <a rel="noreferrer" target="_blank" className={styles.conf} style={{backgroundColor: 'white', border: '1px solid gray', padding: '5px', borderRadius: '5px'}} href={item.conf}>{t('conf')}</a>
                                    <br />
                                    <Button type="primary" style={{width: '7em', backgroundColor: 'red', maxWidth: "6em", marginTop: '8px'}} onClick={() => handleDeleteConf(item)} disabled={isLoading}>{t('delete')}</Button>
                                </>
                            ) : ( // Если конференция не существует
                                <Button style={{backgroundColor: 'white'}} disabled={isLoading || !item?.status} onClick={() => {
                                    handleCreateConf(item);
                                    setAllUsers(prev => {
                                        return prev.map(obj => obj._id === item._id ? {...obj, status: item.status - 1} : obj) // Обновляем статус пользователя в списке
                                    })
                                }}>{t('createConf')}</Button>
                            )
                        }
                    )
                }
            )

    return (
        <Flex style={{ overflowX: width < 800 ? 'auto' : 'hidden', width: '100%' }}> {/* Основной контейнер компонента */}
            <Table
                columns={columns} // Передаем колонки для таблицы
                dataSource={tableData} // Передаем данные для таблицы
                rowClassName={(obj) => { // Определяем класс строки таблицы в зависимости от статуса
                    if((obj.status.props.value ?? 0) < 2){
                        return styles.danger // Класс для строк с низким статусом
                    }
                }}
            />
        </Flex>
    )
}