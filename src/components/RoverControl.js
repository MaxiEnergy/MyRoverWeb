// src/components/RoverControl.js
import React, { useState } from 'react';
import { sendCommand } from '../bluetooth';

const RoverControl = ({ rover }) => {
  const { characteristic } = rover;
  const [lightOn, setLightOn] = useState(false);

  const handlePointerDown = async (command) => {
    if (!characteristic) return;
    try {
      await sendCommand(characteristic, command);
    } catch (error) {
      console.error('Ошибка отправки команды:', error);
    }
  };

  const handlePointerUp = async () => {
    if (!characteristic) return;
    try {
      await sendCommand(characteristic, 0); // Отправляем команду остановки (0)
    } catch (error) {
      console.error('Ошибка отправки команды:', error);
    }
  };

  const toggleLight = async () => {
    if (!characteristic) return;
    const command = lightOn ? 6 : 3; // Команды для включения и выключения лампочки
    try {
      await sendCommand(characteristic, command);
      setLightOn(!lightOn);
    } catch (error) {
      console.error('Ошибка отправки команды:', error);
    }
  };

  const controlButton = (icon, command, tooltip) => (
    <div className="control-button" title={tooltip}>
      <button
        className="control-button"
        onPointerDown={() => handlePointerDown(command)}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp} // Отправляем команду остановки, если пользователь убрал палец
      >
        <span className="material-icons">{icon}</span>
      </button>
    </div>
  );

  return (
    <div className="rover-control">
      <h1>Управление Ровером {rover.roverNumber}</h1>
      <div className="controls">
        {controlButton('arrow_back', 0x02, 'Left')}
        {controlButton('arrow_upward', 0x04, 'Forward')}
        {controlButton('arrow_forward', 0x01, 'Right')}
        {controlButton('arrow_downward', 0x05, 'Backward')}
      </div>
      <div className="light-control">
        <button className="light-button" onClick={toggleLight}>
          <span className="material-icons">
            {lightOn ? 'lightbulb' : 'lightbulb_outline'}
          </span>
        </button>
      </div>
    </div>
  );
};

export default RoverControl;
