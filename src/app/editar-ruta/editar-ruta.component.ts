import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { MapService } from '../map/map.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-editar-ruta',
  templateUrl: './editar-ruta.component.html',
  styleUrls: ['./editar-ruta.component.scss']
})
export class EditarRutaComponent implements OnInit {
  ciudades: any[] = [];
  ciudadesRelacionadas: any[] = [];
  mostrarFormularioFlag: boolean = false;
  ciudad1Selected: boolean = false;

  @ViewChild('nombre') nombreInput!: ElementRef;
  @ViewChild('latitud') latitudInput!: ElementRef;
  @ViewChild('longitud') longitudInput!: ElementRef;
  @ViewChild('ciudad1') ciudad1Input!: ElementRef;
  @ViewChild('ciudad2') ciudad2Input!: ElementRef;
  @ViewChild('distancia1') distancia1Input!: ElementRef;

  constructor(private mapService: MapService, private router: Router) {}

  ngOnInit(): void {
    this.cargarCiudades();
  }

  volverInicio(): void {
    this.router.navigate(['/']);
  }

  cargarCiudades(): void {
    this.mapService.getGrafo().subscribe({
      next: (grafo) => {
        this.ciudades = Object.keys(grafo).map((nombre) => ({
          name: nombre,
          vecinos: grafo[nombre].vecinos,
        }));
      },
      error: (err) => console.error('Error al cargar ciudades:', err),
    });
  }

  eliminarCiudad(ciudad: any): void {
    if (confirm(`¿Estás seguro de eliminar ${ciudad.name}?`)) {
      const data = {
        nombre_ciudad: ciudad.name,
      };
      this.mapService.deleteNode(data).subscribe({
        next: () => {
          alert('Ciudad eliminada correctamente.');
          this.cargarCiudades();
        },
        error: (err) => console.error('Error al eliminar ciudad:', err),
      });
    }
  }

  mostrarFormulario(): void {
    this.mostrarFormularioFlag = !this.mostrarFormularioFlag;
  }

  agregarCiudad(): void {
    const nombre = this.nombreInput.nativeElement.value;
    const latitud = parseFloat(this.latitudInput.nativeElement.value);
    const longitud = parseFloat(this.longitudInput.nativeElement.value);
    const ciudad1 = this.ciudad1Input.nativeElement.value;
    const ciudad2 = this.ciudad2Input.nativeElement.value;
    const distancia1 = parseFloat(this.distancia1Input.nativeElement.value);

    if (ciudad2) {
      // Si hay dos ciudades, agregamos una intermedia
      const intermedia = {
        ciudad1,
        ciudad2,
        nueva: nombre,
        distancia1,
        latitud,
        longitud,
      };
      this.mapService.addIntermediate(intermedia).subscribe({
        next: () => {
          alert('Ciudad intermedia agregada correctamente.');
          this.cargarCiudades();
          this.mostrarFormularioFlag = false;
        },
        error: (err) => console.error('Error al agregar ciudad intermedia:', err),
      });
    } else {
      // Si solo hay una ciudad, agregamos nodo simple
      const nodo = {
        ciudad_existente: ciudad1,
        nueva_ciudad: nombre,
        distancia: distancia1,
        latitud,
        longitud,
      };
      this.mapService.addNode(nodo).subscribe({
        next: () => {
          alert('Ciudad agregada correctamente.');
          this.cargarCiudades();
          this.mostrarFormularioFlag = false;
        },
        error: (err) => console.error('Error al agregar ciudad:', err),
      });
    }
  }

  onCiudad1Change(ciudad1: string): void {
    this.ciudad1Selected = !!ciudad1;
    this.ciudadesRelacionadas = this.ciudades.filter((ciudad) => 
      ciudad.vecinos && ciudad.vecinos[ciudad1]
    );
  }
}
