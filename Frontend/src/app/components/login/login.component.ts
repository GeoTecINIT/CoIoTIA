import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FirebaseService } from '../../core/firebase.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  imports: [FormsModule, CommonModule]
})

export class LoginComponent {
  errorMessage = '';

  constructor(private router: Router, public firebaseService: FirebaseService) {};

  goRegister() {
    this.router.navigate(['register'])
  }

  async login(formValues: any) {
    try {
      await this.firebaseService.login(formValues.email, formValues.password);
      this.router.navigate(['/']);
    } catch (error: any) {
      this.errorMessage = error.message;
    }
  }
}
