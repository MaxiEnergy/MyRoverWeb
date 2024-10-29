import React, { useState, useEffect } from 'react';
import { sendCommand } from '../bluetooth';

const RoverControl = ({ rover }) => {
  const { characteristic } = rover;
  const [lightOn, setLightOn] = useState(false);
  const [bubbleDirection, setBubbleDirection] = useState({ x: 0, y: -1 }); // По умолчанию вверх
  const [bubbleSpeedMultiplier, setBubbleSpeedMultiplier] = useState(1);

  useEffect(() => {
    // Настройка анимации пузырьков
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
        // Обновляем координаты в зависимости от направления и скорости
        bubble.x += bubbleDirection.x * bubble.speed * bubbleSpeedMultiplier;
        bubble.y += bubbleDirection.y * bubble.speed * bubbleSpeedMultiplier;

        // Зацикливание движения пузырьков
        if (bubble.y < -bubble.radius) bubble.y = canvas.height + bubble.radius;
        if (bubble.y > canvas.height + bubble.radius) bubble.y = -bubble.radius;
        if (bubble.x < -bubble.radius) bubble.x = canvas.width + bubble.radius;
        if (bubble.x > canvas.width + bubble.radius) bubble.x = -bubble.radius;

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
  }, [bubbleDirection, bubbleSpeedMultiplier]);

  const handlePointerDown = async (command) => {
    if (!characteristic) {
      console.error('Характеристика не найдена');
      return;
    }
    try {
      await sendCommand(characteristic, command);
    } catch (error) {
      console.error('Ошибка отправки команды:', error);
    }

    // Устанавливаем направление пузырьков в зависимости от команды
    switch (command) {
      case 0x04: // Forward
        setBubbleDirection({ x: 0, y: -1 });
        setBubbleSpeedMultiplier(3);
        break;
      case 0x05: // Backward
        setBubbleDirection({ x: 0, y: 1 });
        setBubbleSpeedMultiplier(1);
        break;
      case 0x02: // Left
        setBubbleDirection({ x: -1, y: 0 });
        setBubbleSpeedMultiplier(1);
        break;
      case 0x01: // Right
        setBubbleDirection({ x: 1, y: 0 });
        setBubbleSpeedMultiplier(1);
        break;
      default:
        setBubbleSpeedMultiplier(1);
        break;
    }
  };

  const handlePointerUp = async () => {
    if (!characteristic) {
      console.error('Характеристика не найдена');
      return;
    }
    try {
      await sendCommand(characteristic, 0);
    } catch (error) {
      console.error('Ошибка отправки команды:', error);
    }

    // Сбрасываем скорость пузырьков на стандартную
    setBubbleSpeedMultiplier(1);
  };

  const toggleLight = async () => {
    if (!characteristic) {
      console.error('Характеристика не найдена');
      return;
    }
    const command = lightOn ? 6 : 3;
    try {
      await sendCommand(characteristic, command);
      setLightOn(!lightOn);
    } catch (error) {
      console.error('Ошибка отправки команды:', error);
    }
  };

  const controlButton = (icon, command, tooltip) => (
    <button
      className="control-button"
      title={tooltip}
      onPointerDown={() => handlePointerDown(command)}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      <span className="material-icons">{icon}</span>
    </button>
  );

  return (
    <div className="rover-control">
      <canvas id="bubbles-canvas"></canvas>
      <div className="controls-container">
        <h1 className="rover-title">Управление Ровером {rover.roverNumber}</h1>
        <div className="controls-grid">
          <div style={{ gridColumn: "2 / 4", gridRow: "1" }}>
            {controlButton('arrow_upward', 0x04, 'Forward')}
          </div>
          <div style={{ gridColumn: "1", gridRow: "2" }}>
            {controlButton('arrow_back', 0x02, 'Left')}
          </div>
          <div style={{ gridColumn: "4", gridRow: "2" }}>
            {controlButton('arrow_forward', 0x01, 'Right')}
          </div>
          <div style={{ gridColumn: "2 / 4", gridRow: "3" }}>
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
      </div>
    </div>
  );
};

export default RoverControl;
