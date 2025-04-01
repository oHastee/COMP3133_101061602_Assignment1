// frontend/src/app/app.component.ts
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule],
  template: `
    <!--<h1>Hello, {{ title }}</h1>-->
    <router-outlet></router-outlet>
  `
})
export class AppComponent {
  //title = '101061602_comp3133_assignment2';
}
