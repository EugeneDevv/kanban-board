export const typeDefs = `#graphql
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
    swapColumns(activeColumnId: ID!, overColumnId: ID!): MutationResponse
    deleteColumn(id: ID!): MutationResponse
    addTask(columnId: String, content: String): MutationResponse
    updateTask(id: ID!, content: String): MutationResponse
    moveTask(activeTaskId: ID!, overTaskId: ID!, columnId: String): MutationResponse
    deleteTasks(ids: [ID]!): MutationResponse
  }
`;