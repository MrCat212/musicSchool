import { useState, useEffect } from 'react';

const useScreenSize = (listenWidth, listenHeight) => {
  const [screenSize, setScreenSize] = useState({ // Определяем состояние screenSize с начальными значениями ширины и высоты окна браузера
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => { // Используем хук useEffect для выполнения побочных эффектов
    const handleResize = () => {  // Проверяем условия: если высота окна меньше listenHeight (или listenHeight отсутствует), 
                                  // или ширина окна меньше listenWidth, или оба аргумента отсутствуют
      if(
        window.innerHeight < 
        (listenHeight ?? 0) ||  // Проверяем высоту окна
        window.innerWidth < 
        listenWidth || // Проверяем ширину окна
        (!listenHeight && !listenWidth) // Проверяем отсутствие аргументов
      ){
        setScreenSize({ // Обновляем состояние screenSize новыми значениями ширины и высоты окна
          width: window.innerWidth,
          height: window.innerHeight,
        });
      }
    };

    window.addEventListener('resize', handleResize); // Добавляем обработчик события resize к объекту window

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [listenHeight, listenWidth]); // Хук useEffect зависит от listenHeight и listenWidth

  return screenSize; // Возвращаем текущее состояние screenSize
};

export default useScreenSize; // Экспортируем хук useScreenSize по умолчанию