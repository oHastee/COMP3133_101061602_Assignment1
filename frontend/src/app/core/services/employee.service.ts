// src/app/core/services/employee.service.ts
import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { Observable } from 'rxjs';

// GraphQL Queries
const GET_ALL_EMPLOYEES = gql`
  query GetAllEmployees {
    getAllEmployees {
      id
      first_name
      last_name
      email
      gender
      designation
      salary
      date_of_joining
      department
      employee_photo
      created_at
      updated_at
    }
  }
`;

const SEARCH_EMPLOYEE_BY_ID = gql`
  query SearchEmployeeById($id: ID!) {
    searchEmployeeById(id: $id) {
      id
      first_name
      last_name
      email
      gender
      designation
      salary
      date_of_joining
      department
      employee_photo
      created_at
      updated_at
    }
  }
`;

const SEARCH_EMPLOYEE_BY_DESIGNATION_OR_DEPARTMENT = gql`
  query SearchEmployeeByDesignationOrDepartment($designation: String, $department: String) {
    searchEmployeeByDesignationOrDepartment(
      designation: $designation,
      department: $department
    ) {
      id
      first_name
      last_name
      email
      gender
      designation
      salary
      date_of_joining
      department
      employee_photo
    }
  }
`;

// GraphQL Mutations
const ADD_EMPLOYEE = gql`
  mutation AddEmployee(
    $first_name: String!,
    $last_name: String!,
    $email: String,
    $gender: String,
    $designation: String!,
    $salary: Float!,
    $date_of_joining: String!,
    $department: String!,
    $employee_photo: String
  ) {
    addEmployee(
      first_name: $first_name,
      last_name: $last_name,
      email: $email,
      gender: $gender,
      designation: $designation,
      salary: $salary,
      date_of_joining: $date_of_joining,
      department: $department,
      employee_photo: $employee_photo
    ) {
      id
      first_name
      last_name
      designation
      department
    }
  }
`;

const UPDATE_EMPLOYEE = gql`
  mutation UpdateEmployee(
    $id: ID!,
    $first_name: String,
    $last_name: String,
    $email: String,
    $gender: String,
    $designation: String,
    $salary: Float,
    $date_of_joining: String,
    $department: String,
    $employee_photo: String
  ) {
    updateEmployee(
      id: $id,
      first_name: $first_name,
      last_name: $last_name,
      email: $email,
      gender: $gender,
      designation: $designation,
      salary: $salary,
      date_of_joining: $date_of_joining,
      department: $department,
      employee_photo: $employee_photo
    ) {
      id
      first_name
      last_name
      designation
      department
    }
  }
`;

const DELETE_EMPLOYEE = gql`
  mutation DeleteEmployee($id: ID!) {
    deleteEmployee(id: $id) {
      id
      first_name
      last_name
    }
  }
`;

const UPLOAD_PROFILE_PICTURE = gql`
  mutation UploadProfilePicture($file: Upload!) {
    uploadProfilePicture(file: $file)
  }
`;

export interface Employee {
  id?: string;
  first_name: string;
  last_name: string;
  email?: string;
  gender?: string;
  designation: string;
  salary: number;
  date_of_joining: string;
  department: string;
  employee_photo?: string;
  created_at?: string;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  constructor(private apollo: Apollo) {}

  /**
   * Get all employees
   */
  getAllEmployees(): Observable<any> {
    return this.apollo.watchQuery({
      query: GET_ALL_EMPLOYEES,
      fetchPolicy: 'network-only' // Don't use cache, always make a network request
    }).valueChanges;
  }

  /**
   * Search for employee by ID
   */
  searchEmployeeById(id: string): Observable<any> {
    return this.apollo.watchQuery({
      query: SEARCH_EMPLOYEE_BY_ID,
      variables: { id },
      fetchPolicy: 'network-only'
    }).valueChanges;
  }

  /**
   * Search employees by designation or department
   */
  searchEmployeeByDesignationOrDepartment(designation?: string, department?: string): Observable<any> {
    return this.apollo.watchQuery({
      query: SEARCH_EMPLOYEE_BY_DESIGNATION_OR_DEPARTMENT,
      variables: { designation, department },
      fetchPolicy: 'network-only'
    }).valueChanges;
  }

  /**
   * Upload an employee profile picture
   */
  uploadProfilePicture(file: File): Observable<any> {
    return this.apollo.mutate({
      mutation: UPLOAD_PROFILE_PICTURE,
      variables: { file },
      context: {
        useMultipart: true // Important for file uploads!
      }
    });
  }

  /**
   * Add a new employee
   */
  addEmployee(employeeData: Employee): Observable<any> {
    return this.apollo.mutate({
      mutation: ADD_EMPLOYEE,
      variables: employeeData,
      refetchQueries: [
        { query: GET_ALL_EMPLOYEES } // Refresh employee list after adding
      ]
    });
  }

  /**
   * Update an employee
   */
  updateEmployee(employeeData: {
    id: string;
    first_name?: string;
    last_name?: string;
    email?: string;
    gender?: string;
    designation?: string;
    salary?: number;
    date_of_joining?: string;
    department?: string;
    employee_photo?: string;
  }): Observable<any> {
    return this.apollo.mutate({
      mutation: UPDATE_EMPLOYEE,
      variables: employeeData,
      refetchQueries: [
        { query: GET_ALL_EMPLOYEES },
        {
          query: SEARCH_EMPLOYEE_BY_ID,
          variables: { id: employeeData.id }
        }
      ]
    });
  }

  /**
   * Delete an employee
   */
  deleteEmployee(id: string): Observable<any> {
    return this.apollo.mutate({
      mutation: DELETE_EMPLOYEE,
      variables: { id },
      refetchQueries: [
        { query: GET_ALL_EMPLOYEES } // Refresh employee list after deletion
      ]
    });
  }
}
