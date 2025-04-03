// src/app/auth/login/login.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { LoginComponent } from './login.component';
import { AuthService } from '../../core/services/auth.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('AuthService', ['login', 'isLoggedIn']);
    spy.isLoggedIn.and.returnValue(false);

    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        RouterTestingModule,
        NoopAnimationsModule,
        LoginComponent
      ],
      providers: [{ provide: AuthService, useValue: spy }]
    }).compileComponents();

    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form with empty fields', () => {
    expect(component.loginForm.get('usernameOrEmail')?.value).toBe('');
    expect(component.loginForm.get('password')?.value).toBe('');
    expect(component.loginForm.get('rememberMe')?.value).toBe(false);
  });

  it('should validate form fields correctly', () => {
    const usernameOrEmailControl = component.loginForm.get('usernameOrEmail');
    const passwordControl = component.loginForm.get('password');

    // Initially form is invalid
    expect(component.loginForm.valid).toBeFalsy();

    // Fill in the form
    usernameOrEmailControl?.setValue('testuser');
    expect(usernameOrEmailControl?.valid).toBeTruthy();

    passwordControl?.setValue('password123');
    expect(passwordControl?.valid).toBeTruthy();

    // Now form should be valid
    expect(component.loginForm.valid).toBeTruthy();
  });

  it('should call the login service when form is submitted', () => {
    const loginResponse = { data: { login: { token: 'test-token', user: { id: '1', email: 'test@example.com' } } } };
    authServiceSpy.login.and.returnValue(of(loginResponse));

    component.loginForm.setValue({
      usernameOrEmail: 'testuser',
      password: 'password123',
      rememberMe: true
    });

    component.onSubmit();

    expect(authServiceSpy.login).toHaveBeenCalledWith({
      usernameOrEmail: 'testuser',
      password: 'password123'
    });
    expect(component.isLoading).toBeTrue();
  });

  it('should handle authentication error correctly', () => {
    const errorResponse = {
      graphQLErrors: [{ message: 'No account found with that username or email.' }]
    };
    authServiceSpy.login.and.returnValue(throwError(() => errorResponse));

    component.loginForm.setValue({
      usernameOrEmail: 'wronguser',
      password: 'wrongpassword',
      rememberMe: false
    });

    component.onSubmit();

    expect(component.errorMessage).toBe('No account found with that username or email.');
    expect(component.isLoading).toBeFalse();
  });

  it('should toggle password visibility', () => {
    expect(component.showPassword).toBeFalse();
    component.togglePasswordVisibility();
    expect(component.showPassword).toBeTrue();
    component.togglePasswordVisibility();
    expect(component.showPassword).toBeFalse();
  });

  it('should redirect to employees page if already logged in', () => {
    const routerSpy = spyOn(component['router'], 'navigate');
    authServiceSpy.isLoggedIn.and.returnValue(true);

    component.ngOnInit();

    expect(routerSpy).toHaveBeenCalledWith(['/employees']);
  });
});
