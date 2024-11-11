import { gql } from '@apollo/client';

export const GET_COLUMNS_AND_TASKS = gql`
  query getColumnsAndTasks {
    columns {
      id
      title
    }
    tasks {
      id
      columnId
      content
    }
  }
`;
