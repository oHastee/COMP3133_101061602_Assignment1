// frontend/src/app/app.routes.ts
import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { SignupComponent } from './auth/signup/signup.component';
import { EmployeeListComponent } from './employee/employee-list/employee-list.component';
import { EmployeeAddComponent } from './employee/employee-add/employee-add.component';
import { EmployeeEditComponent } from './employee/employee-edit/employee-edit.component';
import { AuthGuard } from './core/guards/auth.guard';

export const appRoutes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'employees', component: EmployeeListComponent, canActivate: [AuthGuard] },
  { path: 'employee/add', component: EmployeeAddComponent, canActivate: [AuthGuard]  },
  { path: 'employee/edit/:id', component: EmployeeEditComponent, canActivate: [AuthGuard]  },
 // { path: '**', redirectTo: 'login' },
];
