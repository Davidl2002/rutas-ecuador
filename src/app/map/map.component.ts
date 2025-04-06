import { Component, OnInit } from '@angular/core';
import * as L from 'leaflet';

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

  grafo: { [key: string]: { [key: string]: number } } = {
    'Ambato': {'Latacunga': 41, 'Riobamba': 54, 'Guaranda': 92, 'Baños': 40, 'Cuenca': 321, 'Azogues': 280, 'Machala': 413, 'Loja': 529, 'Puyo': 102},
    'Azogues': {'Ambato': 280, 'Cuenca': 41, 'Riobamba': 227},
    'Latacunga': {'Ambato': 41, 'Quito': 70, 'Riobamba': 105, 'Sto. Domingo': 154, 'Guaranda': 133, 'Guayaquil': 260},
    'Quito': {'Latacunga': 70, 'Riobamba': 165, 'Baños': 153},
    'Riobamba': {'Ambato': 54, 'Latacunga': 105, 'Quito': 165},
    'Baños': {'Ambato': 40, 'Riobamba': 53, 'Quito': 153},
  };

  coords: { [key: string]: [number, number] } = {
    'Ambato': [-1.2491, -78.6167],
    'Latacunga': [-0.9333, -78.6167],
    'Quito': [-0.2295, -78.5243],
    'Riobamba': [-1.6743, -78.6486],
    'Baños': [-1.3965, -78.4244],
    'Azogues': [-2.7381, -78.8455],
    'Cuenca': [-2.9006, -79.0045],
    'Guayaquil': [-2.1894, -79.8891],
    'Loja': [-3.9931, -79.2042],
    'Machala': [-3.2586, -79.9553],
    'Puyo': [-1.4833, -77.9833],
  };

  ruta: string[] = [];

  ngOnInit(): void {
    this.ciudades = Object.keys(this.grafo);
    this.initMap();
  
    setTimeout(() => {
      if (this.map) {
        this.map.invalidateSize();
      }
    }, 0);
  }
  

  initMap(): void {
    
    this.map = L.map('map').setView([-1.5, -78.5], 7);  
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);
  
    console.log('Mapa inicializado', this.map);
  }
  

  setOrigen(value: string) {
    this.origen = value;
  }

  setDestino(value: string) {
    this.destino = value;
  }

  setAlgoritmo(value: string) {
    this.algoritmo = value;
  }

  calcularRuta() {
    console.log('Origen:', this.origen, 'Destino:', this.destino, 'Algoritmo:', this.algoritmo);
  
    if (!this.origen || !this.destino || !this.algoritmo) {
      alert('Por favor, selecciona origen, destino y algoritmo.');
      return;
    }
  
    switch (this.algoritmo) {
      case 'DFS':
        this.ruta = this.dfs(this.origen, this.destino);
        break;
      case 'BFS':
        this.ruta = this.bfs(this.origen, this.destino);
        break;
      case 'UCS':
        this.ruta = this.ucs(this.origen, this.destino);
        break;
    }
  
    console.log('Ruta calculada:', this.ruta);
    this.mostrarRuta(this.ruta);
  }
  

  mostrarRuta(ciudades: string[]) {
    this.map.eachLayer((layer: any) => {
      if (layer instanceof L.Polyline || layer instanceof L.Circle) {
        this.map.removeLayer(layer);
      }
    });
  
    const puntos: L.LatLng[] = [];
  
    ciudades.forEach(ciudad => {
      const coord = this.coords[ciudad];
      if (coord) {
        console.log(`Ciudad: ${ciudad}, Coordenadas: ${coord}`);
  
        L.circle(coord, { radius: 5000, color: 'blue', fillOpacity: 0.5 })
          .addTo(this.map)
          .bindPopup(ciudad)
          .openPopup();
  
        puntos.push(L.latLng(coord[0], coord[1]));
      }
    });
  
    if (puntos.length > 1) {
      L.polyline(puntos, { color: 'red' }).addTo(this.map);
      this.map.fitBounds(L.polyline(puntos).getBounds());
    }
  }
  
  

  dfs(origen: string, destino: string): string[] {
    const visitados = new Set<string>();
    const camino: string[] = [];

    const dfsRecursivo = (actual: string): boolean => {
      if (visitados.has(actual)) return false;
      visitados.add(actual);
      camino.push(actual);

      if (actual === destino) return true;

      for (const vecino of Object.keys(this.grafo[actual] || {})) {
        if (dfsRecursivo(vecino)) return true;
      }

      camino.pop();
      return false;
    };

    dfsRecursivo(origen);
    return [...camino];
  }

  bfs(origen: string, destino: string): string[] {
    const cola: [string, string[]][] = [[origen, [origen]]];
    const visitados = new Set<string>();

    while (cola.length > 0) {
      const [ciudad, ruta] = cola.shift()!;
      if (ciudad === destino) return ruta;
      visitados.add(ciudad);

      for (const vecino of Object.keys(this.grafo[ciudad] || {})) {
        if (!visitados.has(vecino)) {
          cola.push([vecino, [...ruta, vecino]]);
          visitados.add(vecino);
        }
      }
    }

    return [];
  }

  ucs(origen: string, destino: string): string[] {
    const visitados = new Set<string>();
    const cola: [number, string[], string][] = [[0, [origen], origen]];

    while (cola.length > 0) {
      cola.sort((a, b) => a[0] - b[0]);
      const [costo, ruta, actual] = cola.shift()!;
      if (actual === destino) return ruta;

      if (visitados.has(actual)) continue;
      visitados.add(actual);

      for (const vecino in this.grafo[actual]) {
        if (!visitados.has(vecino)) {
          const nuevoCosto = costo + this.grafo[actual][vecino];
          cola.push([nuevoCosto, [...ruta, vecino], vecino]);
        }
      }
    }

    return [];
  }
}
