import { Component, OnInit } from '@angular/core';
import { FirebaseService } from '../../core/firebase.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-devices',
  templateUrl: './devices.component.html',
  styleUrl: './devices.component.scss',
  imports: [FormsModule, CommonModule]
})

export class DevicesComponent implements OnInit {
  devices: any = [];
  analysis_types: any = {};
  data_types: any = {};
  invalid: boolean = false;

  constructor(public firebaseService: FirebaseService) {};

  ngOnInit() {
    this.getDevices();
  }

  async getDevices() {
    await new Promise(r => setTimeout(r, 300));
    this.devices = await this.firebaseService.getDevices();
    const types = await this.firebaseService.getTypes();
    this.analysis_types = types?.analysisTypes;
    this.data_types = types?.dataTypes;
  }

  async addDevice(formValues: any) {
    this.invalid = false;

    if (formValues.analysis_type === '' || formValues.data_type === '') {
      this.invalid = true;
      return;
    }
    
    try {
      await this.firebaseService.addDevice(formValues.analysis_type, formValues.data_type);
      this.devices = await this.firebaseService.getDevices();
    } catch (error: any) {
      console.log(error);
    }
  }

  async deleteDevice(id: string) {
    try {
      await this.firebaseService.deleteDevice(id);
      this.devices = await this.firebaseService.getDevices();
    } catch (error: any) {
      console.log(error);
    }
  }
}
