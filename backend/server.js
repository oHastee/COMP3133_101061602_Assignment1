// File: backend/server.js

require('dotenv').config(); // Load environment variables from .env
const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path'); // Added to resolve paths for static files
const { graphqlUploadExpress } = require('graphql-upload'); // Added for file uploads
const typeDefs = require('./src/schemas/typeDefs');
const resolvers = require('./src/resolvers/resolvers');
const authenticate = require('./src/middleware/auth');

const PORT = process.env.PORT || 3000;  // Use port 3000 by default
const MONGODB_URI = process.env.MONGODB_URI;

async function startServer() {
    const app = express();
    app.use(cors());

    // Enable file uploads via graphql-upload middleware
    app.use(graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 1 }));

    // Serve static files from the uploads folder
    app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

    // Connect to MongoDB Atlas
    mongoose.connect(MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
        .then(() => console.log('MongoDB connected'))
        .catch(err => console.error('MongoDB connection error:', err));

    const server = new ApolloServer({
        typeDefs,
        resolvers,
        context: ({ req }) => {
            const user = authenticate(req);
            return { user };
        },
    });

    await server.start();
    server.applyMiddleware({ app });

    app.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}${server.graphqlPath}`);
    });
}

startServer();
