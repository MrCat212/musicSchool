// Импорт необходимых библиотек и компонентов из React и Ant Design, включая календарь
import React, { useContext, useState } from 'react';
import { Button, Calendar, Col, Dropdown, Flex, Form, Input, Modal, Row, Select, TimePicker } from 'antd';

import styles from './calendar.module.css';
import { UserContext } from '../../App'; // Импорт контекста пользователя из главного компонента приложения
import { DownOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';


const CalendarComponent = () => { // Определение компонента CalendarComponent
  
  const {userContext, setUserContext} = useContext(UserContext); // Получение данных о пользователе из контекста
  const [isModalOpen, setIsModalOpen] = useState(false); // Состояние для отображения модального окна
  const [isNotActive, setIsNotActive] = useState(false); // Состояние для отображения неактивности
  const {t} = useTranslation()
  const monthsS = ["Января","Февраля","Марта","Апреля","Мая","Июня","Июля","Августа","Сентября","Октября","Ноября","Декабря"]; // Массив с названиями месяцев на русском языке

  // Функция-обработчик для отправки данных формы
  const handleSubmit = (values) => {
    setIsModalOpen(false);
    const currentDate = new Date(); // Получение текущей даты и времени
    const day = currentDate.getDate(); // Получение текущего дня месяца
    const month = currentDate.getMonth(); // Получение текущего месяца

    if(!userContext?.calendar?.length){ // Если у пользователя нет календаря
      const array = []; // Создание пустого массива для месяцев
      const dayArray = []; // Создание пустого массива для дней месяца
      // Добавление пустых массивов в массив для каждого месяца до текущего
      for(let i = 0; i < month; i++){
        array.push([]);
      }
      for(let i = 0; i < day; i++){ // Добавление пустых массивов в массив для каждого дня месяца до текущего
        dayArray.push([]);
      }
      // Обновление контекста пользователя, добавление календаря с текущим месяцем и днем
      setUserContext(
        {
          ...userContext, 
          calendar: 
            [
              ...array, 
              [
                ...dayArray, 
                [
                  {
                    tool: values.tool, 
                    activity: values.activity, 
                    comment: values.comment, 
                    playedTime: values.playedTime,
                    proizvedenie: values.proizvedenie
                  }
                ]
              ]
            ]
        }
      )
      return
    }
    // Если пользователь имеет календарь, но нет данных для текущего месяца
    if(userContext.calendar.length - 1 < month){
      userContext.calendar.push([]) // Добавление пустого массива для текущего месяца в календарь
    }
    const dayArray = []; // Создание пустого массива для дней месяца
    // Добавление пустых массивов для дней месяца, которые еще не заполнены
    for(let i = 0; i < (day - userContext.calendar[month].length); i++){
      dayArray.push([]);
    }
    const newCalendar = userContext.calendar;
    const lastMonth = newCalendar.pop();
    // Обновление контекста пользователя, добавление данных для текущего месяца и дня в календарь пользователя
    setUserContext(
      {
        ...userContext, 
        calendar: 
          [
            ...newCalendar, 
            [
              ...lastMonth, 
              ...dayArray, 
              [
                {
                  tool: values.tool, 
                  activity: values.activity,
                  comment: values?.comment,
                  playedTime: values.playedTime,
                  proizvedenie: values?.proizvedenie
                }
              ]
            ]
          ]
        }
      )
  }

  // Функция для отрисовки данных в ячейке даты календаря
  const dateCellRender = (value, dedede) => {
    const item = value[0]; // Получение первого элемента данных для текущей даты
    if(item?.activity === 'active'){ // Если активность пользователя для текущей даты "активна"
      const items = [
        {
          key: item.playedTime,
          label: (
            <div>
              <p className={styles.dropdownItem}><strong>{t('composition')}: </strong>{item.proizvedenie}</p>
              <p className={styles.dropdownItem}><strong>{t('instrument')}:</strong> {item.tool}</p>
              <p className={styles.dropdownItem}><strong>{t('classTime')}:</strong> {new Date(item.playedTime).getMinutes()} минут</p>
              {item?.comment && <p className={styles.dropdownItem}><strong>{t('comment')}:</strong> {item?.comment}</p>}
            </div>
          ),
        },
      ];
      return(
        <>
          <ul className={styles.event_active} key={item.playedTime}>
          <Dropdown
            menu={{
              items,
            }}
          >
              <DownOutlined />
          </Dropdown>
        </ul>
        <strong>{dedede}</strong>
        </>
      )
    }else if (item?.activity === 'notActive'){ // Если активность пользователя для текущей даты "неактивна"
      return(
        <>
          <ul className={styles.events_not_active} key={Math.random()}></ul>
            <strong>{dedede}</strong>
        </>
      )
    }else{ // Если для текущей даты нет активности
      return <><strong>{dedede}</strong></>
    }
  };
  
  const onCellRender = (current) => { // Функция для отрисовки ячейки календаря
    const day = userContext?.calendar?.[current.$M]?.find((_, index) => index === current.$D);
    if(day?.length > 0 && userContext.password){
      return dateCellRender(day, current.$D) // Возвращение отрисованных данных для текущей даты, если для неё есть данные
    }else{
      return <strong>{current.$D}</strong> // Если нет, то просто возвращяет номера текущей даты
    }
  }

  // Возврат JSX элемента - компонента календаря
  return (
    <Flex vertical className={styles.calendarWrapper}>
      <Calendar 
        fullscreen={false} 
        className={styles.calendar} 
        fullCellRender={onCellRender}
        headerRender={({ value, onChange }) => {
          const start = 0;
          const end = 12;
          const monthOptions = [];
          let current = value.clone();
          const localeData = value.localeData();
          const months = [];
          for (let i = 0; i < 12; i++) {
            current = current.month(i);
            months.push(localeData.monthsShort(current)); // Добавление короткого названия месяца в массив
          }
          for (let i = start; i < end; i++) {
            monthOptions.push( // Добавление опции выбора месяца в массив
              <Select.Option key={i} value={i} className="month-item">
                {months[i]}
              </Select.Option>,
            );
          }
          const year = value.year(); // Получение текущего года
          const month = value.month(); // Получение текущего месяца
          const options = [];
          for (let i = year - 10; i < year + 10; i += 1) {
            options.push(
              <Select.Option key={i} value={i} className="year-item">
                {i}
              </Select.Option>,
            );
          }
          // Отрисовка выбора года и месяца в заголовке календаря
          return (
            <div
              style={{
                padding: 8,
                marginInlineStart: 'auto'
              }}
            >
              <Row gutter={8}>
                <Col>
                  <Select
                    size="small"
                    dropdownMatchSelectWidth={false}
                    className="my-year-select"
                    value={year}
                    onChange={(newYear) => {
                      const now = value.clone().year(newYear);
                      onChange(now);
                    }}
                  >
                    {options}
                  </Select>
                </Col>
                <Col>
                  <Select
                    size="small"
                    dropdownMatchSelectWidth={false}
                    value={month}
                    onChange={(newMonth) => {
                      const now = value.clone().month(newMonth);
                      onChange(now);
                    }}
                  >
                    {monthOptions}
                  </Select>
                </Col>
              </Row>
            </div>
          );
        }}
      />
      <Col>
          <strong>{t('dataNow')} {new Date().getDate()} {monthsS[new Date().getMonth()]}</strong> {/* Отображение текущей даты */}
      </Col>
      <Button 
        onClick={() => setIsModalOpen(true)} // Обработчик клика для открытия модального окна
        disabled={ // Проверка, активна ли кнопка
          userContext
          ?.calendar
          ?.[new Date().getMonth()]
          ?.length - 1 === new Date().getDate()
          }>{t('activity')}</Button>

      {/* Модальное окно для добавления активности */}
      <Modal 
        open={isModalOpen} 
        onCancel={() => setIsModalOpen(false)}
        footer={false}
      >

        {/* Форма для добавления неактивности */}
        <Form layout='vertical' onFinish={handleSubmit}>
          <Form.Item name='activity' label={t('activ')} rules={[{required: true, message: t('error1')}]}>
            <Select onChange={(i) => i === 'notActive' ? setIsNotActive(true) : setIsNotActive(false)}>
              <Select.Option value='active'>{t('active')}</Select.Option>
              <Select.Option value='notActive'>Не активный</Select.Option>
            </Select>
          </Form.Item>

          {/* Поля для заполнения данных об активности. Если активный день, то появляются поля с условиями */}
          {!isNotActive && (
            <Form.Item name='tool' label={t('tool')} rules={[{required: true, message: t('error1')}]}>
              <Input />
            </Form.Item>
          )}
          {!isNotActive && (
            <Form.Item label={t('classTime')} name='playedTime' rules={[{required: true, message: t('error1')}]}>
              <TimePicker/>
            </Form.Item>
          )}
          {!isNotActive && (
            <Form.Item label={t('composition')} name='proizvedenie' rules={[{required: true, message: t('error1')}]}>
              {
                userContext?.repertoire?.length ? (
                  <Select>
                    {userContext?.repertoire?.map((item, key) => <Select.Option value={item.name}>{item.name}</Select.Option>)}
                  </Select>
                ) : (
                  <h3>Добавьте произведение в репертуар</h3>
                )
              }
            </Form.Item>
          )}
          {!isNotActive && (
            <Form.Item label={t('comment')} name='comment'>
              <Input.TextArea/>
            </Form.Item>
          )}
          {/* Кнопка для отправки данных формы */}
          <Button htmlType='submit'>{t('send')}</Button>
        </Form>
      </Modal>
    </Flex>
  )
};

export default CalendarComponent;