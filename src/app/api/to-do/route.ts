import { NextResponse } from "next/server";
import fs from 'fs/promises';
import path from 'path';

export interface Task {
    id: number;
    name: string;
    date: string;
    description: string;
    completed: boolean;
}

const dbPath = path.join(process.cwd(), 'db.json');

async function getTasks(): Promise<Task[]> {
    const data = await fs.readFile(dbPath, 'utf8');
    return JSON.parse(data).tasks;
}

async function saveTasks(tasks: Task[]): Promise<void> {
    await fs.writeFile(dbPath, JSON.stringify({ tasks }, null, 2));
}

export async function GET(req: Request) {
    const url = new URL(req.url);
    const status = url.searchParams.get("status");
    let tasks = await getTasks();

    if (status === "completed") {
        tasks = tasks.filter((task) => task.completed);
    } else if (status === "incomplete") {
        tasks = tasks.filter((task) => !task.completed);
    }

    return NextResponse.json(tasks);
}

export async function POST(req: Request) {
    const body = await req.json();
    if (!body || !body.date || !body.description || !body.name) {
        return NextResponse.json({
            message: "La tarea no es válida"
        }, { status: 400 });
    }

    const tasks = await getTasks();
    const newTask: Task = { id: Date.now(), completed: false, ...body };
    tasks.push(newTask);
    await saveTasks(tasks);

    return NextResponse.json(newTask, { status: 201 });
}

export async function PUT(req: Request) {
    const body = await req.json();
    if (!body || !body.id) {
        return NextResponse.json({
            message: "La tarea no es válida"
        }, { status: 400 });
    }

    let tasks = await getTasks();
    const index = tasks.findIndex(task => task.id === body.id);
    if (index === -1) {
        return NextResponse.json({
            message: "Tarea no encontrada"
        }, { status: 404 });
    }

    tasks[index] = { ...tasks[index], ...body };
    await saveTasks(tasks);

    return NextResponse.json(tasks[index]);
}

export async function DELETE(req: Request) {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) {
        return NextResponse.json({
            message: "ID de tarea no proporcionado"
        }, { status: 400 });
    }

    let tasks = await getTasks();
    tasks = tasks.filter(task => task.id !== parseInt(id));
    await saveTasks(tasks);

    return NextResponse.json({ message: "Tarea eliminada con éxito" });
}