const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Employee = require('../models/Employee');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

const resolvers = {
    Query: {
        // Login Query: validate user credentials and return JWT token
        login: async (_, { usernameOrEmail, password }) => {
            const user = await User.findOne({
                $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }]
            });
            if (!user) {
                throw new Error('No account found with that username or email.');
            }
            const valid = await bcrypt.compare(password, user.password);
            if (!valid) {
                throw new Error('Incorrect password. Please try again.');
            }
            const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1d' });
            return { token, user };
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
            // Hash password before saving
            const hashedPassword = await bcrypt.hash(password, 10);
            const user = new User({ username, email, password: hashedPassword });
            await user.save();
            return user;
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
            return employee;
        }
    },
    // Custom field resolvers to format date fields and id
    Employee: {
        id: (parent) => parent._id.toString(),
        created_at: (parent) => parent.created_at ? parent.created_at.toISOString() : null,
        updated_at: (parent) => parent.updated_at ? parent.updated_at.toISOString() : null,
    },
    User: {
        id: (parent) => parent._id.toString(),
        created_at: (parent) => parent.created_at ? parent.created_at.toISOString() : null,
        updated_at: (parent) => parent.updated_at ? parent.updated_at.toISOString() : null,
    }
};

module.exports = resolvers;
