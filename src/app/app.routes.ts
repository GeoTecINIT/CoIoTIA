import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { DevicesComponent } from './components/devices/devices.component';
import { ModelsComponent } from './components/models/models.component';
import { MapComponent } from './components/map/map.component';

export const routes: Routes = [
    { path: "", component: HomeComponent },
    { path: "login", component: LoginComponent },
    { path: "register", component: RegisterComponent },
    { path: "devices", component: DevicesComponent },
    { path: "models", component: ModelsComponent },
    { path: "map", component: MapComponent }
];
