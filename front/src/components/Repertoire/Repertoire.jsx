import { Button, Flex, Form, Input, Modal, Select, Table } from "antd";
import React, { useContext, useEffect, useRef, useState } from "react";
import { UserContext } from "../../App"; // Импортируем контекст пользователя из приложения

import styles from './Repertoire.module.css';
import { useTranslation } from "react-i18next";


const Repertoire = ({userContextProp}) => { // Определяем компонент Repertoire и получаем проп userContextProp
  
  const {userContext: globalUserContext, setUserContext} = useContext(UserContext); // Извлекаем глобальный контекст пользователя и функцию для его обновления
  let userContext = userContextProp ?? globalUserContext
  const [isOpen, setIsOpen] = useState(false);
  const selectedField = useRef(null)
  const [form] = Form.useForm();
  const {t} = useTranslation()

  const columns = [ // Определяем колонки для таблицы репертуара
    {
      title: t('name'),
      dataIndex: 'name',
    },
    {
      title: t('genre'),
      dataIndex: 'genre',
    },
    {
      title: t('instrument'),
      dataIndex: 'tool',
    },
    {
      title: t('composer'),
      dataIndex: 'compositor',
    },
    {
      title: t('link1'),
      dataIndex: 'musicLink',
    },
    {
      title: t('stage'),
      dataIndex: 'asdasd',
    },
    {
      title: t('link2'),
      dataIndex: 'linkToMusic'
    },
    {
      title: t('status'),
      dataIndex: 'status'
    },
    {
      title: '', // Пустой заголовок для колонки с кнопками
      dataIndex: 'button'
    }
  ];
  //Тут происходит обновление статуса произведения и добавление новой строки
  const selectFields = [t('analysis'), t('grinding'), t('memorize')]; // Варианты для выбора стадии (Анализ, Шлифовка, Запоминание)
    const handleDelete = (deleteIndex) => { // Функция для удаления элемента репертуара по индексу
      const repertoire = userContext?.repertoire; // Получаем текущий репертуар из контекста пользователя
      const sameObj = userContext?.repertoire?.find((_, index) => index === deleteIndex); // Находим объект для удаления по индексу
      const newRepertoire = repertoire.filter(item => { // Создаем новый репертуар, исключая удаляемый элемент
        if(JSON.stringify(item) === JSON.stringify(sameObj)){ // Сравниваем объекты по строковому представлению
          return false // Удаляем объект, который совпадает с выбранным
        }else{
          return true // Оставляем все остальные объекты
        }
      })
      setUserContext({...userContext, repertoire: [...newRepertoire]}); // Обновляем состояние контекста пользователя новым репертуаром
    }

    const handleSubmit = (values) => {
      const repertoire = userContext?.repertoire;
      const sameObj = userContext?.repertoire?.find((_, index) => index === selectedField.current);
      if(sameObj?.name){ // Если объект с таким именем существует
        const newRepertoire = repertoire.map(item => { // Создаем новый репертуар, заменяя редактируемый объект
          if(JSON.stringify(item) === JSON.stringify(sameObj)){ // Сравниваем объекты по строковому представлению
            return values // Заменяем объект новыми значениями из формы
          }else{ //Или оставляем как есть
            return item
          }
        })
        setUserContext({...userContext, repertoire: [...newRepertoire]}); // Обновляем контекст пользователя новым репертуаром
      }else{
        setUserContext({...userContext, repertoire: [...(repertoire ?? []), values]}); // Добавляем новый объект в репертуар
      }
      setIsOpen(false); // Закрываем модальное окно
      selectedField.current = null; // Сбрасываем выбранное поле
      form.resetFields() // Сбрасываем значения формы
    }

    const tableData = userContext?.repertoire?.map(item => {
      const length = Object.values(item).filter(item => !!item?.length).length; // Определяем количество заполненных полей
      if(length  < 6) return ({...item, status: 'В планах'}); // Если меньше 6 полей заполнены, статус "В планах"
      else if (length === 6) return ({...item, status: 'В работе'}); // Если 6 полей заполнены, статус "В работе"
      else return {...item, status: 'Готово'} // Если все поля заполнены, статус "Готово"
    }).map((item, index) => ({...item, button: ( // Добавляем кнопки редактирования и удаления для каждой строки таблицы
      <Flex vertical>
        <Button onClick={() => {
          setIsOpen(true);
          selectedField.current = index;
        }} style={{marginBottom: '20px', width: '7em'}}>{t('edit')}</Button>
        <Button type="primary" style={{width: '7em', backgroundColor: 'red'}} onClick={() => handleDelete(index)}>
          {t('delete')}
        </Button>
      </Flex>
    ), key: index})) // Устанавливаем ключ для каждого элемента

    useEffect(() => { // Используем эффект для заполнения формы при открытии модального окна
      form.setFieldValue(userContext?.repertoire?.[selectedField.current])
    }, [form, isOpen, selectedField, userContext?.repertoire]) //Здесь происходит заполнение формы в модальном окне при открытии. form.setFieldValue() устанавливает значения полей формы на основе данных выбранного произведения из репертуара (userContext?.repertoire?.[selectedField.current]).

    return (
        <Flex vertical style={{ overflowX: 'auto', width: '100%' }}>

          <Table
              columns={columns}
              dataSource={tableData}
              style={{textAlign: 'center'}}
              showSorterTooltip={{
                  target: 'sorter-icon',
              }} // Показать подсказку при наведении на иконку сортировки
              className={styles.table}
              rowClassName={(obj) => {
                const length = Object.values(obj).filter(item => !!item?.length).length;
                if(length === 6){
                  return styles.plans
                }else if(length === 7){
                  return styles.going
                }else if(length === 8){
                  return styles.complete
                }
              }}
          />

          <Button onClick={() => {
            setIsOpen(true); // Открываем модальное окно для добавления нового произведения
          }}>{t('add')}</Button>

          <Modal footer={false} open={isOpen} destroyOnClose={true} onCancel={() => {
            setIsOpen(false);
            selectedField.current = null // Сбрасываем выбранное поле
          }} centered> {/* Модальное окно для добавления/редактирования репертуара */}

              <Form layout="vertical" onFinish={handleSubmit} form={form}>
                {columns.slice(0, String(selectedField.current) === 'null' ? 5 : Object.keys(userContext?.repertoire?.[selectedField.current]).length === 5 ? 6 : 7).map((item, index) => {
                  // В этой части кода происходит проверка количества заполненных полей в редактируемом произведении
                  // и в зависимости от этого выбирается количество полей для отображения в форме.
                  if(item.dataIndex === 'asdasd'){ // Проверка поля стадии
                    return (
                      <Form.Item 
                        label={item.title} 
                        rules={[{min: 3, message: t('error1')}, {required: true, message: t('error6')}]} // Правила валидации поля
                        name={item.dataIndex} 
                        key={index} 
                        initialValue={
                          userContext
                          ?.repertoire
                          ?.[selectedField.current]
                          ?.[item.dataIndex] ?? ''
                        }>
                         <Select>
                          {selectFields.map(item => <Select.Option value={item} >{item}</Select.Option>)} // Опции для выбора стадии
                         </Select>
                      </Form.Item>
                    )
                  }else{
                    return (
                      <Form.Item 
                        label={item.title} 
                        rules={[{min: 3, message: t('error1')}, {required: true, message: t('error6')}]} 
                        name={item.dataIndex} 
                        key={index} 
                        initialValue={
                          userContext
                          ?.repertoire
                          ?.[selectedField.current]
                          ?.[item.dataIndex] ?? ''
                        }>
                        <Input/>
                      </Form.Item>
                    )
                  }
                })}

                <Button htmlType="submit">{t('send')}</Button>
              </Form>
          </Modal>
        </Flex>
    )
}

export default Repertoire