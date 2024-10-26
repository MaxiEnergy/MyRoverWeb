// Функция для поиска доступных устройств с именем "Rover Toy XXX" или "Yandex Delivery Robot"
export async function findRovers() {
    if (!navigator.bluetooth) {
      console.error("Web Bluetooth API не поддерживается в этом браузере.");
      return null;
    }
  
    // Генерация массива UUID от 0001 до 0999 для Rover Toy
    const serviceUUIDs = [];
    for (let i = 1; i <= 999; i++) {
      const paddedNumber = i.toString().padStart(4, '0');
      serviceUUIDs.push(`0000170d-${paddedNumber}-1000-8000-00805f9b34fb`);
    }
  
    // Добавляем статические UUID для "Yandex Delivery Robot"
    serviceUUIDs.push("0000170d-0000-1000-8000-00805f9b34fb");
  
    try {
      // Добавляем все сгенерированные UUID в optionalServices
      const device = await navigator.bluetooth.requestDevice({
        filters: [
          { namePrefix: 'Rover Toy ' },
          { name: 'Yandex Delivery Robot' }
        ],
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
      let serviceUUID, characteristicUUID;
  
      if (device.name.startsWith("Rover Toy")) {
        const roverNumber = device.name.split(' ')[2]; // Извлекаем номер ровера из имени
  
        // Формируем динамические UUID для Rover Toy и приводим их к нижнему регистру
        serviceUUID = `0000170d-${roverNumber.padStart(4, '0')}-1000-8000-00805f9b34fb`.toLowerCase();
        characteristicUUID = `00002a60-${roverNumber.padStart(4, '0')}-1000-8000-00805f9b34fb`.toLowerCase();
      } else if (device.name === "Yandex Delivery Robot") {
        // Статические UUID для Yandex Delivery Robot
        serviceUUID = "0000170d-0000-1000-8000-00805f9b34fb";
        characteristicUUID = "00002a60-0000-1000-8000-00805f9b34fb";
      } else {
        console.error("Неизвестное устройство");
        return null;
      }
  
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
  