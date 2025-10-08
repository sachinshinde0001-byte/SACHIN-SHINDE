import React, { useEffect, useState, useMemo } from 'react';

const ConfettiPiece: React.FC<{ style: React.CSSProperties }> = ({ style }) => (
  <div className="absolute w-2 h-4" style={style}></div>
);

export const Confetti: React.FC = () => {
  const pieces = useMemo(() => {
    return Array.from({ length: 150 }).map((_, index) => {
      const style: React.CSSProperties = {
        left: `${Math.random() * 100}%`,
        top: `${-20 - Math.random() * 100}%`,
        backgroundColor: `hsl(${Math.random() * 360}, 70%, 50%)`,
        transform: `rotate(${Math.random() * 360}deg)`,
        animation: `fall ${3 + Math.random() * 4}s linear ${Math.random() * 2}s forwards`,
      };
      return <ConfettiPiece key={index} style={style} />;
    });
  }, []);

  useEffect(() => {
    // Keyframes need to be injected into the document head
    const styleSheet = document.createElement("style");
    styleSheet.innerText = `
      @keyframes fall {
        to {
          top: 120%;
          transform: rotate(${Math.random() * 720}deg);
        }
      }
    `;
    document.head.appendChild(styleSheet);
    
    return () => {
        if (document.head.contains(styleSheet)) {
            document.head.removeChild(styleSheet);
        }
    }

  }, []);

  return <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-50 overflow-hidden">{pieces}</div>;
};
