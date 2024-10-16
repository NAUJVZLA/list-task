"use client"

// Importamos React y algunos hooks como useState, useEffect y useCallback
import React, { useState, useEffect, useCallback } from 'react';
// Importamos componentes de NextUI para la UI y algunos íconos
import { Card, CardBody, Button, Input, Textarea, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Checkbox } from "@nextui-org/react";
import { Pencil, Trash2, Plus, Filter } from 'lucide-react';
// Importamos la interfaz de tareas
import { Task } from '../interface/interfaceTask';
// Importamos la librería de notificaciones y sus estilos
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function TaskManager() {
  // Definimos los estados del componente
  const [tasks, setTasks] = useState<Task[]>([]); // lista de tareas
  const [newTask, setNewTask] = useState<Partial<Task>>({}); // tarea nueva
  const [editingTask, setEditingTask] = useState<Task | null>(null); // tarea en edición
  const [filter, setFilter] = useState<'all' | 'completed' | 'incomplete'>('all'); // filtro actual
  const [isLoading, setIsLoading] = useState(false); // estado de carga

  // función para obtener tareas de la api según el filtro seleccionado
  const fetchTasks = useCallback(async () => {
    setIsLoading(true); // activamos el estado de carga
    try {
      const queryString = filter !== 'all' ? `?filter=${filter}` : ''; // construimos el query string si hay un filtro
      const response = await fetch(`/api/tasks${queryString}`); // hacemos la solicitud
      if (!response.ok) throw new Error('Failed to fetch tasks'); // manejamos un error si la respuesta no es ok
      const data = await response.json(); // convertimos la respuesta a json
      setTasks(data); // actualizamos el estado con las tareas recibidas
    } catch (error) {
      console.error('Error fetching tasks:', error); // mostramos el error en la consola
      toast.error('Failed to fetch tasks'); // mostramos una notificación de error
    } finally {
      setIsLoading(false); // desactivamos el estado de carga
    }
  }, [filter]);

  // usamos useEffect para llamar a fetchTasks cuando el componente se monte o el filtro cambie
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // función para crear una nueva tarea
  const handleCreateTask = async () => {
    // validamos que todos los campos estén llenos
    if (!newTask.name || !newTask.date || !newTask.description) {
      toast.error('Please fill in all fields!');
      return;
    }
    setIsLoading(true); // activamos el estado de carga
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST', // método http
        headers: { 'Content-Type': 'application/json' }, // especificamos el tipo de contenido
        body: JSON.stringify(newTask) // convertimos la nueva tarea a json
      });
      if (!response.ok) throw new Error('Failed to create task'); // manejamos un error si la respuesta no es ok
      setNewTask({}); // limpiamos el estado de la nueva tarea
      await fetchTasks(); // volvemos a obtener las tareas para actualizar la lista
      toast.success('Task created successfully!'); // mostramos una notificación de éxito
    } catch (error) {
      console.error('Error creating task:', error); // mostramos el error en la consola
      toast.error('Failed to create task'); // mostramos una notificación de error
    } finally {
      setIsLoading(false); // desactivamos el estado de carga
    }
  };

  // función para actualizar una tarea existente
  const handleUpdateTask = async (task: Task) => {
    setIsLoading(true); // activamos el estado de carga
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT', // método http
        headers: { 'Content-Type': 'application/json' }, // especificamos el tipo de contenido
        body: JSON.stringify(task) // convertimos la tarea a json
      });
      if (!response.ok) throw new Error('Failed to update task'); // manejamos un error si la respuesta no es ok
      setEditingTask(null); // limpiamos el estado de edición
      await fetchTasks(); // volvemos a obtener las tareas para actualizar la lista
      toast.success('Task updated successfully!'); // mostramos una notificación de éxito
    } catch (error) {
      console.error('Error updating task:', error); // mostramos el error en la consola
      toast.error('Failed to update task'); // mostramos una notificación de error
    } finally {
      setIsLoading(false); // desactivamos el estado de carga
    }
  };

  // función para eliminar una tarea
  const handleDeleteTask = async (id: number) => {
    // confirmamos con el usuario si desea eliminar la tarea
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    setIsLoading(true); // activamos el estado de carga
    try {
      const response = await fetch(`/api/tasks/${id}`, { method: 'DELETE' }); // método http delete
      if (!response.ok) throw new Error('Failed to delete task'); // manejamos un error si la respuesta no es ok
      await fetchTasks(); // volvemos a obtener las tareas para actualizar la lista
      toast.success('Task deleted successfully!'); // mostramos una notificación de éxito
    } catch (error) {
      console.error('Error deleting task:', error); // mostramos el error en la consola
      toast.error('Failed to delete task'); // mostramos una notificación de error
    } finally {
      setIsLoading(false); // desactivamos el estado de carga
    }
  };

  // función para cambiar el estado de completado de una tarea
  const handleToggleComplete = async (task: Task) => {
    await handleUpdateTask({ ...task, completed: !task.completed }); // cambiamos el estado de completado y actualizamos la tarea
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Task Manager</h1>

      <Card className="mb-4">
        <CardBody>
          <Input
            placeholder="Task name"
            value={newTask.name || ''}
            onChange={(e) => setNewTask({ ...newTask, name: e.target.value })} // actualizamos el nombre de la tarea
            className="mb-2"
          />
          <Input
            type="date"
            value={newTask.date || ''}
            onChange={(e) => setNewTask({ ...newTask, date: e.target.value })} // actualizamos la fecha de la tarea
            className="mb-2"
          />
          <Textarea
            placeholder="Task description"
            value={newTask.description || ''}
            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })} // actualizamos la descripción de la tarea
            className="mb-2"
          />
          <Button
            color="primary"
            onClick={handleCreateTask} // función para crear la tarea
            startContent={<Plus />} // ícono de añadir
            isLoading={isLoading} // mostramos un indicador de carga si está activo
          >
            Add Task
          </Button>
        </CardBody>
      </Card>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Task List</h2>
        <Dropdown>
          <DropdownTrigger>
            <Button startContent={<Filter />}>
              {filter === 'all' ? 'All Tasks' : filter === 'completed' ? 'Completed' : 'Incomplete'}
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            aria-label="Filter tasks"
            onAction={(key) => setFilter(key as 'all' | 'completed' | 'incomplete')} // actualizamos el filtro seleccionado
          >
            <DropdownItem key="all">All Tasks</DropdownItem>
            <DropdownItem key="completed">Completed</DropdownItem>
            <DropdownItem key="incomplete">Incomplete</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>

      <Card>
        <CardBody>
          {tasks.map((task) => (
            <div key={task.id} className="flex justify-between items-center border-b py-2">
              <Checkbox
                isSelected={task.completed}
                onChange={() => handleToggleComplete(task)} // función para marcar/desmarcar tarea completada
              >
                {task.name}
              </Checkbox>
              <div className="flex space-x-2">
                <Button
                  onClick={() => setEditingTask(task)} // función para activar la edición de una tarea
                  startContent={<Pencil />} // ícono de editar
                >
                  Edit
                </Button>
                <Button
                  color="danger"
                  onClick={() => handleDeleteTask(task.id)} // función para eliminar tarea
                  startContent={<Trash2 />} // ícono de eliminar
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </CardBody>
      </Card>

      {editingTask && (
        <Card className="mt-4">
          <CardBody>
            <Input
              placeholder="Task name"
              value={editingTask.name}
              onChange={(e) => setEditingTask({ ...editingTask, name: e.target.value })} // actualizamos el nombre de la tarea en edición
              className="mb-2"
            />
            <Input
              type="date"
              value={editingTask.date}
              onChange={(e) => setEditingTask({ ...editingTask, date: e.target.value })} // actualizamos la fecha de la tarea en edición
              className="mb-2"
            />
            <Textarea
              placeholder="Task description"
              value={editingTask.description}
              onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })} // actualizamos la descripción de la tarea en edición
              className="mb-2"
            />
            <Button
              color="primary"
              onClick={() => handleUpdateTask(editingTask)} // función para actualizar la tarea
              isLoading={isLoading} // mostramos un indicador de carga si está activo
            >
              Update Task
            </Button>
            <Button
              onClick={() => setEditingTask(null)} // función para cancelar la edición
              color="success"
            >
              Cancel
            </Button>
          </CardBody>
        </Card>
      )}

      <ToastContainer /> 
    </div>
  );
}
