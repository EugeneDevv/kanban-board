import { gql } from '@apollo/client';

export const ADD_COLUMN = gql`
  mutation Mutation($title: String) {
    addColumn(title: $title) {
      column {
        id
        title
      }
      message
      statusCode
    }
  }
`;

export const DELETE_COLUMN = gql`
  mutation DeleteColumn($id: ID!) {
  deleteColumn(id: $id) {
    message
    statusCode
  }
  }
`;

export const UPDATE_COLUMN = gql`
  mutation UpdateColumn($id: ID!, $title: String) {
    updateColumn(id: $id, title: $title) {
      statusCode
      message
    }
  }
`;

export const SWAP_COLUMNS = gql`
  mutation SwapColumns($activeColumnId: ID!, $overColumnId: ID!) {
    swapColumns(activeColumnId: $activeColumnId, overColumnId: $overColumnId) {
      message
      statusCode
    }
  }
`;

export const DELETE_TASKS = gql`
  mutation DeleteTasks($ids: [ID]!) {
    deleteTasks(ids: $ids) {
      statusCode
      message
    }
  }
`;
