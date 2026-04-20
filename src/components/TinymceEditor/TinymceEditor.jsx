import React, { useState } from 'react';

const TinymceEditor = ({ initialvalue = '' }) => {
  const [value, setValue] = useState(initialvalue);

  return (
    <textarea
      className="form-control"
      style={{ minHeight: 320 }}
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
};

export default TinymceEditor;
