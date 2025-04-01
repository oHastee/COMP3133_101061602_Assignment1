import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  constructor(private apollo: Apollo) {}

  // 1. Get all employees
  getAllEmployees(): Observable<any> {
    return this.apollo.watchQuery({
      query: gql`
        query {
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
      `
    }).valueChanges;
  }

  // 2. Search employee by ID
  searchEmployeeById(id: string): Observable<any> {
    return this.apollo.watchQuery({
      query: gql`
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
      `,
      variables: { id }
    }).valueChanges;
  }

  // 3. Search employees by designation or department
  searchEmployeeByDesignationOrDepartment(designation?: string, department?: string): Observable<any> {
    return this.apollo.watchQuery({
      query: gql`
        query SearchEmployeeByDesignationOrDepartment($designation: String, $department: String) {
          searchEmployeeByDesignationOrDepartment(designation: $designation, department: $department) {
            id
            first_name
            last_name
            designation
            department
          }
        }
      `,
      variables: { designation, department }
    }).valueChanges;
  }

  // 4. Add an employee
  addEmployee(employeeData: {
    first_name: string;
    last_name: string;
    email?: string;
    gender?: string;
    designation: string;
    salary: number;
    date_of_joining: string;
    department: string;
    employee_photo?: string;
  }): Observable<any> {
    return this.apollo.mutate({
      mutation: gql`
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
      `,
      variables: {
        first_name: employeeData.first_name,
        last_name: employeeData.last_name,
        email: employeeData.email,
        gender: employeeData.gender,
        designation: employeeData.designation,
        salary: employeeData.salary,
        date_of_joining: employeeData.date_of_joining,
        department: employeeData.department,
        employee_photo: employeeData.employee_photo
      }
    });
  }

  // 5. Update an employee
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
      mutation: gql`
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
      `,
      variables: {
        id: employeeData.id,
        first_name: employeeData.first_name,
        last_name: employeeData.last_name,
        email: employeeData.email,
        gender: employeeData.gender,
        designation: employeeData.designation,
        salary: employeeData.salary,
        date_of_joining: employeeData.date_of_joining,
        department: employeeData.department,
        employee_photo: employeeData.employee_photo
      }
    });
  }

  // 6. Delete an employee
  deleteEmployee(id: string): Observable<any> {
    return this.apollo.mutate({
      mutation: gql`
        mutation DeleteEmployee($id: ID!) {
          deleteEmployee(id: $id) {
            id
            first_name
            last_name
          }
        }
      `,
      variables: { id }
    });
  }
}
