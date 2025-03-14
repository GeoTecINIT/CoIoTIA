import { Component, AfterViewInit } from '@angular/core';
import { FirebaseService } from '../../core/firebase.service';
import * as L from 'leaflet';
import 'leaflet-draw';
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
  private map!: L.Map;
  private markerGroup!: L.FeatureGroup;
  private drawnItems!: L.FeatureGroup;
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

    const openStreetLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 20,
      minZoom: 3,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });

    const topographicLayer = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
      maxZoom: 20,
      minZoom: 3,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });

    const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 20,
      minZoom: 3,
      attribution: '&copy; <a href="https://www.esri.com/en-us/arcgis/products/arcgis-online/overview">Esri</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    })

    const esriWorldLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 20,
      minZoom: 3,
      attribution: '&copy; <a href="https://www.esri.com/en-us/arcgis/products/arcgis-online/overview">Esri</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    })

    
     const maps = {
      "OpenStreetMap" : openStreetLayer,
      "Topographic" : topographicLayer,
      "Satellite" : satelliteLayer,
      "Esri" : esriWorldLayer,
    }

    openStreetLayer.addTo(this.map);

    L.control.layers(maps).addTo(this.map);

    this.markerGroup = L.featureGroup().addTo(this.map);

    this.setupDrawOptions();
  }


  setupDrawOptions() {
    this.drawnItems = new L.FeatureGroup();
    this.map.addLayer(this.drawnItems);

    const drawControl = new L.Control.Draw({
      draw: {
        polyline: false,
        rectangle: false,
        circle: false,
        marker: false,
        circlemarker: false,
        polygon: {
          allowIntersection: false,
          drawError: {
            color: 'red',
            message: 'Lines can not intersect'
          },
          shapeOptions: {
            color: 'blue'
          }
        }
      },
      edit: {
        featureGroup: this.drawnItems,
        remove: true
      }
    });
    this.map.addControl(drawControl);

    this.map.on(L.Draw.Event.CREATED, (event: L.LeafletEvent) => {
      this.drawnItems.clearLayers();

      const layer = (event as L.DrawEvents.Created).layer as L.Polygon;
      this.drawnItems.addLayer(layer);

      layer.setStyle({color: 'green'});

      const vertices = (layer as L.Polygon).getLatLngs()[0] as L.LatLng[];
      const vertexList = vertices.map((latlng: L.LatLng) => [latlng.lat, latlng.lng]);
      this.getPolygonIntersections(vertexList);
    })

    this.map.on('draw:edited', (event) => {
      const editedLayers = (event as L.DrawEvents.Edited).layers;
      editedLayers.eachLayer((layer: L.Layer) => {
        if (layer instanceof L.Polygon) {
          const vertices = layer.getLatLngs()[0] as L.LatLng[];
          const vertexList = vertices.map((latlng: L.LatLng) => [latlng.lat, latlng.lng]);
          this.getPolygonIntersections(vertexList);
        }
      })
    });

    this.map.on('draw:deleted', (event) => {
      this.getAllModels();
    });
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
    this.markerGroup.clearLayers();
    for (let model of this.models) {
      let coords = model["location"]["geometry"]["coordinates"];
      L.marker(coords).addTo(this.markerGroup)
        .bindPopup(
          `
          <b>${model["model_name"]}</b>
          <br/>
          <b>Type:</b> ${this.analysis_types[model["analysis_type"]]}
          <br/>
          <b>Data:</b> ${this.data_types[model["data_type"]]}
          `
        );
    }
  }

  
  getPolygonIntersections(vertexList: number[][]) {
    axios.post('http://127.0.0.1:5000/modelsPolygon', { "polygon" : vertexList })
      .then((response) => {
        // console.log(response.data);
        this.models = response.data;
        this.addModelMarkers();
      })
      .catch((error) => {
        console.log(error);
      })
  }

}
