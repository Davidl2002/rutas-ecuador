import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

interface CiudadData {
    coordenadas: {
        latitud: number;
        longitud: number;
    };
    vecinos: {
        [key: string]: number;
    };
}

export interface GrafoResponse {
    [key: string]: CiudadData;
}

@Injectable({
    providedIn: 'root'
})
export class MapService {
    private apiUrl = 'http://127.0.0.1:8000'; // Reemplaza con tu URL real

    constructor(private http: HttpClient) { }

    getGrafo(): Observable<GrafoResponse> {
        return this.http.get<GrafoResponse>(`${this.apiUrl}/graph`);
    }

    getCiudades(): Observable<string[]> {
        return this.getGrafo().pipe(
            map(grafo => Object.keys(grafo))
        );
    }

    getCoordenadas(): Observable<{ [key: string]: [number, number] }> {
        return this.getGrafo().pipe(
            map(grafo => {
                const coords: { [key: string]: [number, number] } = {};
                for (const ciudad in grafo) {
                    coords[ciudad] = [grafo[ciudad].coordenadas.latitud, grafo[ciudad].coordenadas.longitud];
                }
                return coords;
            })
        );
    }

    getGrafoSimple(): Observable<{ [key: string]: { [key: string]: number } }> {
        return this.getGrafo().pipe(
            map(grafo => {
                const grafoSimple: { [key: string]: { [key: string]: number } } = {};
                for (const ciudad in grafo) {
                    grafoSimple[ciudad] = grafo[ciudad].vecinos;
                }
                return grafoSimple;
            })
        );
    }

    calcularRuta(origen: string, destino: string, algoritmo: string): Observable<string[]> {
        return this.http.post<any[]>(`${this.apiUrl}/search/${algoritmo}`, {
            origen: origen,
            destino: destino
        });
    }

    // Función para eliminar una ciudad
    eliminarCiudad(data: any): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/graph/delete-city`, data);
    }

    // Función para agregar una ciudad
    agregarCiudad(data: any): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/graph/add-city`, data);
    }

}