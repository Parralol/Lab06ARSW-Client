import { useRef, useEffect, useState } from 'react';
import p5 from 'p5';

function App() {
  const [points, setPoints] = useState([]);
  const containerRef = useRef(null);
  const p5Instance = useRef(null);

  useEffect(() => {
    const intervalId = setInterval(fetchPoints, 1000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const sketch = (p) => {
      p.setup = function () {
        p.createCanvas(700, 410);
        p.background(255);
      }

      p.draw = async function () {
        p.background(255);

        if (p.mouseIsPressed) {
          p.fill(0);
          p.ellipse(p.mouseX, p.mouseY, 20, 20);
          try {
            const response = await fetch(`http://localhost:8080/setpoints?xval=${p.mouseX}&yval=${p.mouseY}`, {
              method: 'GET',
              mode: 'cors'
            });
            if (response.ok) {
              console.log(`Point sent: (${p.mouseX}, ${p.mouseY})`);
            } else {
              console.error('Failed to send point');
            }
          } catch (error) {
            console.error('Error sending point:', error);
          }
        }

        points.forEach(point => {
          p.fill(0);
          p.ellipse(point.x, point.y, 20, 20);
        });
      }
    };

    if (!p5Instance.current) {
      p5Instance.current = new p5(sketch, containerRef.current);
    }

    return () => {
      if (p5Instance.current) {
        p5Instance.current.remove();
        p5Instance.current = null;
      }
    };
  }, [points]);

  const fetchPoints = async () => {
    try {
      const response = await fetch('http://localhost:8080/getpoints', {
        method: 'GET',
        mode: 'cors'
      });
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched points:', data);
        setPoints(data);
      } else {
        console.error('Failed to fetch points');
      }
    } catch (error) {
      console.error('Error fetching points:', error);
    }
  };

  return (
    <div>
      <hr />
      <div id="container" ref={containerRef}></div>
      <hr />
    </div>
  );
}

export default App;