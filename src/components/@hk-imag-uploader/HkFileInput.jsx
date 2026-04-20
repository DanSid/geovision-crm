import React, { useMemo, useState } from 'react';
import { Image, Row, Col } from 'react-bootstrap';

const HkFileInput = ({ children, className = '' }) => {
  const [file, setFile] = useState(null);
  const preview = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);

  return (
    <label className={`dropzone ${className}`} style={{ cursor: 'pointer' }}>
      <input
        type="file"
        accept="image/*"
        className="d-none"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />
      {file && preview ? (
        <div className="dz-preview dz-file-preview">
          <Image src={preview} alt={file.name} fluid roundedCircle />
        </div>
      ) : (
        <span className="dz-default dz-message">
          <Row className="text-muted mb-2"><Col /></Row>
          <Row><Col>{children || 'Select image'}</Col></Row>
        </span>
      )}
    </label>
  );
};

export default HkFileInput;
