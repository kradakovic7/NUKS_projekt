import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './index.css';

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
