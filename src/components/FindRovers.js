// src/components/FindRovers.js
import React, { useState } from 'react';
import { findRovers, connectToRover } from '../bluetooth';
import RoverControl from './RoverControl'; // Импортируем компонент для управления

const FindRovers = () => {
  const [rovers, setRovers] = useState([]);
  const [connected, setConnected] = useState(false);
  const [selectedRover, setSelectedRover] = useState(null);

  const handleFindRovers = async () => {
    const device = await findRovers();
    if (device) {
      const roverNumber = device.name.split(' ')[2];
      setRovers([{ device, roverNumber }]);
    } else {
      setRovers([]);
    }
  };

  const handleConnect = async (rover) => {
    const connection = await connectToRover(rover.device);
    if (connection) {
      setSelectedRover(rover);
      setConnected(true);
    }
  };

  if (connected && selectedRover) {
    return <RoverControl rover={selectedRover} />;
  }

  return (
    <div className="find-rovers">
      <button onClick={handleFindRovers}>Найти ровер</button>
      {rovers.length === 0 ? (
        <p>Не могу найти ровер</p>
      ) : (
        <div className="rovers-list">
          {rovers.map((rover, index) => (
            <div
              key={index}
              className="rover-item"
              onClick={() => handleConnect(rover)}
            >
              Ровер {rover.roverNumber}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FindRovers;
