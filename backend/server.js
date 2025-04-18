// File: backend/server.js

require('dotenv').config(); // Load environment variables from .env
const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const { graphqlUploadExpress } = require('graphql-upload');
const typeDefs = require('./src/schemas/typeDefs');
const resolvers = require('./src/resolvers/resolvers');
const authenticate = require('./src/middleware/auth');

// Environment variables
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;
const NODE_ENV = process.env.NODE_ENV || 'development';
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:4200';
const MAX_PAYLOAD_SIZE = process.env.MAX_PAYLOAD_SIZE || '10mb';

async function startServer() {
    const app = express();

    // Configure CORS
    app.use(cors({
        origin: process.env.NODE_ENV === 'production'
            ? process.env.FRONTEND_URL || '*'
            : 'http://localhost:4200',
        credentials: true
    }));

    // Configure JSON body parser with increased limit
    app.use(express.json({
        limit: MAX_PAYLOAD_SIZE
    }));

    // Configure URL-encoded data with increased limit
    app.use(express.urlencoded({
        extended: true,
        limit: MAX_PAYLOAD_SIZE
    }));

    // Enable file uploads via graphql-upload middleware
    app.use(graphqlUploadExpress({
        maxFileSize: 5000000, // 5MB limit
        maxFiles: 1
    }));

    // Static files middleware for uploads folder
    app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

    // Connect to MongoDB Atlas
    mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
        .then(() => console.log('MongoDB connected'))
        .catch(err => console.error('MongoDB connection error:', err));

    // Configure Apollo Server
    const server = new ApolloServer({
        typeDefs,
        resolvers,
        context: ({ req }) => {
            const user = authenticate(req);
            return { user };
        },
        uploads: false, // Disable Apollo Server's deprecated upload feature
        formatError: (err) => {
            // Log server errors but return a cleaner version to client
            if (err.originalError) {
                console.error('GraphQL error:', err);
                console.error(err.originalError);
            }

            // Return appropriate error to client
            return {
                message: err.message,
                path: err.path,
                // Don't expose internal server errors to clients in production
                extensions: NODE_ENV !== 'production' ? err.extensions : undefined
            };
        },
    });

    await server.start();
    server.applyMiddleware({
        app,
        // Increase Apollo's body parser limit
        bodyParserConfig: {
            limit: MAX_PAYLOAD_SIZE
        }
    });

    // Health check endpoint
    app.get('/health', (req, res) => {
        res.status(200).send('OK');
    });

    app.listen(PORT, () => {
        console.log(`Server running in ${NODE_ENV} mode`);
        console.log(`Server running at http://localhost:${PORT}${server.graphqlPath}`);
        console.log(`Max payload size set to: ${MAX_PAYLOAD_SIZE}`);
    });
}

startServer().catch(err => {
    console.error('Error starting server:', err);
});
