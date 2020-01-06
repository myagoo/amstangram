import React, { useState } from "react";
import "./Galery.scss";

export const Galery = ({ galery, onSelect }) => {
  const [opened, setOpened] = useState(false);
  return (
    <div className="drawer" style={{ top: opened ? 0 : -180 }}>
      <div className="galery">
        {galery.map((imageDataUrl, index) => (
          <div
            key={imageDataUrl}
            className="card"
            onClick={() => onSelect(imageDataUrl)}
          >
            <span>Square</span>
            <div
              className="image"
              style={{ backgroundImage: `url(${imageDataUrl})` }}
            ></div>
            <span>By myagoo</span>
          </div>
        ))}
      </div>

      <div className="handle" onClick={() => setOpened(!opened)}>
        Toggle gallery
      </div>
    </div>
  );
};
