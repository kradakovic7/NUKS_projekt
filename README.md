# SimpleToDoApp

## Description
A simple to-do application with a React frontend and Express backend. This application allows users to add, delete, edit, and toggle the completion status of tasks.

## Setup

### Docker
1. Make sure you have Docker and Docker Compose installed on your machine.
2. Navigate to the root directory of the project.
3. Create a `backend/init.sql` file with the following content to initialize the database:

    ```sql
    CREATE TABLE IF NOT EXISTS todos (
        id SERIAL PRIMARY KEY,
        task VARCHAR(255) NOT NULL,
        completed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    ```

4. Ensure your `docker-compose.yml` file is set up correctly to include the volume mount for the SQL script:

    ```yaml
    version: '3'
    services:
      db:
        image: postgres
        environment:
          POSTGRES_USER: user
          POSTGRES_PASSWORD: password
          POSTGRES_DB: todoapp
        volumes:
          - ./backend/init.sql:/docker-entrypoint-initdb.d/init.sql
        ports:
          - "5432:5432"
      backend:
        build: ./backend
        volumes:
          - ./backend:/usr/src/app
        ports:
          - "5000:5000"
        depends_on:
          - db
        environment:
          POSTGRES_USER: user
          POSTGRES_PASSWORD: password
          POSTGRES_DB: todoapp
          POSTGRES_HOST: db
      frontend:
        build: ./frontend
        volumes:
          - ./frontend:/usr/src/app
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

### POST /todos
- Add a new task.
- **Request:** JSON object
  - `task`: The task to be added.
- **Response:** JSON object containing the added task details.

### GET /todos
- Retrieve a list of tasks.
- **Response:** JSON array of task objects.

### DELETE /todos/:id
- Delete a task by ID.
- **Request Parameter:**
  - `id`: The ID of the task to be deleted.
- **Response:** JSON object containing the deleted task details.

### PUT /todos/:id
- Update a task by ID.
- **Request Parameter:**
  - `id`: The ID of the task to be updated.
- **Request Body:**
  - `task`: The updated task description.
  - `completed`: The new completion status of the task.
- **Response:** JSON object containing the updated task details.

## Testing the Application

1. **Open your application at `http://localhost:3000`.**
2. **Add a task:**
   - Use the input field to enter a new task.
   - Click the add button.
   - The task should be added and appear in the list below.
3. **Edit a task:**
   - Click the edit button next to the task you want to edit.
   - Update the task description in the input field.
   - Click the update button.
   - The task should be updated in the list.
4. **Delete a task:**
   - Click the delete button next to the task you want to delete.
   - The task should be removed from the list.
5. **Toggle a task:**
   - Click on the task text to toggle its completion status.
   - The task text should be struck through if completed and normal if not.

### Frontend Code

**`frontend/src/App.js`**

```javascript
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
    const [todos, setTodos] = useState([]);
    const [task, setTask] = useState('');
    const [editTaskId, setEditTaskId] = useState(null);
    const [editTask, setEditTask] = useState('');

    useEffect(() => {
        fetchTodos();
    }, []);

    const fetchTodos = async () => {
        try {
            const res = await axios.get('http://localhost:5000/todos');
            setTodos(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleTaskChange = (e) => {
        setTask(e.target.value);
    };

    const handleTaskSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editTaskId) {
                await axios.put(`http://localhost:5000/todos/${editTaskId}`, { task: editTask, completed: false });
                setEditTaskId(null);
                setEditTask('');
            } else {
                await axios.post('http://localhost:5000/todos', { task });
            }
            fetchTodos();
            setTask('');
        } catch (err) {
            console.error(err);
        }
    };

    const handleEditChange = (e) => {
        setEditTask(e.target.value);
    };

    const handleTaskDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/todos/${id}`);
            fetchTodos();
        } catch (err) {
            console.error(err);
        }
    };

    const handleTaskToggle = async (id, completed) => {
        try {
            await axios.put(`http://localhost:5000/todos/${id}`, { completed });
            fetchTodos();
        } catch (err) {
            console.error(err);
        }
    };

    const handleTaskEdit = (id, task) => {
        setEditTaskId(id);
        setEditTask(task);
    };

    return (
        <div className="App">
            <h1>Simple To-Do App</h1>
            <form onSubmit={handleTaskSubmit}>
                <input
                    type="text"
                    value={editTaskId ? editTask : task}
                    onChange={editTaskId ? handleEditChange : handleTaskChange}
                    placeholder="Enter a new task"
                />
                <button type="submit">{editTaskId ? 'Update Task' : 'Add Task'}</button>
            </form>
            <h2>To-Do List</h2>
            <ul>
                {todos.map((todo) => (
                    <li key={todo.id}>
                        <span
                            style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}
                            onClick={() => handleTaskToggle(todo.id, !todo.completed)}
                        >
                            {todo.task}
                        </span>
                        <button onClick={() => handleTaskEdit(todo.id, todo.task)}>Edit</button>
                        <button onClick={() => handleTaskDelete(todo.id)}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default App;
