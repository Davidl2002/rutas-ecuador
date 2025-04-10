import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { MapService } from '../map/map.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-editar-ruta',
  templateUrl: './editar-ruta.component.html',
  styleUrls: ['./editar-ruta.component.scss']
})
export class EditarRutaComponent implements OnInit {
  Object = Object;
  ciudades: any[] = [];
  ciudadesRelacionadas: any[] = [];
  filteredCiudades: any[] = [];

  // Modales
  showConfirmModal: boolean = false;
  showModal: boolean = false;
  showAddCityModal: boolean = false;
  showAddRelationshipModal: boolean = false;

  // Tipos de acción
  actionType: 'node' | 'relationship' | 'intermediate' = 'node';
  ciudadToDelete: any;
  ciudadRelaciones: any[] = [];

  // Estados de carga
  loadingCiudades: boolean = false;
  loadingEliminar: boolean = false;
  loadingAgregar: boolean = false;
  loadingRelacion: boolean = false;
  loadingIntermedia: boolean = false;

  // Referencias a elementos del formulario
  @ViewChild('nombre') nombreInput!: ElementRef;
  @ViewChild('latitud') latitudInput!: ElementRef;
  @ViewChild('longitud') longitudInput!: ElementRef;
  @ViewChild('ciudad1') ciudad1Input!: ElementRef;
  @ViewChild('ciudad2') ciudad2Input!: ElementRef;
  @ViewChild('distancia1') distancia1Input!: ElementRef;
  @ViewChild('ciudadRel1') ciudadRel1Input!: ElementRef;
  @ViewChild('ciudadRel2') ciudadRel2Input!: ElementRef;
  @ViewChild('distanciaRel') distanciaRelInput!: ElementRef;
  @ViewChild('intermedia') intermediaInput!: ElementRef;
  @ViewChild('ciudadInt1') ciudadInt1Input!: ElementRef;
  @ViewChild('ciudadInt2') ciudadInt2Input!: ElementRef;

  constructor(private mapService: MapService, private router: Router) {
   }

  ngOnInit(): void {
    this.cargarCiudades();
  }

  volverInicio(): void {
    this.router.navigate(['/']);
  }

  cargarCiudades(): void {
    this.loadingCiudades = true;
    this.mapService.getGrafo().subscribe({
      next: (grafo) => {
        this.ciudades = Object.keys(grafo).map((nombre) => ({
          name: nombre,
          vecinos: grafo[nombre].vecinos || {} // Asegura que vecinos siempre sea un objeto
        }));
        this.filteredCiudades = [...this.ciudades];
        this.loadingCiudades = false;
      },
      error: (err) => {
        console.error('Error al cargar ciudades:', err);
        this.loadingCiudades = false;
      },
    });
  }

  filtrarCiudades(event: any): void {
    const searchTerm = event.target.value.toLowerCase();
    if (searchTerm === '') {
      this.filteredCiudades = [...this.ciudades];
    } else {
      this.filteredCiudades = this.ciudades.filter(ciudad =>
        ciudad.name.toLowerCase().includes(searchTerm)
      );
    }
  }

  eliminarCiudad(ciudad: any): void {
    if (!ciudad || !ciudad.vecinos) return;

    this.ciudadToDelete = ciudad;
    this.ciudadRelaciones = Object.keys(ciudad.vecinos).map(key => ({
      name: key,
      distancia: ciudad.vecinos[key]
    }));
    this.showModal = true;
    this.showConfirmModal = false;
    this.actionType = 'node';
  }

  eliminarNodo(): void {
    if (!this.ciudadToDelete) return;

    this.loadingEliminar = true;
    const data = { nombre_ciudad: this.ciudadToDelete.name };
    this.mapService.deleteNode(data).subscribe({
      next: () => {
        alert('Ciudad eliminada correctamente.');
        this.cargarCiudades();
        this.closeModal();
        this.loadingEliminar = false;
      },
      error: (err) => {
        console.error('Error al eliminar ciudad:', err);
        this.loadingEliminar = false;
      },
    });
  }

  eliminarRelacion(relacion: any): void {
    if (!this.ciudadToDelete || !relacion) return;

    this.loadingEliminar = true;
    const data = {
      ciudad1: this.ciudadToDelete.name,
      ciudad2: relacion.name,
    };
    this.mapService.deleteRelationship(data).subscribe({
      next: () => {
        alert('Relación eliminada correctamente.');
        this.cargarCiudades();
        this.closeModal();
        this.loadingEliminar = false;
      },
      error: (err) => {
        console.error('Error al eliminar relación:', err);
        this.loadingEliminar = false;
      },
    });
  }

