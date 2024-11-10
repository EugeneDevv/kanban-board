"use client";

import { ApolloClient, InMemoryCache, ApolloProvider, gql } from "@apollo/client";
import React from "react";

// Providers component to wrap the app with Apollo Client and provide GraphQL context
const Providers = ({ children }: { children: React.ReactNode }) => {
  // Initialize Apollo Client with server URI and caching
  const client = new ApolloClient({
    uri: "/api/graphql", // GraphQL API endpoint
    cache: new InMemoryCache(), // In-memory cache for query results
  });

  return (
    // ApolloProvider makes the client accessible to the app's components
    <ApolloProvider client={client}>
      {children}
    </ApolloProvider>
  );
};

export default Providers;
