import { Component, OnInit } from '@angular/core';
import { FirebaseService } from '../../core/firebase.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import axios from 'axios';

@Component({
  selector: 'app-models',
  templateUrl: './models.component.html',
  styleUrl: './models.component.scss',
  imports: [FormsModule, CommonModule]
})

export class ModelsComponent implements OnInit {
  models: any = [];
  devices: any = [];

  activeModel: any = "";

  analysis_types: any = {};
  data_types: any = {};

  selectedFile: File | null = null;
  updateFile: File | null = null;

  uploadingModel: boolean = false;
  modelUploaded: boolean = false;
  uploadError: {"show" : boolean, "code" : number} = { "show" : false, "code" : 0 };
  loadError: boolean = false;
  invalid: { "show" : boolean, "message" : string } = { "show" : false, "message" : "" };

  
  constructor(public firebaseService: FirebaseService) {};

  async ngOnInit() {
    this.getModels();
    this.getDevices();
    const types = await this.firebaseService.getTypes();
    this.analysis_types = types?.analysisTypes;
    this.data_types = types?.dataTypes;
  }

  onFileChange(event: any) {
    this.selectedFile = event.target.files[0];
  }

  onUpdateChange(event: any) {
    this.updateFile = event.target.files[0];
  }

  async getModels() {
    try {
      await this.firebaseService.ensureAuthenticated();
      if (this.firebaseService.user === null) return;
      const formData = new FormData();
      formData.append('user_uid', this.firebaseService.user?.uid);
      axios.post('http://127.0.0.1:5000/list', formData)
        .then((response) => {
          this.models = response.data;
        })
        .catch((error) => {
          console.log(error);
        });
    } catch (error) {
      console.log(error);
    }
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

  uploadModel(formValues: any) {
    this.invalid = { "show" : false, "message" : "" };
    this.uploadError = { "show" : false, "code" : 0 };

    if (!this.firebaseService.user) {
      console.log('User not logged in');
      return;
    }

    if (formValues.analysis_type === '' || formValues.data_type === '') {
      this.invalid = { "show" : true, "message" : "Please select an analysis type and data type." };
      return;
    }

    if (!this.selectedFile) {
      this.invalid = { "show" : true, "message" : "Please select a file." };
      return;
    }

    const formData = new FormData();
    formData.append('user_uid', this.firebaseService.user.uid);
    formData.append('analysis_type', formValues.analysis_type);
    formData.append('data_type', formValues.data_type);
    formData.append('model', this.selectedFile, this.selectedFile.name);

    this.uploadingModel = true;

    axios.post('http://127.0.0.1:5000/upload', formData)
      .then(() => {
        this.getModels();
        this.uploadingModel = false;
        this.modelUploaded = true;
      })
      .catch((error) => {
        this.uploadingModel = false;
        this.uploadError = { "show" : true, "code" : error.response.status };
        console.log(error);
      });

      this.selectedFile = null;
  }

  deleteModel(modelName: any) {
    if (!this.firebaseService.user) {
      console.log('User not logged in');
      return;
    }

    const formData = new FormData();
    formData.append('model_name', modelName);

    axios.post('http://127.0.0.1:5000/delete', formData)
      .then(() => {
        this.getModels();
      })
      .catch((error) => {
        console.log(error);
      });
  }

  updateModel() {
    if (!this.firebaseService.user) {
      console.log('User not logged in');
      return;
    }

    if (!this.updateFile) {
      this.invalid = { "show" : true, "message" : "Please select a file." };
      return;
    }

    const formData = new FormData();
    formData.append('model', this.updateFile, this.updateFile.name);

    this.uploadingModel = true;

    axios.post('http://127.0.0.1:5000/update', formData)
    .then(() => {
      this.uploadingModel = false;
      this.modelUploaded = true;
    })
    .catch((error) => {
      this.uploadingModel = false;
      this.uploadError = { "show" : true, "code" : error.response.status };
    });

    this.updateFile = null;
  }


  setActiveModel(model: any) {
    this.activeModel = model;
  }


  loadModel(formValues: any) {
    if (formValues.device === '') {
      this.invalid = { "show" : true, "message" : "Please select a device." };
      return;
    }

    const device = this.devices.find((device: any) => device.id === formValues.device);

    if (this.activeModel.analysis_type != device.analysis_type || this.activeModel.data_type != device.data_type) {
      this.invalid = { "show" : true, "message" : "Analysis and data types must match." };
      return;
    }

    const formData = new FormData();
    formData.append('model_name', this.activeModel.model_name);
    formData.append('device_mac', formValues.device);

    axios.post('http://127.0.0.1:5000/send', formData)
      .then((response) => {
        console.log(response.data);
      })
      .catch((error) => {
        this.loadError = true;
      })
    
  }

}
