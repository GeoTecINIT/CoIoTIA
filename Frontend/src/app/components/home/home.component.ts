import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FirebaseService } from '../../core/firebase.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})

export class HomeComponent {
  constructor(private router: Router, public FirebaseService: FirebaseService) {};

  goLogin() {
    this.router.navigate(['login'])
  }

  goRegister() {
    this.router.navigate(['register'])
  }
}
