import { Component } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { FirebaseService } from './core/firebase.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})

export class AppComponent {
  title = 'CoIoTIA';

  constructor(public router: Router, public firebaseService: FirebaseService) {};

  goLogin() {
    this.router.navigate(['login'])
  }

  goMap() {
    this.router.navigate(['/map'])
  }

  goModels() {
    this.router.navigate(['/models'])
  }

  goDevices() {
    this.router.navigate(['/devices'])
  }

  async logout() {
    try {
      this.firebaseService.logout();
      this.router.navigate(['/']);
    } catch (error) {
      console.log(error);
    }
  }
}
