import React from "react";
import "./Galery.scss";
export const Galery = ({ galery }) => {
  return (
    <div className="galery">
      {galery.map(imageDataUrl => (
        <div
          key={imageDataUrl}
          className="image"
          style={{ backgroundImage: `url(${imageDataUrl})` }}
        ></div>
      ))}
    </div>
  );
};
