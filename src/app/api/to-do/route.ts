import { NextRequest, NextResponse } from "next/server";


const API_URL = 'http://localhost:8000/tasks';

export async function GET(req: NextRequest) {
  // Extraemos los parámetros de la URL de la solicitud
  const { searchParams } = new URL(req.url);
  const filter = searchParams.get("filter"); // Obtenemos el valor del parámetro "filter" si existe
  
  let url = API_URL;

  // Dependiendo del filtro, modificamos la URL para filtrar las tareas
  if (filter === "completed") {
    url += '?completed=true'; // Si el filtro es "completed", buscamos tareas completadas
  } else if (filter === "incomplete") {
    url += '?completed=false'; // Si el filtro es "incomplete", buscamos tareas no completadas
  }

  const response = await fetch(url);

  const tasks = await response.json();


  return NextResponse.json(tasks);
}

//  (crear nuevas tareas)
export async function POST(req: NextRequest) {
  // Extraemos el cuerpo de la solicitud en formato JSON
  const body = await req.json();
  
 
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }, // Especificamos que el contenido es JSON
    body: JSON.stringify(body) // Convertimos el cuerpo de la solicitud a JSON
  });

 
  if (!response.ok) {
    return NextResponse.json({ message: "Failed to create task" }, { status: response.status });
  }

  // Convertimos la respuesta en JSON para obtener la tarea recién creada
  const newTask = await response.json();
  // Devolvemos la nueva tarea con un código de estado 201 (creado)
  return NextResponse.json(newTask, { status: 201 });
}

//  (actualizar tareas)
export async function PUT(req: NextRequest) {
  // Extraemos el cuerpo de la solicitud en formato JSON
  const body = await req.json();
  
  // Hacemos una solicitud PUT a la API para actualizar una tarea existente
  const response = await fetch(API_URL, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' }, // Especificamos que el contenido es JSON
    body: JSON.stringify(body) // Convertimos el cuerpo de la solicitud a JSON
  });


  if (!response.ok) {
    return NextResponse.json({ message: "Failed to update task" }, { status: response.status });
  }

  const updatedTask = await response.json();
  // Devolvemos la tarea actualizada como respuesta JSON
  return NextResponse.json(updatedTask);
}

// (eliminar tareas)
export async function DELETE(req: NextRequest) {
  // Extraemos los parámetros de la URL de la solicitud
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id"); // Obtenemos el valor del parámetro "id" si existe

  // Si no se proporciona un ID, devolvemos un error 400 (solicitud incorrecta)
  if (!id) {
    return NextResponse.json({ message: "Task ID is required" }, { status: 400 });
  }

  // Realizamos una solicitud DELETE a la API con el ID proporcionado
  const response = await fetch(`${API_URL}?id=${id}`, { method: 'DELETE' });


  if (!response.ok) {
    return NextResponse.json({ message: "Failed to delete task" }, { status: response.status });
  }

 
  return NextResponse.json({ message: "Task deleted successfully" });
}
