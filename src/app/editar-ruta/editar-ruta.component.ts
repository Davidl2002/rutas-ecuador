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
  @ViewChild('ciudad1') ciudad1Input!: ElementRef;
  @ViewChild('ciudad2') ciudad2Input!: ElementRef;
  @ViewChild('distancia1') distancia1Input!: ElementRef;

  constructor(private mapService: MapService, private router: Router) { }

  ngOnInit(): void {
    this.cargarCiudades(); // Cargar ciudades y sus relaciones
    console.log('Se ha cargado el componente Editar Ruta');
  }

  volverInicio(): void {
    this.router.navigate(['/']);
  }

  // Función para cargar las ciudades con sus relaciones
  cargarCiudades(): void {
    this.mapService.getGrafoSimple().subscribe({
      next: (grafo) => {
        this.ciudades = Object.keys(grafo).map((ciudad) => ({
          name: ciudad,
          vecinos: grafo[ciudad],
          distancia: Object.values(grafo[ciudad]).reduce((sum: number, dist: number) => sum + dist, 0) // Sumar todas las distancias
        }));
      },
      error: (err) => console.error('Error al cargar ciudades:', err)
    });
  }

  // Función para eliminar una ciudad
  eliminarCiudad(ciudad: any): void {
    if (confirm(`¿Estás seguro de que deseas eliminar ${ciudad.name}?`)) {
      const data: any = {
        intermedia: ciudad.name,
        ciudad1: "Ambato",
        ciudad2: "Baños",
      }
      this.mapService.eliminarCiudad(data).subscribe({
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
    this.mostrarFormularioFlag = true;
  }

  // Función para agregar nueva ciudad
  agregarCiudad(event?: Event): void {
    event?.preventDefault();
    const nombre = this.nombreInput.nativeElement.value;
    const latitud = parseFloat(this.latitudInput.nativeElement.value);
    const longitud = parseFloat(this.longitudInput.nativeElement.value);
    const ciudad1 = this.ciudad1Input.nativeElement.value;
    const ciudad2 = this.ciudad2Input.nativeElement.value;
    const distancia1 = parseFloat(this.distancia1Input.nativeElement.value);
    const nuevaCiudad = {
      ciudad1: ciudad1,
      ciudad2: ciudad2 || null,
      nueva: nombre,
      distancia1: distancia1,
      latitud: latitud,
      longitud: longitud
    };
    console.log(nuevaCiudad)

    this.mapService.agregarCiudad(nuevaCiudad).subscribe({
      next: () => {
        alert('Ciudad agregada con éxito');
        this.cargarCiudades();
        this.mostrarFormularioFlag = false;
        // Limpiar formulario
        this.nombreInput.nativeElement.value = '';
        this.latitudInput.nativeElement.value = '';
        this.longitudInput.nativeElement.value = '';
        this.distancia1Input.nativeElement.value = '';
      },
      error: (err) => console.error('Error al agregar ciudad:', err)
    });
  }
}