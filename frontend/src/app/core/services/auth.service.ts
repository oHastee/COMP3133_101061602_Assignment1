// src/app/core/services/auth.service.ts
import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

const LOGIN_QUERY = gql`
  query Login($usernameOrEmail: String!, $password: String!) {
    login(usernameOrEmail: $usernameOrEmail, password: $password) {
      token
      user {
        id
        username
        email
      }
    }
  }
`;

const SIGNUP_MUTATION = gql`
  mutation Signup($username: String!, $email: String!, $password: String!) {
    signup(username: $username, email: $email, password: $password) {
      id
      username
      email
    }
  }
`;

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private apollo: Apollo) {}

  /**
   * Checks if user is logged in based on JWT token presence
   */
  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  /**
   * Get current user token
   */
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  /**
   * Login with username/email and password
   */
  login(credentials: { usernameOrEmail: string; password: string }): Observable<any> {
    // Ensure credentials are clean but preserve password exactly as entered
    const sanitizedCredentials = {
      usernameOrEmail: credentials.usernameOrEmail.trim(),
      password: credentials.password // Keep password as is, no trimming
    };

    console.log(`Login attempt - username/email: ${sanitizedCredentials.usernameOrEmail}, password length: ${sanitizedCredentials.password.length}`);

    return this.apollo.query({
      query: LOGIN_QUERY,
      variables: sanitizedCredentials,
      fetchPolicy: 'no-cache' // Don't cache login results
    }).pipe(
      tap(response => {
        console.log('Login response received:', response.data ? 'success' : 'failed');
      })
    );
  }

  /**
   * Register a new user
   */
  signup(userData: { username: string; email: string; password: string }): Observable<any> {
    // Sanitize input data but preserve password exactly
    const sanitizedUserData = {
      username: userData.username.trim(),
      email: userData.email.trim(),
      password: userData.password // Keep password as is, no trimming
    };

    console.log(`Signup attempt - username: ${sanitizedUserData.username}, email: ${sanitizedUserData.email}, password length: ${sanitizedUserData.password.length}`);

    return this.apollo.mutate({
      mutation: SIGNUP_MUTATION,
      variables: sanitizedUserData,
    }).pipe(
      tap(response => {
        console.log('Signup response received:', response.data ? 'success' : 'failed');
        if (response.data) {
          // Save the credentials temporarily for easy login
          sessionStorage.setItem('last_created_user', sanitizedUserData.username);
          sessionStorage.setItem('last_created_password', sanitizedUserData.password);
        }
      })
    );
  }

  /**
   * Logout the current user
   */
  logout(): void {
    // Clear token and any other stored user data
    localStorage.removeItem('token');
    localStorage.removeItem('remember_user');

    // Reset apollo store to clear cached queries
    this.apollo.client.resetStore()
      .catch(err => console.error('Error resetting store', err));
  }
}
