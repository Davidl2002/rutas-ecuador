import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MapComponent } from './map/map.component';  // Asegúrate de importar MapComponent
import { EditarRutaComponent } from './editar-ruta/editar-ruta.component';  // Asegúrate de importar EditarRutaComponent

const routes: Routes = [
  { path: '', component: MapComponent },  // Ruta principal que muestra el mapa
  { path: 'editar-ruta', component: EditarRutaComponent }  // Ruta para editar la ruta
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
