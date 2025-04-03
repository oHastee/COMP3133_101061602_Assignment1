// src/app/core/services/auth.service.ts
import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

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
    return this.apollo.query({
      query: LOGIN_QUERY,
      variables: credentials,
      fetchPolicy: 'no-cache' // Don't cache login results
    });
  }

  /**
   * Register a new user
   */
  signup(userData: { username: string; email: string; password: string }): Observable<any> {
    return this.apollo.mutate({
      mutation: SIGNUP_MUTATION,
      variables: userData,
    });
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
