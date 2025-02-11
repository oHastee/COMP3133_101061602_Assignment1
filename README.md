### 📌 **Employee Management System**
A GraphQL-based backend application for managing employees, built using **Node.js**, **Express**, **GraphQL**, **MongoDB**, and **Apollo Server**.

---

## 🚀 **Technologies Used**
### Backend:
- **Node.js** – JavaScript runtime for building the backend.
- **Express.js** – Web framework for Node.js.
- **GraphQL** – API query language used for flexible data retrieval.
- **Apollo Server** – GraphQL implementation for Express.
- **MongoDB Atlas** – NoSQL database for storing user and employee data.
- **Mongoose** – ODM (Object Data Modeling) for MongoDB.

### Security:
- **bcrypt** – Password hashing for secure storage.
- **jsonwebtoken (JWT)** – User authentication and authorization.

### Development Tools:
- **dotenv** – Manages environment variables securely.
- **Postman** – API testing.
- **Git & GitHub** – Version control.

---

## 📚 **Project Overview**
The **Employee Management System** provides a GraphQL API for managing employee records, allowing users to:
- **Sign up** and **log in** securely.
- **Add, update, delete, and retrieve employee records**.
- **Search employees** by ID, designation, or department.
- **Use JWT authentication** to protect sensitive operations.

---

## 🛠 **Setup Instructions**
### 1️⃣ Clone the Repository
```sh
git clone https://github.com/oHastee/COMP3133_101061602_Assignment1.git
cd COMP3133_101061602_Assignment1
```

### 2️⃣ Install Dependencies
```sh
npm install
```

### 3️⃣ Configure Environment Variables
Create a **.env** file in the project root and add:
```env
PORT=3000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/comp3133_101061602_assigment1?retryWrites=true&w=majority
JWT_SECRET=your_secret_key
```

### 4️⃣ Start the Server
```sh
node src/server.js
```
or for development:
```sh
nodemon src/server.js
```

---

## 🔥 **GraphQL API Endpoints**
The API is accessible at:
```
http://localhost:3000/graphql
```
It provides the following **Queries** and **Mutations**:

### 🔹 Queries:
- **Login** → Authenticate user and return JWT.
- **Get All Employees** → Retrieve all employee records.
- **Search Employee by ID** → Find a specific employee.
- **Search Employee by Designation/Department** → Filter employees.

### 🔹 Mutations:
- **Signup** → Create a new user.
- **Add Employee** → Add a new employee record.
- **Update Employee** → Modify employee details.
- **Delete Employee** → Remove an employee from the system.

---

## 🧪 **Testing the API**
1. Open **Postman**.
2. Import the **Postman Collection** (JSON file provided).
3. Execute requests such as:
   - **Signup & Login** → Get a JWT token.
   - **Use JWT in the Authorization header** for protected queries/mutations.
   - **Perform CRUD operations on employees**.

---

## 📁 **Project Structure**
```
/src
  ├── models/        # Mongoose models (User, Employee)
  ├── resolvers/     # GraphQL resolver functions
  ├── schemas/       # GraphQL schema definitions
  ├── middleware/    # Authentication middleware (JWT)
server.js            # Entry point
.env                 # Environment variables
README.md            # Project documentation
```

---

## 👉 **GitHub Repository**
[GitHub Link](https://github.com/oHastee/COMP3133_101061602_Assignment1)

---

## 📄 **Sample User Credentials**
```json
{
  "username": "test",
  "email": "test@example.com",
  "password": "password"
}
```

---

## 🌐 **License**
This project is licensed under the **MIT License**.

---

## 👨‍🎓 **Author**
**Oscar Piedrasanta Diaz**


