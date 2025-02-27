import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FirebaseService } from '../../core/firebase.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
  imports: [FormsModule, CommonModule]
})

export class RegisterComponent {
  errorMessage = '';

  constructor(private router: Router, public firebaseService: FirebaseService) {};

  goLogin() {
    this.router.navigate(['login'])
  }

  async register(formValues: any) {
    if (formValues.password !== formValues.password_confirm) {
      this.errorMessage = "Passwords must match";
      return;
    } else {
      try {
        await this.firebaseService.createUser(formValues.email, formValues.password);
        this.router.navigate(['/']);
      } catch (error: any) {
        this.errorMessage = error;
      }
    }
  }
}
