import React, { useState } from "react";
import "./App.css";
import { Tangram } from "./Tangram";
import { Galery } from "./Galery";

function App() {
  const [galery, setGalery] = useState([]);

  const handleSave = imageDataUrl => {
    setGalery([...galery, imageDataUrl]);
  };

  return (
    <div className="app">
      <Galery galery={galery}></Galery>
      <Tangram onSave={handleSave}></Tangram>
    </div>
  );
}

export default App;
