import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Column, Task, Data } from '@/utils/types';

const dataPath = path.join(process.cwd(), 'data.json');
const data: Data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

const typeDefs = `#graphql
  type Column {
    id: ID!
    title: String
  }

  type Task {
    id: ID!
    columnId: String
    content: String
  }

  # Standardized response with statusCode and message for all mutations
  type MutationResponse {
    statusCode: Int!
    message: String!
    column: Column
    task: Task
  }

  type Query {
    columns: [Column]
    tasks: [Task]
  }

  type Mutation {
    addColumn(title: String): MutationResponse
    updateColumn(id: ID!, title: String): MutationResponse
    deleteColumn(id: ID!): MutationResponse
    addTask(columnId: String, content: String): MutationResponse
    updateTask(id: ID!, columnId: String, content: String): MutationResponse
    deleteTask(id: ID!): MutationResponse
  }
`;

const resolvers = {
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
      fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

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
      column: Column | null;
    }> => {
      const columnIndex = data.columns.findIndex((col) => col.id === id);
      if (columnIndex === -1)
        return { statusCode: 404, message: 'Column not found', column: null };

      const column = data.columns[columnIndex];
      column.title = title || column.title;
      data.columns[columnIndex] = column;
      fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

      return {
        statusCode: 200,
        message: 'Column updated successfully',
        column,
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
      // Find the column by ID
      const columnIndex = data.columns.findIndex((col) => col.id === id);
      if (columnIndex === -1) {
        return { statusCode: 404, message: 'Column not found', column: null };
      }

      // Remove the column
      const [deletedColumn] = data.columns.splice(columnIndex, 1);

      // Remove tasks associated with the deleted column ID
      data.tasks = data.tasks.filter((task) => task.columnId !== id);

      // Write the updated data to the file
      fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

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
      fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

      return {
        statusCode: 201,
        message: 'Task added successfully',
        task: newTask,
      };
    },
    updateTask: async (
      _: unknown,
      {
        id,
        columnId,
        content,
      }: { id: string; columnId: string; content: string }
    ): Promise<{ statusCode: number; message: string; task: Task | null }> => {
      const columnIndex = data.columns.findIndex((col) => col.id === columnId);
      if (columnIndex === -1)
        return { statusCode: 404, message: 'Column not found', task: null };

      const taskIndex = data.tasks.findIndex((task) => task.id === id);
      if (taskIndex === -1)
        return { statusCode: 404, message: 'Task not found', task: null };

      const task = data.tasks[taskIndex];
      task.columnId = columnId || task.columnId;
      task.content = content || task.content;
      data.tasks[taskIndex] = task;
      fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

      return { statusCode: 200, message: 'Task updated successfully', task };
    },
    deleteTask: async (
      _: unknown,
      { id }: { id: string }
    ): Promise<{ statusCode: number; message: string; task: Task | null }> => {
      const taskIndex = data.tasks.findIndex((task) => task.id === id);
      if (taskIndex === -1)
        return { statusCode: 404, message: 'Task not found', task: null };

      const [deletedTask] = data.tasks.splice(taskIndex, 1);
      fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

      return {
        statusCode: 200,
        message: 'Task deleted successfully',
        task: deletedTask,
      };
    },
  },
};

const server = new ApolloServer({
  resolvers,
  typeDefs,
});

const handler = startServerAndCreateNextHandler(server);

export { handler as GET, handler as POST };
