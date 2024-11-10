"use client"

import { ApolloClient, InMemoryCache, ApolloProvider, gql } from '@apollo/client';
import React from 'react';

const Providers = ({ children }: { children: React.ReactNode }) => {

  const client = new ApolloClient({
    uri: 'api/graphql',
    cache: new InMemoryCache(),
  });

  return (
    <ApolloProvider client={client}>
      {children}
    </ApolloProvider>
  )
}

export default Providers