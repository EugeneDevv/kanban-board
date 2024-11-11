import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { typeDefs } from './schemas';
import { resolvers } from './resolvers';

// Initialize Apollo Server with provided type definitions and resolvers
const server = new ApolloServer({
  resolvers,
  typeDefs,
});

// Start the server and create handler for Next.js API route with support for GET and POST requests
const handler = startServerAndCreateNextHandler(server);

// Export the handler for use in Next.js API routes for both GET and POST requests
export { handler as GET, handler as POST };
