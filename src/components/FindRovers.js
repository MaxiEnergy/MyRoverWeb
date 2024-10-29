import React, { useState, useEffect } from 'react';
import { findRovers, connectToRover } from '../bluetooth';
import RoverControl from './RoverControl';

const FindRovers = () => {
  const [rovers, setRovers] = useState([]);
  const [connected, setConnected] = useState(false);
  const [selectedRover, setSelectedRover] = useState(null);

  useEffect(() => {
    const canvas = document.getElementById('bubbles-canvas');
    const ctx = canvas.getContext('2d');
    let bubbles = [];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createBubbles = () => {
      const count = 60;
      bubbles = [];
      for (let i = 0; i < count; i++) {
        bubbles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 10 + 5,
          speed: Math.random() * 2 + 0.5,
          opacity: Math.random() * 0.3 + 0.2
        });
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      bubbles.forEach(bubble => {
        bubble.y -= bubble.speed;
        if (bubble.y < -bubble.radius) {
          bubble.y = canvas.height + bubble.radius;
          bubble.x = Math.random() * canvas.width;
        }
        ctx.beginPath();
        ctx.arc(bubble.x, bubble.y, bubble.radius, 0, 2 * Math.PI);
        ctx.fillStyle = `rgba(255, 182, 193, ${bubble.opacity})`; // Цвета пастельных оттенков
        ctx.fill();
      });
      requestAnimationFrame(animate);
    };

    resizeCanvas();
    createBubbles();
    animate();

    window.addEventListener('resize', resizeCanvas);
    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

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
      setSelectedRover({ ...rover, characteristic: connection.characteristic });
      setConnected(true);
    }
  };

  if (connected && selectedRover) {
    return <RoverControl rover={selectedRover} />;
  }

  return (
    <div className="find-rovers">
      <canvas id="bubbles-canvas"></canvas>
      <button onClick={handleFindRovers}>Найти ровер</button>
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
    </div>
  );
};

export default FindRovers;
