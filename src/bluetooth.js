// src/bluetooth.js

// Функция для поиска доступных устройств с именем "Rover Toy XXX"
export async function findRovers() {
    if (!navigator.bluetooth) {
      console.error("Web Bluetooth API не поддерживается в этом браузере.");
      return null;
    }
  
    // Генерация массива UUID от 0001 до 0999
    const serviceUUIDs = [];
    for (let i = 1; i <= 999; i++) {
      const paddedNumber = i.toString().padStart(4, '0'); // Пример: '0001', '0002', ..., '0999'
      serviceUUIDs.push(`0000170d-${paddedNumber}-1000-8000-00805f9b34fb`);
    }
  
    try {
      // Добавляем все сгенерированные UUID в optionalServices
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ namePrefix: 'Rover Toy ' }],
        optionalServices: serviceUUIDs
      });
  
      return device;
    } catch (error) {
      console.error("Ошибка при поиске устройств: ", error);
      return null;
    }
  }
  
  // Функция для подключения к устройству
  export async function connectToRover(device) {
    try {
      const roverNumber = device.name.split(' ')[2]; // Извлекаем номер ровера из имени
  
      // Формируем динамические UUID и приводим их к нижнему регистру
      const serviceUUID = `0000170d-${roverNumber.padStart(4, '0')}-1000-8000-00805f9b34fb`.toLowerCase();
      const characteristicUUID = `00002a60-${roverNumber.padStart(4, '0')}-1000-8000-00805f9b34fb`.toLowerCase();
  
      // Подключаемся к GATT серверу устройства
      const server = await device.gatt.connect();
      // Получаем доступ к нужному сервису
      const service = await server.getPrimaryService(serviceUUID);
  
      // Получаем характеристику
      const characteristic = await service.getCharacteristic(characteristicUUID);
  
      return { device, characteristic };
    } catch (error) {
      console.error("Ошибка подключения к устройству: ", error);
      return null;
    }
  }
  
  // Функция для отправки команды на устройство
  export async function sendCommand(characteristic, command) {
    const commandArray = new Uint8Array([command]);
    await characteristic.writeValue(commandArray);
  }
  