// Функция для поиска доступных устройств с именем "Rover Toy XXX" или "Yandex Delivery Robot"
export async function findRovers() {
    if (!navigator.bluetooth) {
      console.error("Web Bluetooth API не поддерживается в этом браузере.");
      return null;
    }
  
    const serviceUUIDs = [];
    for (let i = 1; i <= 999; i++) {
      const paddedNumber = i.toString().padStart(4, '0');
      serviceUUIDs.push(`0000170d-${paddedNumber}-1000-8000-00805f9b34fb`.toLowerCase());
    }
    serviceUUIDs.push("0000170d-0000-1000-8000-00805f9b34fb".toLowerCase());
  
    try {
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
  
  export async function connectToRover(device) {
    try {
      let serviceUUID, characteristicUUID;
  
      if (device.name.startsWith("Rover Toy")) {
        const roverNumber = device.name.split(' ')[2];
        serviceUUID = `0000170d-${roverNumber.padStart(4, '0')}-1000-8000-00805f9b34fb`.toLowerCase();
        characteristicUUID = `00002a60-${roverNumber.padStart(4, '0')}-1000-8000-00805f9b34fb`.toLowerCase();
      } else if (device.name === "Yandex Delivery Robot") {
        serviceUUID = "0000170d-0000-1000-8000-00805f9b34fb".toLowerCase();
        characteristicUUID = "00002a60-0000-1000-8000-00805f9b34fb".toLowerCase();
      } else {
        console.error("Неизвестное устройство");
        return null;
      }
  
      const server = await device.gatt.connect();
      await new Promise(resolve => setTimeout(resolve, 500));
  
      console.log('Подключились к устройству:', device.name);
      console.log('Используемый UUID сервиса:', serviceUUID);
      console.log('Используемый UUID характеристики:', characteristicUUID);
  
      const service = await server.getPrimaryService(serviceUUID);
      const characteristics = await service.getCharacteristics();
      const characteristic = characteristics.find(char => char.uuid.toLowerCase() === characteristicUUID.toLowerCase());
      if (!characteristic) {
        console.error('Характеристика с указанным UUID не найдена.');
        return null;
      }
  
      return { device, characteristic };
    } catch (error) {
      console.error("Ошибка подключения к устройству: ", error);
      return null;
    }
  }
  
  export async function sendCommand(characteristic, command) {
    const commandArray = new Uint8Array([command]);
    try {
      if (characteristic.properties.write) {
        await characteristic.writeValue(commandArray);
      } else if (characteristic.properties.writeWithoutResponse) {
        await characteristic.writeValueWithoutResponse(commandArray);
      } else {
        console.error('Характеристика не поддерживает запись.');
      }
    } catch (error) {
      console.error('Ошибка отправки команды:', error);
    }
  }
  