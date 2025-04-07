import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { MapService } from '../map/map.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-editar-ruta',
  templateUrl: './editar-ruta.component.html',
  styleUrls: ['./editar-ruta.component.scss']
})
export class EditarRutaComponent implements OnInit {
  ciudades: any[] = []; // Lista de ciudades con sus vecinos y distancias
  mostrarFormularioFlag: boolean = false; // Flag para mostrar el formulario

  // Usamos ViewChild para acceder a los elementos del formulario
  @ViewChild('nombre') nombreInput!: ElementRef;
  @ViewChild('latitud') latitudInput!: ElementRef;
  @ViewChild('longitud') longitudInput!: ElementRef;
  @ViewChild('vecinos') vecinosInput!: ElementRef;

  constructor(private mapService: MapService, private router: Router) { }

  ngOnInit(): void {
    this.cargarCiudades(); // Cargar ciudades y sus relaciones
    console.log('Se ha cargado el componente Editar Ruta');
  }

  // Función para cargar las ciudades con sus relaciones
  cargarCiudades(): void {
    this.mapService.getGrafoSimple().subscribe({
      next: (grafo) => {
        this.ciudades = Object.keys(grafo).map((ciudad) => ({
          name: ciudad,
          vecinos: grafo[ciudad],
          distancia: Object.values(grafo[ciudad]).reduce((sum, dist) => sum + dist, 0) // Sumar todas las distancias
        }));
      },
      error: (err) => console.error('Error al cargar ciudades:', err)
    });
  }

  // Función para eliminar una ciudad
  eliminarCiudad(ciudad: any): void {
    if (confirm(`¿Estás seguro de que deseas eliminar ${ciudad.name}?`)) {
      this.mapService.eliminarCiudad(ciudad.name).subscribe({
        next: () => {
          alert('Ciudad eliminada con éxito');
          this.cargarCiudades(); // Volver a cargar las ciudades
        },
        error: (err) => console.error('Error al eliminar ciudad:', err)
      });
    }
  }

  // Función para mostrar el formulario de agregar ciudad
  mostrarFormulario(): void {
    this.mostrarFormularioFlag = !this.mostrarFormularioFlag;
  }

  // Función para agregar nueva ciudad
  agregarCiudad(): void {
    const nombre = this.nombreInput.nativeElement.value;
    const latitud = this.latitudInput.nativeElement.value;
    const longitud = this.longitudInput.nativeElement.value;
    const vecinos = this.vecinosInput.nativeElement.value.split(',');

    const nuevaCiudad = {
      name: nombre,
      coordenadas: {
        latitud: parseFloat(latitud),
        longitud: parseFloat(longitud)
      },
      vecinos: vecinos.reduce((acc: any, vecino: string) => {
        acc[vecino.trim()] = 0; // Establecer distancia predeterminada
        return acc;
      }, {})
    };

    this.mapService.agregarCiudad(nuevaCiudad).subscribe({
      next: () => {
        alert('Ciudad agregada con éxito');
        this.cargarCiudades(); // Volver a cargar las ciudades
      },
      error: (err) => console.error('Error al agregar ciudad:', err)
    });
  }
}
