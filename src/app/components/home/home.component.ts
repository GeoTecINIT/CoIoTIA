import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FirebaseService } from '../../core/firebase.service';
import { MapComponent } from '../map/map.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  imports: [MapComponent]
})

export class HomeComponent {
  constructor(private router: Router, public firebaseService: FirebaseService) {};

  goLogin() {
    this.router.navigate(['login'])
  }

  goRegister() {
    this.router.navigate(['register'])
  }

  goDevices() {
    this.router.navigate(['devices']);
  }

  goModels() {
    this.router.navigate(['models']);
  }
}
