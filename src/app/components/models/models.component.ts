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
  analysis_types: any = {};
  data_types: any = {};
  selectedFile: File | null = null;
  uploadingModel: boolean = false;
  modelUploaded: boolean = false;
  uploadError: boolean = false;
  invalid: { "show" : boolean, "message" : string } = { "show" : false, "message" : "" };

  constructor(public firebaseService: FirebaseService) {};

  async ngOnInit() {
    this.getModels();
    const types = await this.firebaseService.getTypes();
    this.analysis_types = types?.analysisTypes;
    this.data_types = types?.dataTypes;
  }

  onFileChange(event: any) {
    this.selectedFile = event.target.files[0];
  }

  async getModels() {
    await new Promise(r => setTimeout(r, 300));

    if (!this.firebaseService.user) {
      console.log('User not logged in');
      return;
    }

    const formData = new FormData();
    formData.append('user_uid', this.firebaseService.user.uid);
    axios.post('http://127.0.0.1:5000/list', formData)
      .then((response) => {
        this.models = response.data;
      })
      .catch((error) => {
        console.log(error);
      });
  }

  uploadModel(formValues: any) {
    this.invalid = { "show" : false, "message" : "" };

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
        this.uploadError = true;
        console.log(error);
      });
  }
}
