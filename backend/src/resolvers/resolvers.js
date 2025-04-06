// backend/src/resolvers/resolvers.js
const { GraphQLUpload } = require('graphql-upload');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const User = require('../models/User');
const Employee = require('../models/Employee');

// Try to load Sharp for image processing
let Sharp;
try {
    Sharp = require('sharp');
} catch (err) {
    console.warn('Sharp module not installed. Image resizing will be disabled.');
    console.warn('Install with: npm install sharp');
    Sharp = null;
}

// Environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
const NODE_ENV = process.env.NODE_ENV || 'development';
const PORT = process.env.PORT || 3000;
const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads';

// Maximum allowed file size for base64 encoding (to avoid 413 errors)
const MAX_BASE64_SIZE = 200 * 1024; // 200KB

// Ensure upload directory exists
const ensureUploadDirExists = () => {
    const uploadPath = path.join(__dirname, '../../', UPLOAD_DIR);
    if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
    }
    return uploadPath;
};

// Get base URL for file access
const getBaseUrl = () => {
    return NODE_ENV === 'production'
        ? process.env.BASE_URL || 'https://employee-management-api-19ru.onrender.com'
        : `http://localhost:${PORT}`;
};

const resolvers = {
    Upload: GraphQLUpload,
    Query: {
        // Login Query: validate user credentials and return JWT token
        login: async (_, { usernameOrEmail, password }) => {
            // Try to find the user
            const user = await User.findOne({
                $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }]
            });

            if (!user) {
                throw new Error('No account found with that username or email.');
            }

            // Log the length of provided password and stored password
            console.log(`Login attempt - Password lengths: provided=${password.length}, stored hash length=${user.password.length}`);

            // Verify the password using bcrypt's compare method
            try {
                const valid = await bcrypt.compare(password, user.password);

                if (!valid) {
                    console.log('Password comparison failed');
                    throw new Error('Incorrect password. Please try again.');
                }

                // Create a new token with the user id that expires in 24 hours
                const token = jwt.sign(
                    { id: user._id },
                    JWT_SECRET,
                    { expiresIn: '1d' }
                );

                return { token, user };
            } catch (error) {
                console.error('Password validation error:', error.message);
                throw new Error('Incorrect password. Please try again.');
            }
        },

        // Retrieve all employees
        getAllEmployees: async (_, __, { user }) => {
            return await Employee.find({});
        },

        // Search employee by ID
        searchEmployeeById: async (_, { id }) => {
            const employee = await Employee.findById(id);
            if (!employee) {
                throw new Error('Employee not found');
            }
            return employee;
        },

        // Search employees by designation or department
        searchEmployeeByDesignationOrDepartment: async (_, { designation, department }) => {
            const filter = {};
            if (designation) filter.designation = designation;
            if (department) filter.department = department;
            return await Employee.find(filter);
        }
    },
    Mutation: {
        // Signup Mutation: create a new user with duplicate checks
        signup: async (_, { username, email, password }) => {
            const existingUser = await User.findOne({
                $or: [{ username: username }, { email: email }]
            });

            if (existingUser) {
                if (existingUser.username === username) {
                    throw new Error('Username already taken');
                }
                if (existingUser.email === email) {
                    throw new Error('Email already in use');
                }
            }

            console.log(`Creating user with password length: ${password.length}`);

            try {
                // Create new user with unmodified password - let the schema pre-save hook handle hashing
                const user = new User({ username, email, password });
                await user.save();

                console.log(`User ${username} created successfully with password hash length: ${user.password.length}`);
                return user;
            } catch (error) {
                console.error('User creation error:', error);
                throw new Error('Error creating user: ' + error.message);
            }
        },

        // Add a new employee
        addEmployee: async (_, args, { user }) => {
            const employee = new Employee(args);
            await employee.save();
            return employee;
        },

        // Update employee details by ID
        updateEmployee: async (_, { id, ...updates }, { user }) => {
            const employee = await Employee.findByIdAndUpdate(
                id,
                { ...updates, updated_at: Date.now() },
                { new: true }
            );
            if (!employee) {
                throw new Error('Employee not found');
            }
            return employee;
        },

        // Delete employee by ID
        deleteEmployee: async (_, { id }, { user }) => {
            const employee = await Employee.findByIdAndDelete(id);
            if (!employee) {
                throw new Error('Employee not found');
            }

            // If there's a profile picture, attempt to delete it
            if (employee.employee_photo) {
                try {
                    const photoPath = employee.employee_photo;
                    // Handle both URL and base64 formats
                    if (photoPath.startsWith('http')) {
                        const fileName = photoPath.substring(photoPath.lastIndexOf('/') + 1);
                        const filePath = path.join(ensureUploadDirExists(), fileName);

                        if (fs.existsSync(filePath)) {
                            fs.unlinkSync(filePath);
                            console.log(`Deleted profile picture: ${filePath}`);
                        }
                    }
                    // For base64, we don't need to delete any files
                } catch (error) {
                    console.error('Error deleting profile picture:', error);
                    // Continue with employee deletion even if file deletion fails
                }
            }

            return employee;
        },

        // File upload mutation for profile picture - with image processing
        uploadProfilePicture: async (_, { file }) => {
            try {
                const { createReadStream, filename, mimetype } = await file;
                console.log(`Processing file upload: ${filename}, type: ${mimetype}, size: unknown`);

                // Convert to buffer
                const chunks = [];
                for await (const chunk of createReadStream()) {
                    chunks.push(chunk);
                }
                const buffer = Buffer.concat(chunks);
                console.log(`Received file size: ${buffer.length} bytes`);

                // Check if we should resize (if buffer is large or Sharp is available)
                let processedBuffer = buffer;
                if (Sharp && buffer.length > MAX_BASE64_SIZE) {
                    try {
                        console.log('Resizing image with Sharp...');
                        processedBuffer = await Sharp(buffer)
                            .resize({
                                width: 300,
                                height: 300,
                                fit: 'inside',
                                withoutEnlargement: true
                            })
                            .jpeg({
                                quality: 70,
                                progressive: true,
                                optimizeScans: true
                            })
                            .toBuffer();
                        console.log(`Image resized. New size: ${processedBuffer.length} bytes`);
                    } catch (resizeErr) {
                        console.error('Error resizing image:', resizeErr);
                        processedBuffer = buffer; // Fall back to original buffer
                    }
                }

                // If still too large, warn in logs
                if (processedBuffer.length > MAX_BASE64_SIZE) {
                    console.warn(`WARNING: Image still large after processing: ${processedBuffer.length} bytes`);
                    console.warn('This may cause issues with 413 Payload Too Large errors');
                }

                // Convert to base64 - use jpeg mimetype for consistency
                const base64Image = `data:image/jpeg;base64,${processedBuffer.toString('base64')}`;
                return base64Image;
            } catch (error) {
                console.error('File upload error:', error);
                throw new Error(`Failed to process image: ${error.message}`);
            }
        }
    },
    Employee: {
        id: (parent) => parent._id.toString(),
        created_at: (parent) => parent.created_at ? parent.created_at.toISOString() : null,
        updated_at: (parent) => parent.updated_at ? parent.updated_at.toISOString() : null,
        date_of_joining: (parent) => {
            if (!parent.date_of_joining) return null;
            return parent.date_of_joining.toISOString();
        },
    },
    User: {
        id: (parent) => parent._id.toString(),
        created_at: (parent) => parent.created_at ? parent.created_at.toISOString() : null,
        updated_at: (parent) => parent.updated_at ? parent.updated_at.toISOString() : null,
    }
};

module.exports = resolvers;
