import { Component, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';


@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss'
})

export class MapComponent implements AfterViewInit {
  private map: any;

  constructor() {};

  ngAfterViewInit(): void {
    this.initMap();
  };

  private initMap() {
    this.map = L.map('map', {
      center: [39.994444, -0.068889],
      zoom: 20
    });

    const tiles = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18,
      minZoom: 3,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });

    tiles.addTo(this.map);
  }

}
