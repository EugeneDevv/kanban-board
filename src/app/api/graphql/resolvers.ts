import fs from 'fs';
import path from 'path';
import { Column, Task, Data } from '@/utils/types';
import { v4 as uuidv4 } from 'uuid';

const dataPath = path.join(process.cwd(), 'data.json');

// Function to read data from file
const readData = (): Data => JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// Function to write data to file
const writeData = (data: Data) => {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
};

// Load initial data
let data: Data = readData();

export const resolvers = {
  Query: {
    columns: async (): Promise<Column[]> => {
      return data.columns;
    },
    tasks: async (): Promise<Task[]> => {
      return data.tasks;
    },
  },
  Mutation: {
    addColumn: async (
      _: unknown,
      { title }: { title: string }
    ): Promise<{
      statusCode: number;
      message: string;
      column: Column | null;
    }> => {
      const newColumn: Column = {
        id: uuidv4(),
        title,
      };
      data.columns.push(newColumn);
      writeData(data);

      return {
        statusCode: 201,
        message: 'Column added successfully',
        column: newColumn,
      };
    },
    updateColumn: async (
      _: unknown,
      { id, title }: { id: string; title?: string }
    ): Promise<{
      statusCode: number;
      message: string;
    }> => {
      const columnIndex = data.columns.findIndex((col) => col.id === id);
      if (columnIndex === -1)
        return { statusCode: 404, message: 'Column not found' };

      const column = data.columns[columnIndex];
      column.title = title || column.title;
      data.columns[columnIndex] = column;
      writeData(data);

      return {
        statusCode: 200,
        message: 'Column updated successfully',
      };
    },
    swapColumns: async (
      _: unknown,
      {
        activeColumnId,
        overColumnId,
      }: { activeColumnId: string; overColumnId: string }
    ): Promise<{
      statusCode: number;
      message: string;
    }> => {
      const activeColumnIndex = data.columns.findIndex(
        (col) => col.id.toString() === activeColumnId
      );

      const overColumnIndex = data.columns.findIndex(
        (col) => col.id.toString() === overColumnId
      );

      if (activeColumnIndex === -1 || overColumnIndex === -1)
        return { statusCode: 404, message: 'Column not found' };

      const activeColumn = data.columns[activeColumnIndex];
      const overColumn = data.columns[overColumnIndex];

      // Remove the columns and insert them at the new positions
      data.columns.splice(activeColumnIndex, 1, overColumn);
      data.columns.splice(overColumnIndex, 1, activeColumn);

      writeData(data);

      return {
        statusCode: 200,
        message: 'Column moved successfully',
      };
    },
    deleteColumn: async (
      _: unknown,
      { id }: { id: string }
    ): Promise<{
      statusCode: number;
      message: string;
      column: Column | null;
    }> => {
      const columnIndex = data.columns.findIndex((col) => col.id === id);
      if (columnIndex === -1) {
        return { statusCode: 404, message: 'Column not found', column: null };
      }

      const [deletedColumn] = data.columns.splice(columnIndex, 1);

      // Remove tasks associated with the deleted column ID
      data.tasks = data.tasks.filter((task) => task.columnId !== id);

      writeData(data);

      return {
        statusCode: 200,
        message: 'Column and associated tasks deleted successfully',
        column: deletedColumn,
      };
    },
    addTask: async (
      _: unknown,
      { columnId, content }: { columnId: string; content: string }
    ): Promise<{ statusCode: number; message: string; task: Task | null }> => {
      const columnIndex = data.columns.findIndex((col) => col.id === columnId);
      if (columnIndex === -1)
        return { statusCode: 404, message: 'Column not found', task: null };

      const newTask: Task = {
        id: uuidv4(),
        columnId,
        content,
      };
      data.tasks.push(newTask);
      writeData(data);

      return {
        statusCode: 201,
        message: 'Task added successfully',
        task: newTask,
      };
    },
    updateTask: async (
      _: unknown,
      { id, content }: { id: string; content: string }
    ): Promise<{ statusCode: number; message: string; task: Task | null }> => {
      const taskIndex = data.tasks.findIndex((task) => task.id === id);
      if (taskIndex === -1)
        return { statusCode: 404, message: 'Task not found', task: null };

      const task = data.tasks[taskIndex];
      task.content = content || task.content;
      data.tasks[taskIndex] = task;
      writeData(data);

      return { statusCode: 200, message: 'Task updated successfully', task };
    },
    moveTask: async (
      _: unknown,
      {
        activeTaskId,
        overTaskId,
        columnId,
      }: { activeTaskId: string; overTaskId: string; columnId: string }
    ): Promise<{
      statusCode: number;
      message: string;
    }> => {
      const activeTaskIndex = data.tasks.findIndex(
        (col) => col.id.toString() === activeTaskId
      );

      const overTaskIndex = data.tasks.findIndex(
        (col) => col.id.toString() === overTaskId
      );

      if (activeTaskIndex === -1 || overTaskIndex === -1)
        return { statusCode: 404, message: 'Task not found' };

      // Swap tasks using splice
      const activeTask = data.tasks[activeTaskIndex];
      const overTask = data.tasks[overTaskIndex];

      if (columnId.length > 0) {
        activeTask.columnId = columnId;
      }

      // Remove the tasks and insert them at the new positions
      data.tasks.splice(activeTaskIndex, 1, overTask);
      data.tasks.splice(overTaskIndex, 1, activeTask);

      writeData(data);

      return {
        statusCode: 200,
        message: 'Task moved successfully',
      };
    },
    deleteTasks: async (
      _: unknown,
      { ids }: { ids: string[] }
    ): Promise<{
      statusCode: number;
      message: string;
    }> => {
      const deletedTasks: Task[] = [];

      // Loop through each id in the provided ids array
      ids.forEach((id) => {
        const taskIndex = data.tasks.findIndex((task) => task.id === id);
        if (taskIndex !== -1) {
          const [deletedTask] = data.tasks.splice(taskIndex, 1);
          deletedTasks.push(deletedTask);
        }
      });

      writeData(data);

      return {
        statusCode: deletedTasks.length > 0 ? 200 : 404,
        message:
          ids.length < 2
            ? 'Task delete successfully'
            : deletedTasks.length === ids.length
            ? `${deletedTasks.length} tasks deleted successfully`
            : `${deletedTasks.length} out of ${ids.length} tasks found and deleted`,
      };
    },
  },
};
