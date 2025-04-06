import { Component, OnInit } from '@angular/core';
import * as L from 'leaflet';
import { MapService } from './map.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {
  map!: L.Map;
  origen: string = '';
  destino: string = '';
  algoritmo: string = 'DFS';
  ciudades: string[] = [];
  ruta: string[] = [];
  private grafo: { [ciudad: string]: { [vecino: string]: number } } = {};
  private coordenadas: { [ciudad: string]: [number, number] } = {};

  constructor(private mapService: MapService) { }

  ngOnInit(): void {
    this.cargarDatos();
    this.inicializarMapa();

    setTimeout(() => {
      if (this.map) {
        this.map.invalidateSize();
      }
    }, 0);
  }

  private cargarDatos(): void {
    // Cargar lista de ciudades
    this.mapService.getCiudades().subscribe({
      next: (ciudades) => this.ciudades = ciudades,
      error: (err) => console.error('Error al obtener ciudades:', err)
    });

    // Cargar grafo simple
    this.mapService.getGrafoSimple().subscribe({
      next: (grafo) => this.grafo = grafo,
      error: (err) => console.error('Error al obtener grafo:', err)
    });

    // Cargar coordenadas
    this.mapService.getCoordenadas().subscribe({
      next: (coords) => this.coordenadas = coords,
      error: (err) => console.error('Error al obtener coordenadas:', err)
    });
  }

  inicializarMapa(): void {
    this.map = L.map('map').setView([-1.5, -78.5], 7);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);
  }

  setOrigen(value: string): void {
    this.origen = value;
  }

  setDestino(value: string): void {
    this.destino = value;
  }

  setAlgoritmo(value: string): void {
    this.algoritmo = value;
  }

  calcularRuta(): void {
    if (!this.origen || !this.destino || !this.algoritmo) {
      alert('Por favor, selecciona origen, destino y algoritmo.');
      return;
    }

    this.mapService.calcularRuta(this.origen, this.destino, this.algoritmo)
      .subscribe({
        next: (ruta) => {
          this.ruta = ruta;
          console.log(this.ruta);
          this.mostrarRuta();
        },
        error: (err) => {
          console.error('Error al calcular ruta:', err);
          alert('Error al calcular la ruta. Verifica la conexión con el servidor.');
        }
      });
  }

  private mostrarRuta(): void {
    this.map.eachLayer((layer: any) => {
      if (layer instanceof L.Polyline || layer instanceof L.Circle) {
        this.map.removeLayer(layer);
      }
    });

    const [listaCiudades, distanciaTotal]: any = this.ruta;
    const puntos: L.LatLng[] = [];

    listaCiudades.forEach((ciudad: any, index: any) => {
      const coord = this.coordenadas[ciudad];
      if (coord) {
        // Crear marcador con círculo
        const circle = L.circle(coord, {
          radius: 5000,
          color: 'blue',
          fillColor: '#3388ff',
          fillOpacity: 0.5
        }).addTo(this.map);

        // Personalizar el popup con información adicional
        circle.bindPopup(`
          <b>${ciudad}</b><br>
          ${index === 0 ? 'Origen' : index === listaCiudades.length - 1 ? 'Destino' : 'Paso ' + index}<br>
          ${index < listaCiudades.length - 1 ? 'Distancia siguiente: ' + this.grafo[ciudad][listaCiudades[index + 1]] + ' km' : ''}
        `).openPopup();

        puntos.push(L.latLng(coord[0], coord[1]));
      }
    });

    // Dibujar la línea de la ruta si hay suficientes puntos
    if (puntos.length > 1) {
      const polyline = L.polyline(puntos, {
        color: 'red',
        weight: 5,
        opacity: 0.7,
        dashArray: '10, 10'
      }).addTo(this.map);

      // Mostrar la distancia total en un popup en el punto medio
      const midPoint = Math.floor(puntos.length / 2);
      const midCoord = puntos[midPoint];
      L.popup()
        .setLatLng(midCoord)
        .setContent(`<b>Distancia total:</b> ${distanciaTotal} km`)
        .openOn(this.map);

      // Ajustar el mapa para mostrar toda la ruta
      this.map.fitBounds(polyline.getBounds());
    }
  }
}