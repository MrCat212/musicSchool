import React, { useContext, useState } from 'react';
import {
  Badge,
  Button,
  Dropdown,
  Flex,
  Layout,
  Modal,
  message as antdMessage,
} from 'antd';
import { ReactComponent as Logo } from '../../assets/logo.svg';
import { BellOutlined, PhoneOutlined } from '@ant-design/icons';
import { CgProfile } from 'react-icons/cg';
import { RiTelegramLine } from 'react-icons/ri';
import { BsWhatsapp } from 'react-icons/bs';
import { BarChart, Bar, CartesianGrid, YAxis } from 'recharts'; // Импорт компонентов для создания графиков из библиотеки Recharts

import styles from './appHeader.module.css';
import LoginModal from '../loginModal/LoginModal';
import { UserContext } from '../../App';
import AppModal from '../UI/appModal/AppModal';
import { checkIsUserExist, editUser } from '../../utils/api';
import Title from 'antd/es/typography/Title';
import { formatWeekDataFromUser } from '../../utils/formatDataForCharts'; // Импорт функции форматирования данных для графиков
import { randomHexColor } from '../../utils/default'; // Импорт функции для генерации случайного цвета
import useScreenSize from './../../hooks/useScreenSize'; // Импорт хука для определения размера экрана
import { XAxis } from 'recharts';  // Импорт компонента XAxis из библиотеки Recharts
import { useTranslation } from 'react-i18next';
import { t } from 'i18next';

const { Header } = Layout;

const emailRegexp =
  /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/g;

const phoneRegexp =
  /(\+?( |-|\.)?\d{1,2}( |-|\.)?)?(\(?\d{3}\)?|\d{3})( |-|\.)?(\d{3}( |-|\.)?\d{4})/;

