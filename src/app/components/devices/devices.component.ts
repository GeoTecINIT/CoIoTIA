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
  invalid: {"show" : boolean, "msg_code" : number} = {"show" : false, "msg_code" : 0};

  macPattern = /^([0-9A-Fa-f]{2}[:]){5}[0-9A-Fa-f]{2}$/;


  constructor(public firebaseService: FirebaseService) {};

  ngOnInit() {
    this.getDevices();
  }

  async getDevices() {
    try {
      await this.firebaseService.ensureAuthenticated();
      this.devices = await this.firebaseService.getDevices();
      const types = await this.firebaseService.getTypes();
      this.analysis_types = types?.analysisTypes;
      this.data_types = types?.dataTypes;
    } catch (error) {
      console.log(error);
    }
  }

  async addDevice(formValues: any) {
    this.invalid = {"show" : false, "msg_code" : -1};

    const check = this.macPattern.test(formValues.mac);

    if (!check) {
      this.invalid = {"show" : true, "msg_code" : 2};
      return;
    }

    if (formValues.analysis_type === '' || formValues.data_type === '') {
      this.invalid = {"show" : true, "msg_code" : 1};
      return;
    }
    
    try {
      await this.firebaseService.addDevice(formValues.mac, formValues.analysis_type, formValues.data_type);
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
