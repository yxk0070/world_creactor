import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Task {
  id: string;
  title: string;
  status: 'running' | 'completed' | 'error';
  message?: string;
}

interface TaskContextType {
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'status'>) => string;
  updateTask: (id: string, updates: Partial<Task>) => void;
  removeTask: (id: string) => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export function TaskProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);

  const addTask = (task: Omit<Task, 'id' | 'status'>) => {
    const id = Math.random().toString(36).substring(7);
    setTasks(prev => [...prev, { ...task, id, status: 'running' }]);
    return id;
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    
    // 如果任务完成或出错，3秒后自动移除
    if (updates.status === 'completed' || updates.status === 'error') {
      setTimeout(() => {
        removeTask(id);
      }, 3000);
    }
  };

  const removeTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  return (
    <TaskContext.Provider value={{ tasks, addTask, updateTask, removeTask }}>
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
}
