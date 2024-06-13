import { Tabs } from 'antd';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import useScreenSize from '../../hooks/useScreenSize';
import {
  formatMonthDataFromUser,
  formatWeekDataFromUser,
  formatYearDataFromUser,
} from '../../utils/formatDataForCharts';
import { randomHexColor } from '../../utils/default';
import { useContext } from 'react';
import { UserContext } from '../../App';

import styles from './UserStats.module.css';
import { useTranslation } from 'react-i18next';
import { t } from 'i18next';

export const UserStats = () => {
  const { userContext } = useContext(UserContext);
  const screenSize = useScreenSize(700);
  const chartData = formatWeekDataFromUser(userContext ?? []);
  const { t } = useTranslation();

  const monthChartData = formatMonthDataFromUser(userContext ?? []);

  const monthDataKeys = monthChartData
    ?.reduce((acc, item) => [...acc, ...Object.keys(item)], [])
    ?.reduce((acc, item) => (acc.includes(item) ? acc : [...acc, item]), []);

  const chartDataKeys = chartData
    ?.reduce((acc, item) => [...acc, ...Object.keys(item)], [])
    ?.reduce((acc, item) => (acc.includes(item) ? acc : [...acc, item]), []);

  const yearData = formatYearDataFromUser(userContext ?? []);

  const tabsItems = [ // Определяем элементы для вкладок
    {
      key: 'part-1', // Ключ для первой вкладки
      label: t('week'),
      children: (
        <div className={styles.chart}>
          <BarChart
            width={screenSize.width > 700 ? 800 : 400}
            height={500}
            data={chartData.slice(-7)} // Данные для графика (последние 7 дней)
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 30,
            }}
          >
            <CartesianGrid strokeDasharray='1 1' />
            <XAxis tickFormatter={(a) => customDayXAxis(a, chartData)} />
            <YAxis tickFormatter={(num) => (num === 1 ? t('active') : '')} />
            {chartDataKeys.map((item, index) => {
              return (
                <Bar
                  key={index}
                  dataKey={item}
                  stackId={index}
                  fill={randomHexColor()}
                  maxBarSize={50}
                />
              );
            })}
          </BarChart>
          <h3>
            {t('percentage')}{' '}
            {Math.round( // Рассчитываем процент активных дней за неделю
              (chartData.slice(-7).filter((item) => 'undefined' in item)
                .length *
                100) /
                7
            )}
            %
          </h3>
        </div>
      ),
    },
    {
      key: 'part-2', // Ключ для второй вкладки
      label: t('month'),
      children: (
        <div className={styles.chart}>
          <BarChart
            width={screenSize.width > 700 ? 800 : 400}
            height={500}
            data={monthChartData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 30,
            }}
          >
            <CartesianGrid strokeDasharray='3 3' />
            <XAxis tickFormatter={customMonthXAxis} />
            <YAxis tickFormatter={(num) => (num === 1 ? t('active') : '')} />
            {monthDataKeys.map((item, index) => {
              return (
                <Bar
                  key={index}
                  dataKey={item}
                  stackId={index}
                  fill={randomHexColor()}
                />
              );
            })}
          </BarChart>
          <h3>
            В этом месяце процент активных дней у вас составляет:{' '}
            {Math.round(
              (chartData.filter((item) => 'undefined' in item).length * 100) /
                31
            )}
            %
          </h3>
        </div>
      ),
    },
    {
      key: 'part-3', // Ключ для третьей вкладки
      label: t('year'),
      children: (
        <div className={styles.chart}>
          <BarChart
            width={screenSize.width > 700 ? 800 : 400}
            height={500}
            data={yearData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 30,
            }}
          >
            <CartesianGrid strokeDasharray='3 3' />
            <XAxis tickFormatter={customYearXAxis} />
            <YAxis />
            {yearData.map((_, index) => {
              return (
                <Bar
                  key={index}
                  dataKey={_.name}
                  fill={randomHexColor()}
                  barSize='1000000000000000000'
                  min={100}
                />
              );
            })}
          </BarChart>
        </div>
      ),
    },
  ];

  return (
    <>
      <Tabs direction='horizontal' className={styles.tabs} items={tabsItems} /> {/* Возвращаем компоненты вкладок */}
    </>
  );
};

const customDayXAxis = (rest, chartData) => { // Функция для пользовательского форматирования меток оси X для недельного графика
  const length = chartData?.length - 6; // Получаем длину данных минус 6 (для последних 7 дней)
  const dayNames = [ // Названия дней недели
    t('tu'),
    t('we'),
    t('th'),
    t('fr'),
    t('sa'),
    t('su'),
    t('mo'),
  ];
  const day = new Date( // Получаем день недели для заданной даты
    `${new Date().getMonth()}/${rest + length}/${new Date().getFullYear()}`
  ).getDay();
  return dayNames[day]; // Возвращаем соответствующее название дня недели
};

const customMonthXAxis = (rest) => {
  const dayNames = [ 
    t('tu'),
    t('we'),
    t('th'),
    t('fr'),
    t('sa'),
    t('su'),
    t('mo'),
  ];
  // eslint-disable-next-line
  return (
    dayNames[new Date(`${new Date().getMonth()}/${rest}/2024`).getDay()] + // Возвращаем название дня недели и дату
    ' ' +
    '(' +
    (rest === 0 ? 31 : rest) +
    ')'
  );
};

const customYearXAxis = (rest) => {
  const months = [
    t('jan'),
    t('feb'),
    t('mar'),
    t('apr'),
    t('may'),
    t('jun'),
    t('jul'),
    t('aug'),
    t('sep'),
    t('oct'),
    t('nov'),
    t('dec'),
  ];
  return months[rest]; // Возвращаем соответствующее название месяца
};
