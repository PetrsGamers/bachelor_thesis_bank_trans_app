import React from 'react';

/*
This function creates a color rectangle next to the graph for better understanding of the colors in graph.
*/
function ColorBoxText({ text, color }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <div style={{ width: 20, height: 20, backgroundColor: color, marginRight: 10 }}></div>
      <span><b>{text} :</b></span>
    </div>
  );
}

export default ColorBoxText;