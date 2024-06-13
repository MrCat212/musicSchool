import { t } from "i18next";

export const formatWeekDataFromUser = (user) => {
  if (user.length === 0) {
    return [];
  }

  if (!user?.calendar) {
    return [];
  }
  const lastMonth = user.calendar.length - 1;

  const data = user.calendar[lastMonth].map((item) => {
    return item.reduce(
      (acc, activity) => ({
        ...acc,
        [activity.learnedTool]: (acc[activity.learnedTool] ?? 0) + 1,
      }),
      {}
    );
  });

  const length = 7 - data.length;
  if (length) {
    for (let i = 0; i <= length; i++) {
      data.push({});
    }
  }
  return data;
};

export const formatMonthDataFromUser = (user) => {
  if (user.length === 0) {
    return [];
  }

  if (!user?.calendar) {
    return [];
  }
  const lastMonth = user.calendar.length - 1;

  const data = user.calendar[lastMonth].map((item) => {
    return item.reduce(
      (acc, activity) => ({
        ...acc,
        [activity.learnedTool]: (acc[activity.learnedTool] ?? 0) + 1,
      }),
      {}
    );
  });

  const length = 30 - data.length;
  if (length) {
    for (let i = 0; i <= length; i++) {
      data.push({});
    }
  }
  return data;
};

export const formatYearDataFromUser = (user) => {
  if (user.length === 0) {
    return [];
  }

  if (!user?.calendar) {
    return [];
  }

  const months = [
    t("jan"),
    t("feb"),
    t("mar"),
    t("apr"),
    t("may"),
    t("jun"),
    t("jul"),
    t("aug"),
    t("sep"),
    t("oct"),
    t("nov"),
    t("dec"),
  ];

  // return [0,1,2,3,4,5,6,7].map((item, index) => {
  //     return ({
  //         ['' + item]: item + 1 + Math.round(Math.random() * 10)
  //     })
  // })

  const data = user.calendar.map((item, index) => {
    return {
      [months[index]]: item.filter((day) => day.length).length,
      name: months[index],
    };
  });

  const length = 11 - data.length;
  if (length) {
    for (let i = 0; i <= length; i++) {
      data.push({});
    }
  }
  return data;
};
