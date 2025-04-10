import { Component, OnInit } from '@angular/core';
import { MapService } from './map.service';
import { Router } from '@angular/router';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat, toLonLat } from 'ol/proj';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import LineString from 'ol/geom/LineString';
import { Style, Stroke, Fill, Circle as CircleStyle } from 'ol/style';
import { Icon, Text } from 'ol/style';
import { Circle as CircleGeom } from 'ol/geom';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {
  map!: Map;
  origen: string = '';
  destino: string = '';
  algoritmo: string = 'DFS';
  ciudades: string[] = [];
  ruta: string[] = [];
  private grafo: { [ciudad: string]: { [vecino: string]: number } } = {};
  private coordenadas: { [ciudad: string]: [number, number] } = {};
  private vectorSource = new VectorSource();

  constructor(private mapService: MapService, private router: Router) { }

  navigateToEditRoute() {
    this.router.navigate(['/editar-ruta']);
  }

  ngOnInit(): void {
    this.cargarDatos();
    this.inicializarMapa();
  }

  private cargarDatos(): void {
    this.mapService.getCiudades().subscribe({
      next: (ciudades) => this.ciudades = ciudades,
      error: (err) => console.error('Error al obtener ciudades:', err)
    });

    this.mapService.getGrafoSimple().subscribe({
      next: (grafo) => this.grafo = grafo,
      error: (err) => console.error('Error al obtener grafo:', err)
    });

    this.mapService.getCoordenadas().subscribe({
      next: (coords) => this.coordenadas = coords,
      error: (err) => console.error('Error al obtener coordenadas:', err)
    });
  }

  inicializarMapa(): void {
    this.map = new Map({
      target: 'map',
      layers: [
        new TileLayer({
          source: new OSM()
        }),
        new VectorLayer({
          source: this.vectorSource
        })
      ],
      view: new View({
        center: fromLonLat([-78.5, -1.5]),
        zoom: 7
      })
    });
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
    if (this.origen === this.destino) {
      alert('La ciudad de origen y destino no pueden ser iguales.');
      return;
    }

    if (Object.keys(this.coordenadas).length === 0 || Object.keys(this.grafo).length === 0) {
      alert('Los datos aún se están cargando. Por favor espera un momento.');
      return;
    }

    if (!this.origen || !this.destino || !this.algoritmo) {
      alert('Por favor, selecciona origen, destino y algoritmo.');
      return;
    }

    this.mapService.calcularRuta(this.origen, this.destino, this.algoritmo).subscribe({
      next: (ruta) => {
        this.ruta = ruta;
        this.mostrarRuta();
      },
      error: (err) => {
        console.error('Error al calcular ruta:', err);
        alert('Error al calcular la ruta. Verifica la conexión con el servidor.');
      }
    });
  }

  private mostrarRuta(): void {
    this.vectorSource.clear();
    const [listaCiudades, distanciaTotal]: any = this.ruta;
    const puntos: [number, number][] = [];

    listaCiudades.forEach((ciudad: any, index: number) => {
      const coord = this.coordenadas[ciudad];
      if (coord) {
        const punto = fromLonLat([coord[1], coord[0]]) as [number, number];
        puntos.push(punto);

        const feature = new Feature({
          geometry: new Point(punto),
          name: ciudad
        });

        feature.setStyle(new Style({
          image: new CircleStyle({
            radius: 7,
            fill: new Fill({ color: 'blue' }),
            stroke: new Stroke({ color: '#3388ff', width: 2 })
          }),
          text: new Text({
            text: ciudad,
            offsetY: -15,
            fill: new Fill({ color: 'black' }),
            stroke: new Stroke({ color: 'white', width: 2 })
          })
        }));

        this.vectorSource.addFeature(feature);
      }
    });

    if (puntos.length > 1) {
      const line = new LineString(puntos);
      const routeFeature = new Feature({
        geometry: line
      });

      routeFeature.setStyle(new Style({
        stroke: new Stroke({
          color: 'red',
          width: 3,
          lineDash: [10, 10]
        })
      }));

      this.vectorSource.addFeature(routeFeature);

      const midPointIndex = Math.floor(puntos.length / 2);
      const midCoord = puntos[midPointIndex];
      const midFeature = new Feature({
        geometry: new Point(midCoord)
      });

      midFeature.setStyle(new Style({
        text: new Text({
          text: `Distancia total: ${distanciaTotal} km`,
          offsetY: -25,
          fill: new Fill({ color: 'red' }),
          stroke: new Stroke({ color: 'white', width: 3 })
        })
      }));

      this.vectorSource.addFeature(midFeature);
    }

    this.map.getView().fit(this.vectorSource.getExtent(), { padding: [50, 50, 50, 50], duration: 1000 });
  }
}
