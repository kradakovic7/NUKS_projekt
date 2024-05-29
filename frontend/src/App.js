import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [files, setFiles] = useState([]);
  const [file, setFile] = useState(null);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const res = await axios.get('http://localhost:5000/files');
      setFiles(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleFileUpload = async () => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      await axios.post('http://localhost:5000/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      fetchFiles();
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/files/${id}`);
      fetchFiles();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="App">
      <h1>Simple File Uploader</h1>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleFileUpload}>Upload</button>
      <h2>Uploaded Files</h2>
      <ul>
        {files.map((file) => (
          <li key={file.id}>
            {file.name}
            <button onClick={() => handleFileDelete(file.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
