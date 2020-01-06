import React, { useState } from "react";
import "./App.css";
import { Tangram } from "./Tangram";
import { Galery } from "./Galery";

function App() {
  const [galery, setGalery] = useState([]);
  const [selectedImageDataUrl, setSelectedImageDataUrl] = useState();

  const handleSave = imageDataUrl => {
    setGalery([...galery, imageDataUrl]);
  };
  const handleSelect = imageDataUrl => {
    setSelectedImageDataUrl(imageDataUrl);
  };
  return (
    <div className="app">
      <p id="statusEl">Running</p>
      <Tangram
        onSave={handleSave}
        patternImageDataUrl={selectedImageDataUrl}
      ></Tangram>
      <Galery galery={galery} onSelect={handleSelect}></Galery>
    </div>
  );
}

export default App;
