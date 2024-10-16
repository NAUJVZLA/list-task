"use client"

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardBody, CardFooter, Button, Input, Textarea, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Checkbox } from "@nextui-org/react";
import { Pencil, Trash2, Plus, Filter } from 'lucide-react';
import { Task } from './interface/interfaceTask';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Este es nuestro componente principal para gestionar tareas
export default function TaskManager() {
  // Usamos 'useState' para almacenar y actualizar la información en nuestro componente
  const [tasks, setTasks] = useState<Task[]>([]); // Esto contiene todas nuestras tareas
  const [newTask, setNewTask] = useState<Partial<Task>>({}); // Esto es para crear una nueva tarea
  const [editingTask, setEditingTask] = useState<Task | null>(null); // Esta es la tarea que estamos editando
  const [filter, setFilter] = useState<'all' | 'completed' | 'incomplete'>('all'); // Esto nos ayuda a filtrar tareas
  const [isLoading, setIsLoading] = useState(false); // Esto nos indica si estamos esperando algo

  // Esta función obtiene todas nuestras tareas del servidor
  const fetchTasks = useCallback(async () => {
    setIsLoading(true); // Comenzamos a cargar
    try {
      const response = await fetch('http://localhost:8000/tasks');
      if (!response.ok) throw new Error('Failed to fetch tasks');
      const data = await response.json();
      setTasks(data); // Guardamos las tareas obtenidas
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to fetch tasks'); // Mostramos un mensaje de error si algo sale mal
    } finally {
      setIsLoading(false); // Terminamos de cargar
    }
  }, []);

  // Esto se ejecuta cuando nuestro componente aparece por primera vez en la pantalla
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Esta función crea una nueva tarea
  const handleCreateTask = async () => {
    // Verificamos que todos los campos estén llenos
    if (!newTask.name || !newTask.date || !newTask.description) {
      toast.error('¡Por favor, completa todos los campos!'); // Recordamos al usuario que llene todo
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8000/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask)
      });
      if (!response.ok) throw new Error('Failed to create task');
      setNewTask({}); // Limpiamos el formulario
      await fetchTasks(); // Obtenemos todas las tareas nuevamente para mostrar la nueva
      toast.success('¡Tarea creada exitosamente!'); // Informamos al usuario que funcionó
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Failed to create task'); // Informamos al usuario si no funcionó
    } finally {
      setIsLoading(false);
    }
  };

  // Esta función actualiza una tarea existente
  const handleUpdateTask = async (task: Task) => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/tasks/${task.id}`, { // Usamos comillas invertidas
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task)
      });
      if (!response.ok) throw new Error('Failed to update task');
      setEditingTask(null); // Terminamos de editar
      await fetchTasks(); // Obtenemos todas las tareas nuevamente para mostrar los cambios
      toast.success('¡Tarea actualizada exitosamente!');
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
    } finally {
      setIsLoading(false);
    }
  };

  // Esta función elimina una tarea
  const handleDeleteTask = async (id: number) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta tarea?')) return; // Confirmación de eliminación
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/tasks/${id}`, { method: 'DELETE' }); // Usamos comillas invertidas
      if (!response.ok) throw new Error('Failed to delete task');
      await fetchTasks(); // Obtenemos todas las tareas nuevamente para eliminar la eliminada
      toast.success('¡Tarea eliminada exitosamente!');
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    } finally {
      setIsLoading(false);
    }
  };

  // Esta función marca una tarea como completada o no completada
  const handleToggleComplete = async (task: Task) => {
    await handleUpdateTask({ ...task, completed: !task.completed }); // Cambiamos el estado de completada
  };

  // Esta función filtra nuestras tareas según lo que el usuario quiera ver
  const filteredTasks = tasks.filter(task => {
    if (filter === 'completed') return task.completed;
    if (filter === 'incomplete') return !task.completed;
    return true; // 'all' tasks
  });

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Gestor de Tareas</h1>

      {/* Este es el formulario para crear una nueva tarea */}
      <Card className="mb-4">
        <CardBody>
          <Input
            placeholder="Nombre de la tarea"
            value={newTask.name || ''}
            onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
            className="mb-2"
          />
          <Input
            type="date"
            value={newTask.date || ''}
            onChange={(e) => setNewTask({ ...newTask, date: e.target.value })}
            className="mb-2"
          />
          <Textarea
            placeholder="Descripción de la tarea"
            value={newTask.description || ''}
            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
            className="mb-2"
          />
          <Button
            color="primary"
            onClick={handleCreateTask}
            startContent={<Plus />}
            isLoading={isLoading}
          >
            Añadir Tarea
          </Button>
        </CardBody>
      </Card>

      {/* Cabecera de la lista de tareas con filtro */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Lista de Tareas</h2>
        <Dropdown>
          <DropdownTrigger>
            <Button startContent={<Filter />}>
              {filter === 'all' ? 'Todas las Tareas' : filter === 'completed' ? 'Completadas' : 'Incompletas'}
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            aria-label="Filtrar tareas"
            onAction={(key) => setFilter(key as 'all' | 'completed' | 'incomplete')}
          >
            <DropdownItem key="all">Todas las Tareas</DropdownItem>
            <DropdownItem key="completed">Completadas</DropdownItem>
            <DropdownItem key="incomplete">Incompletas</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>

      {/* Tabla de tareas */}
      <Card>
        <CardBody>
          {filteredTasks.map((task) => (
            <div key={task.id} className="flex justify-between items-center border-b py-2">
              <Checkbox
                isSelected={task.completed}
                onChange={() => handleToggleComplete(task)}
              >
                {task.name}
              </Checkbox>
              <div className="flex space-x-2">
                <Button
                  onClick={() => setEditingTask(task)} // Establece la tarea en edición
                  startContent={<Pencil />}
                >
                  Editar
                </Button>
                <Button
                  color="error"
                  onClick={() => handleDeleteTask(task.id)}
                  startContent={<Trash2 />}
                >
                  Eliminar
                </Button>
              </div>
            </div>
          ))}
        </CardBody>
      </Card>

      {/* Manejo del formulario de edición */}
      {editingTask && (
        <Card className="mt-4">
          <CardBody>
            <Input
              placeholder="Nombre de la tarea"
              value={editingTask.name}
              onChange={(e) => setEditingTask({ ...editingTask, name: e.target.value })}
              className="mb-2"
            />
            <Input
              type="date"
              value={editingTask.date}
              onChange={(e) => setEditingTask({ ...editingTask, date: e.target.value })}
              className="mb-2"
            />
            <Textarea
              placeholder="Descripción de la tarea"
              value={editingTask.description}
              onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
              className="mb-2"
            />
            <Button
              color="primary"
              onClick={() => handleUpdateTask(editingTask)}
              isLoading={isLoading}
            >
              Actualizar Tarea
            </Button>
            <Button
              onClick={() => setEditingTask(null)} // Cancela la edición
              color="neutral"
            >
              Cancelar
            </Button>
          </CardBody>
        </Card>
      )}

      {/* Contenedor para mostrar notificaciones */}
      <ToastContainer />
    </div>
  );
}
