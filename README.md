# SimpleFileUploader

## Description
A simple file uploader application with a React frontend and Express backend. This application allows users to upload and delete files.

## Setup

### Docker
1. Make sure you have Docker and Docker Compose installed on your machine.
2. Navigate to the root directory of the project.
3. Create a `backend/init.sql` file with the following content to initialize the database:

    ```sql
    CREATE TABLE IF NOT EXISTS files (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        data BYTEA NOT NULL,
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    ```

4. Update your `docker-compose.yml` file to include the volume mount for the SQL script:

    ```yaml
    version: '3'
    services:
      backend:
        build: ./backend
        ports:
          - "5000:5000"
        depends_on:
          - db
        environment:
          POSTGRES_USER: your_username
          POSTGRES_PASSWORD: your_password
          POSTGRES_DB: your_database
          POSTGRES_HOST: db

      db:
        image: postgres
        restart: always
        environment:
          POSTGRES_USER: your_username
          POSTGRES_PASSWORD: your_password
          POSTGRES_DB: your_database
        ports:
          - "5432:5432"
        volumes:
          - ./backend/init.sql:/docker-entrypoint-initdb.d/init.sql

      frontend:
        build: ./frontend
        ports:
          - "3000:3000"
        depends_on:
          - backend
    ```

5. Run `sudo docker-compose up --build` to build and start the containers.

### Access the Application
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000`

## API Endpoints

### POST /upload
- Upload a file.
- **Request:** `multipart/form-data`
  - `file`: The file to be uploaded.
- **Response:** JSON object containing the uploaded file details.

### GET /files
- Retrieve a list of uploaded files.
- **Response:** JSON array of file objects.

### DELETE /files/:id
- Delete a file by ID.
- **Request Parameter:**
  - `id`: The ID of the file to be deleted.
- **Response:** JSON object containing the deleted file details.

## Testing the Application

1. **Open your application at `http://localhost:3000`.**
2. **Upload a file:**
   - Use the file input field to select a file.
   - Click the upload button.
   - The file should be uploaded and appear in the list below.
3. **Delete a file:**
   - Click the delete button next to the file you want to delete.
   - The file should be removed from the list.

### Frontend Code

**`frontend/src/App.js`**

```javascript
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