  eliminarCiudadIntermedia(): void {
    if (!this.ciudadToDelete) return;

    this.loadingEliminar = true;

    const ciudad1 = this.ciudadInt1Input?.nativeElement?.value;
    const ciudad2 = this.ciudadInt2Input?.nativeElement?.value;

    if (!ciudad1 || !ciudad2 || ciudad1 === ciudad2) {
      alert('Debe seleccionar dos ciudades diferentes.');
      this.loadingEliminar = false;
      return;
    }

    const data = {
      intermedia: this.ciudadToDelete.name,
      ciudad1,
      ciudad2,
    };

    console.log(data)

    this.mapService.deleteIntermediate(data).subscribe({
      next: () => {
        alert('Ciudad intermedia eliminada correctamente.');
        this.cargarCiudades();
        this.closeModal();
        this.loadingEliminar = false;
      },
      error: (err) => {
        console.error('Error al eliminar ciudad intermedia:', err);
        this.loadingEliminar = false;
      },
    });
  }

  closeModal(): void {
    this.showModal = false;
    this.showAddCityModal = false;
    this.showAddRelationshipModal = false;
    this.ciudadToDelete = null;
    this.ciudadRelaciones = [];
  }

  openAddCityModal(): void {
    this.showAddCityModal = true;
  }

  openAddRelationshipModal(): void {
    this.showAddRelationshipModal = true;
  }

  agregarCiudad(): void {
    this.loadingAgregar = true;
    const nombre = this.nombreInput?.nativeElement?.value;
    const latitud = parseFloat(this.latitudInput?.nativeElement?.value || '0');
    const longitud = parseFloat(this.longitudInput?.nativeElement?.value || '0');
    const ciudad1 = this.ciudad1Input?.nativeElement?.value;
    const ciudad2 = this.ciudad2Input?.nativeElement?.value;
    const distancia1 = parseFloat(this.distancia1Input?.nativeElement?.value || '0');

    if (!nombre || !ciudad1) {
      alert('Debe completar los campos obligatorios.');
      this.loadingAgregar = false;
      return;
    }

    if (ciudad2) {
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
          this.closeModal();
          this.loadingAgregar = false;
        },
        error: (err) => {
          console.error('Error al agregar ciudad intermedia:', err);
          this.loadingAgregar = false;
        },
      });
    } else {
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
          this.closeModal();
          this.loadingAgregar = false;
        },
        error: (err) => {
          console.error('Error al agregar ciudad:', err);
          this.loadingAgregar = false;
        },
      });
    }
  }

  agregarRelacion(): void {
    this.loadingRelacion = true;
    const ciudad1 = this.ciudadRel1Input?.nativeElement?.value;
    const ciudad2 = this.ciudadRel2Input?.nativeElement?.value;
    const distancia = parseFloat(this.distanciaRelInput?.nativeElement?.value || '0');

    if (!ciudad1 || !ciudad2 || ciudad1 === ciudad2) {
      alert('Debe seleccionar dos ciudades diferentes.');
      this.loadingRelacion = false;
      return;
    }

    const data = {
      ciudad1,
      ciudad2,
      distancia,
    };

    this.mapService.addRelationship(data).subscribe({
      next: () => {
        alert('Relación agregada correctamente.');
        this.cargarCiudades();
        this.closeModal();
        this.loadingRelacion = false;
      },
      error: (err) => {
        console.error('Error al agregar relación:', err);
        this.loadingRelacion = false;
      },
    });
  }

  onCiudad1Change(ciudad1: string): void {
    this.ciudadesRelacionadas = this.ciudades.filter((ciudad) =>
      ciudad?.vecinos && ciudad.vecinos[ciudad1]
    );
  }

  abrirConfirmacionEliminar(ciudad: any): void {
    if (!ciudad) return;
    this.ciudadToDelete = ciudad;
    this.showConfirmModal = true;
  }

  closeConfirmModal(): void {
    this.showConfirmModal = false;
    this.ciudadToDelete = null;
  }

  esCiudadIntermedia(ciudad: any): boolean {
    if (!ciudad || !ciudad.vecinos || typeof ciudad.vecinos !== 'object') {
      return false;
    }

    const vecinos = Object.keys(ciudad.vecinos);

    if (vecinos.length < 2) {
      return false;
    }

    for (let i = 0; i < vecinos.length; i++) {
      for (let j = i + 1; j < vecinos.length; j++) {
        const ciudadA = this.ciudades.find(c => c && c.name === vecinos[i]);
        const ciudadB = this.ciudades.find(c => c && c.name === vecinos[j]);

        if (ciudadA?.vecinos?.[vecinos[j]] && ciudadB?.vecinos?.[vecinos[i]]) {
          return true;
        }
      }
    }

    return false;
  }
}