const AppHeader = () => {
  const [isModalOpen, setIsModalOpen] = useState(false); // Состояние открытия модального окна для входа/регистрации
  const [isUserModalOpen, setIsUserModalOpen] = useState(false); // Состояние открытия модального окна пользователя
  const [isUserChangeModalOpen, setIsUserChangeModalOpen] = useState(false); // Состояние открытия модального окна изменения пользователя
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false); // Состояние открытия модального окна оплаты
  const [modalType, setModalType] = useState(''); // Состояние типа модального окна (вход или регистрация)
  const { t } = useTranslation();

  const loginFields = [ // Поля для формы входа
    {
      label: t('mail'),
      validateTrigger: 'onBlur',
      name: 'login',
      rules: [
        { required: true, message: t('enterLogin') }, // Обязательное поле
        { pattern: emailRegexp, message: 'Введите корректную почту' }, // Валидация email
      ],
    },
    {
      label: t('password'),
      validateTrigger: 'onBlur',
      name: 'password',
      rules: [{ required: true, message: 'Введите пароль' }],
    },
  ];

  const editUserFields = [ // Поля для формы редактирования пользователя включая поля со входа
    ...loginFields,
    {
      label: t('LFS'),
      validateTrigger: 'onBlur',
      name: 'fullName',
      rules: [
        { required: true, message: t('error1') },
        { pattern: /[А-яёЁ]+\s[А-яёЁ]+\s?([А-яёЁ]+)?/, message: t('error2') },
      ],
    },
    {
      label: t('phone'),
      validateTrigger: 'onBlur',
      name: 'phoneNumber',
      rules: [
        { required: true, message: t('error1') },
        { pattern: phoneRegexp, message: t('error3') }, // Валидация полного имени
      ],
    },
    {
      label: t('timeZone'),
      validateTrigger: 'onBlur',
      name: 'GMT',
      rules: [
        { required: true, message: t('error1') },
        { pattern: /[+-]\d?\d/g, message: 'Введите правильный часовой пояс' },
      ],
    },
    {
      label: t('instrument'),
      validateTrigger: 'onBlur',
      name: 'tool',
      rules: [{ required: true, message: t('error1') }],
    },
  ];

  const editTeacherFields = [ // Поля для формы редактирования преподавателя
    ...loginFields,
    {
      label: t('phone'),
      validateTrigger: 'onBlur',
      name: 'phoneNumber',
      rules: [
        { required: true, message: t('error1') },
        { pattern: phoneRegexp, message: t('error3') },
      ],
    },
  ];

  const { userContext, setUserContext } = useContext(UserContext);

  const [messageApi, contextHolder] = antdMessage.useMessage(); // Использование API сообщений Ant Design

  const screenSize = useScreenSize(700); // Использование хука для определения размера экрана

  const weekChartData = formatWeekDataFromUser(userContext ?? []).slice(); // Форматирование данных пользователя для графика

  const weekChartDataKeys = weekChartData
    ?.reduce((acc, item) => [...acc, ...Object.keys(item)], [])
    ?.reduce((acc, item) => (acc.includes(item) ? acc : [...acc, item]), []);

  const error = (message) => {
    messageApi.open({
      type: 'error',
      content: message,
    });
  };

  const success = (message) => {
    messageApi.open({
      type: 'success',
      content: message,
    });
  };

  const handleQuit = () => { // Обработчик выхода пользователя
    setUserContext(null); // Устанавливаем значение контекста пользователя в null, что означает выход пользователя
    setIsUserModalOpen(false); // Закрываем модальное окно пользователя, если оно было открыто
    localStorage.setItem('user', JSON.stringify(null)); // Очистка информации о пользователе в локальном хранилище браузера
    localStorage.setItem('all-users', JSON.stringify(null));
  };

  const handleChangeOpen = () => {  // Обработчик открытия модального окна изменения пользователя
    setIsUserChangeModalOpen(true);
    setIsUserModalOpen(false);
  };

  const handleChange = async (values) => {  // Обработчик изменения данных пользователя
    const name = values?.fullName?.split(' ') ?? ['', '', ''];
    const formattedUser = {
      ...values,
      firstName: name[1],
      lastName: name[0],
      surname: name[2] ?? '',
    };
    const newProfile = { ...userContext, ...formattedUser };

    if (JSON.stringify(newProfile) === JSON.stringify(userContext)) { // Если новый профиль (newProfile) и текущий профиль пользователя из контекста (userContext) идентичны, выводим ошибку и завершаем выполнение функции.
      error(t('error6'));
      return;
    }

    const isEmailExist = await checkIsUserExist(values.login);

    if (isEmailExist !== 'not') {
      error('Пользователь с такой почтой уже существует');
    } else {
      const editResponse = await editUser(newProfile);

      if (editResponse === 'success') {
        setUserContext(newProfile);
        localStorage.setItem('user', JSON.stringify(newProfile));
        success('Изменения успешно внесены');
        setIsUserChangeModalOpen(false);
      }
    }
  };

  const items = [ // Элементы меню для Dropdown
    {
      key: '1',
      label: ( // Элемент ссылки на конференцию
        <a target='_blank' rel='noopener noreferrer' href={userContext?.conf}>
          {t('conf')}
        </a>
      ),
    },
  ];

  return (
    <Header className={styles.header}>
      <Logo className={styles.logo} />
      <Flex className={styles.headerButtons}>
        <div className={styles.contacts_holder}>
          <a target='_blank' href='https://wa.me/+79133968940' rel='noreferrer'>
            <BsWhatsapp className={styles.icons} />
          </a>
          <a target='_blank' href='https://t.me/Mr_Cat212' rel='noreferrer'>
            <RiTelegramLine className={styles.icons} />
          </a>
          <a href='tel:+79000000000'>
            <PhoneOutlined
              style={{ fontSize: '50px', rotate: '90deg' }}
              className={styles.icons}
            />
            <span className={styles.phone_number}>+7-900-000-000</span>
          </a>
        </div>
        <div className={styles.authorization_buttons}>
          {userContext ? (
            <div className={styles.authIcons}>
              {!userContext?.role && (
                <Dropdown
                  menu={{
                    items,
                  }}
                  disabled={!userContext?.conf} // Отключение меню, если конференция недоступна
                >
                  <Badge count={userContext?.conf && 1}>
                    <BellOutlined className={styles.icons} />
                  </Badge>
                </Dropdown>
              )}
              <CgProfile // Иконка профиля пользователя
                className={styles.icons}
                onClick={() => setIsUserModalOpen(true)} // Обработчик открытия модального окна пользователя
              />
            </div>
          ) : (
            <div className={styles.notAuthIcons}> {/* Блок кнопок для неавторизованных пользователей */}
              <Button // Кнопка регистрации
                className={styles.button}
                onClick={() => {
                  setModalType(t('signUp')); // Установка типа модального окна
                  setIsModalOpen(true); // Открытие модального окна
                }}
              >
                {t('signUp')} {/* Текст кнопки регистрации */}
              </Button>
              <Button // Кнопка входа
                className={styles.button}
                onClick={() => {
                  setModalType(t('logIn'));
                  setIsModalOpen(true);
                }}
              >
                {t('logIn')}
              </Button>
            </div>
          )}
        </div>
      </Flex>
      <LoginModal // Модальное окно для входа
        open={isModalOpen} // Состояние открытия модального окна
        setIsOpen={setIsModalOpen}
        modalType={modalType}
        setModalType={(type) => setModalType(type)}
      /> 
      {/* Блок модальных окон для авторизованных пользователей */}
      {!userContext?.role && userContext ? ( //Условие для проверки роли пользователя
        <>
          <Modal
            footer={false}
            onCancel={() => setIsUserModalOpen(false)}
            open={isUserModalOpen}
          >
            <Title>
              {userContext?.fullName ??
                userContext?.firstName + ' ' + userContext?.lastName}
            </Title>
            <p key='number'>
              <strong>{t('phone')}:</strong> {userContext.phoneNumber}
            </p>
            <p key='instrument'>
              <strong>{t('instrument')}:</strong> {userContext.tool}
            </p>
            <p>
              <strong>{t('numberClasses')}:</strong> {userContext?.status ?? 0}
            </p>
            {/* График */}
            <BarChart
              width={screenSize.width > 700 ? 500 : 400}
              height={300}
              data={weekChartData.slice(-7)} // Данные для графика
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 30,
              }}
            >
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis tickFormatter={(a) => customDayXAxis(a, weekChartData)} />
              <YAxis tickFormatter={(num) => (num === 1 ? t('active') : '')} />
              {weekChartDataKeys.map((item, index) => {
                return (
                  <Bar
                    key={index}
                    dataKey={item}
                    stackId={index}
                    fill={randomHexColor()} // Случайный цвет для столбцов
                  />
                );
              })}
            </BarChart>
            <div className={styles.authorization_buttons}> {/* Блок кнопок авторизации */}
              <Button onClick={handleChangeOpen}>{t('editing')}</Button> {/* Кнопка редактирования */}
              <Button onClick={() => setIsPaymentModalOpen(true)}> {/* Кнопка открытия модального окна с информацией о платежах */}
                {t('how')}{' '}
              </Button>
              <Button onClick={handleQuit}>{t('exit')}</Button> {/* Кнопка выхода */}
            </div>
          </Modal>
           {/* Модальное окно для изменения данных пользователя */}
          <AppModal
            open={isUserChangeModalOpen}
            handleClose={() => setIsUserChangeModalOpen(false)}
            fields={editUserFields.map((item) => ({ // Поля для редактирования данных пользователя
              ...item,
              defaultValue: userContext[item.name], // Значение по умолчанию
            }))}
            footer={false}
            fullWidth
            handleSubmit={handleChange}
          >
            {contextHolder}
          </AppModal>
          {/* Модальное окно для платежей */}
          <Modal
            open={isPaymentModalOpen}
            onCancel={() => setIsPaymentModalOpen(false)}
            footer={false}
            style={{ textAlign: 'center' }}
          >
            <Title>{t('how')} </Title>
            <p>{t('info6')} </p>
            <Title>{t('info7')}</Title>
            <p>
              {t('phone')}: <br />
              +7-900-000-00-00 <br />
              ФИО: Иванов Иван Иванович
            </p>
            <p>{t('info8')}</p>
          </Modal>
        </>
      ) : (
        userContext?.role && ( // Условие для проверки роли пользователя
          <>
            <Modal
              footer={false}
              onCancel={() => setIsUserModalOpen(false)}
              open={isUserModalOpen}
            >
              <Title>
                {userContext?.fullName ?? // Полное имя пользователя
                  userContext?.firstName + ' ' + userContext?.lastName} 
              </Title>
              <p key='number'>
                <strong>{t('phone')}:</strong> {userContext.phoneNumber}
              </p>
              <div className={styles.authorization_buttons}> {/* Блок кнопок авторизации */}
                <Button onClick={handleChangeOpen}>{t('editing')}</Button> {/* Кнопка редактирования */}
                <Button onClick={handleQuit}>{t('exit')}</Button> {/* Кнопка выхода */}
              </div>
            </Modal>
            {/* Модальное окно для изменения данных преподавателя */}
            <AppModal
              open={isUserChangeModalOpen}
              handleClose={() => setIsUserChangeModalOpen(false)}
              fields={editTeacherFields.map((item) => ({
                ...item,
                defaultValue: userContext[item.name],
              }))}
              footer={false}
              fullWidth
              handleSubmit={handleChange} // Обработчик отправки формы
            >
              {contextHolder}
            </AppModal>
          </>
        )
      )}
    </Header>
  );
};

const customDayXAxis = (rest, chartData) => { // Графики в профиле
  const length = chartData?.length - 6;
  const dayNames = [
    t('tu'),
    t('we'),
    t('th'),
    t('fr'),
    t('sa'),
    t('su'),
    t('mo'),
  ];
  const day = new Date( // День недели
    `${new Date().getMonth()}/${rest + length}/${new Date().getFullYear()}`
  ).getDay();
  return dayNames[day];
};

export default AppHeader;
