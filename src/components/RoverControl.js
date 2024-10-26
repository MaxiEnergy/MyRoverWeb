import React from 'react';
import { sendCommand } from '../bluetooth';

const RoverControl = ({ rover }) => {
  const { device, characteristic } = rover;

  const handleCommand = async (command) => {
    if (characteristic) {
      await sendCommand(characteristic, command);
    }
  };

  return (
    <div className="rover-control">
      <h1>Управление Ровером {rover.roverNumber}</h1>
      <div className="controls">
        <button
          onPointerDown={() => handleCommand(0x01)}
          onPointerUp={() => handleCommand(0)}
        >
          Влево
        </button>
        <button
          onPointerDown={() => handleCommand(0x02)}
          onPointerUp={() => handleCommand(0)}
        >
          Вправо
        </button>
        <button
          onPointerDown={() => handleCommand(0x04)}
          onPointerUp={() => handleCommand(0)}
        >
          Вперед
        </button>
        <button
          onPointerDown={() => handleCommand(0x05)}
          onPointerUp={() => handleCommand(0)}
        >
          Назад
        </button>
      </div>
    </div>
  );
};

export default RoverControl;
