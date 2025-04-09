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
    private apiUrl = 'http://127.0.0.1:8000';

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
        return this.http.post<string[]>(`${this.apiUrl}/search/${algoritmo}`, {
            origen,
            destino
        });
    }

    addIntermediate(data: {
        ciudad1: string;
        ciudad2: string;
        nueva: string;
        distancia1: number;
        latitud: number;
        longitud: number;
    }): Observable<any> {
        return this.http.post(`${this.apiUrl}/graph/add-intermediate`, data);
    }

    deleteIntermediate(data: {
        intermedia: string;
        ciudad1: string;
        ciudad2: string;
    }): Observable<any> {
        return this.http.post(`${this.apiUrl}/graph/delete-intermediate`, data);
    }

    addNode(data: {
        ciudad_existente: string;
        nueva_ciudad: string;
        distancia: number;
        latitud: number;
        longitud: number;
    }): Observable<any> {
        return this.http.post(`${this.apiUrl}/graph/add-node`, data);
    }

    addRelationship(data: {
        ciudad1: string;
        ciudad2: string;
        distancia: number;
    }): Observable<any> {
        return this.http.post(`${this.apiUrl}/graph/add-relationship`, data);
    }

    deleteNode(data: {
        nombre_ciudad: string;
    }): Observable<any> {
        return this.http.post(`${this.apiUrl}/graph/delete-node`, data);
    }

    deleteRelationship(data: {
        ciudad1: string;
        ciudad2: string;
    }): Observable<any> {
        return this.http.post(`${this.apiUrl}/graph/delete-relationship`, data);
    }
}
