import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private apollo: Apollo) {}

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  login(credentials: { usernameOrEmail: string; password: string; }) {
    return this.apollo.query({
      query: gql`
        query Login($usernameOrEmail: String!, $password: String!) {
          login(usernameOrEmail: $usernameOrEmail, password: $password) {
            token
            user {
              id
              email
            }
          }
        }
      `,
      variables: credentials,
      fetchPolicy: 'no-cache'
    });
  }

  signup(userData: { username: string; email: string; password: string; }) {
    return this.apollo.mutate({
      mutation: gql`
        mutation Signup($username: String!, $email: String!, $password: String!) {
          signup(username: $username, email: $email, password: $password) {
            id
            username
            email
          }
        }
      `,
      variables: userData,
    });
  }

  logout(): void {
    localStorage.removeItem('token');
  }
}
