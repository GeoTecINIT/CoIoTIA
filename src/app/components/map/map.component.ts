import { Component, AfterViewInit } from '@angular/core';
import { FirebaseService } from '../../core/firebase.service';
import * as L from 'leaflet';
import axios from 'axios';

import { icon, Marker } from 'leaflet';
const iconRetinaUrl = 'public/marker-icon-2x.png';
const iconUrl = 'public/marker-icon.png';
const shadowUrl = 'public/marker-shadow.png';
const iconDefault = icon({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});
Marker.prototype.options.icon = iconDefault;

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss'
})

export class MapComponent implements AfterViewInit {
  private map: any;
  models: any = [];
  analysis_types: any = {};
  data_types: any = {};

  constructor(public firebaseService: FirebaseService) {};

  async ngAfterViewInit() {
    this.initMap();
    await this.getTypes();
    this.getAllModels();
  };

  private initMap() {
    this.map = L.map('map', {
      center: [39.994444, -0.068889],
      zoom: 12
    });

    const tiles = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18,
      minZoom: 3,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });

    tiles.addTo(this.map);

    const icon = L.icon({
      iconUrl: 'node _modules/leaflet/dist/images/marker-icon.png',
      shadowUrl: 'node_modules/leaflet/dist/images/marker-shadow.png'
    })
  }


  getAllModels() {
    axios.get('http://127.0.0.1:5000/listAll')
      .then((response) => {
        this.models = response.data;
        this.addModelMarkers();
      })
      .catch((error) => {
        console.log(error);
      })
  }

  
  async getTypes() {
    const types = await this.firebaseService.getTypes();
    this.analysis_types = types?.analysisTypes;
    this.data_types = types?.dataTypes;
  }


  addModelMarkers() {
    for (let model of this.models) {
      let coords = model["location"]["geometry"]["coordinates"];
      L.marker(coords).addTo(this.map)
        .bindPopup(
          `
          <b>${model["model_name"]}</b>
          <br/>
          Type: ${this.analysis_types[model["analysis_type"]]}
          <br/>
          Data: ${this.data_types[model["data_type"]]}
          `
        );
    }
    
  }

}
