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
const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads';

async function startServer() {
    const app = express();

    app.use(cors({
        origin: NODE_ENV === 'production'
            ? ['https://curious-fudge-8cd8c7.netlify.app']
            : 'http://localhost:4200',
        credentials: true
    }));

    // Enable file uploads via graphql-upload middleware
    app.use(graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 1 }));

    // Ensure upload directory exists
    const uploadPath = path.join(__dirname, UPLOAD_DIR);
    if (!require('fs').existsSync(uploadPath)) {
        require('fs').mkdirSync(uploadPath, { recursive: true });
    }

    // Serve static files from the uploads folder
    app.use('/uploads', express.static(path.join(__dirname, UPLOAD_DIR)));

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
        uploads: false, // Disable Apollo Server's deprecated upload feature
    });

    await server.start();
    server.applyMiddleware({ app });

    // Health check endpoint
    app.get('/health', (req, res) => {
        res.status(200).send('OK');
    });

    app.listen(PORT, () => {
        console.log(`Server running in ${NODE_ENV} mode`);
        console.log(`Server running at http://localhost:${PORT}${server.graphqlPath}`);
    });
}

startServer().catch(err => {
    console.error('Error starting server:', err);
});
