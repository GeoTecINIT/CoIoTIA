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

  async logout() {
    try {
      this.firebaseService.logout();
    } catch (error) {
      console.log(error);
    }
  }
}
