import type {
    ProvinciasResponse,
    MunicipiosResponse,
    DistritoMunicipalResponse,
    SeccionResponse,
    BarrioResponse,
    SubBarrioResponse,
    SelectOption,
    CreateLocationResponse,
    UpdateLocationResponse,
    createLocationRequest,
    UpdateLocationRequest
} from './ubicaciones.types';
import apiClient from '@/services/api/client';
import API_ENDPOINTS from '@/services/api/endpoints';

const ubicacionesService = {
    async getProvincias(language: string): Promise<SelectOption[]> {
        try {
            const response = await apiClient.get<ProvinciasResponse>(`${API_ENDPOINTS.UBICACIONES.PROVINCIAS}`, { params: { target: language, translate_fields: 'nombre', estado: 'activo' } });
            return (response.data.data || []).map((prov) => ({ value: prov.id.toString(), label: prov.nombre }));
        } catch (error) {
            console.error("Error obteniendo provincias:", error);
            return [];
        }
    },

    async getMunicipios(language: string, idProvincia: number): Promise<SelectOption[]> {
        if (!idProvincia) return [];

        try {
            const response = await apiClient.get<MunicipiosResponse>(`${API_ENDPOINTS.UBICACIONES.MUNICIPIOS(idProvincia)}`, { params: { target: language, translate_fields: 'nombre', estado: 'activo' } });
            return (response.data.data || []).map((mun) => ({ value: String(mun.id), label: mun.nombre }));
        } catch (error) {
            console.error(`Error obteniendo municipios para provinciaId ${idProvincia}:`, error);
            return [];
        }
    },

    async getDistritos(language: string, idMunicipio: number): Promise<SelectOption[]> {
        if (!idMunicipio) return [];

        try {
            const response = await apiClient.get<DistritoMunicipalResponse>(`${API_ENDPOINTS.UBICACIONES.DISTRITOS(idMunicipio)}`, { params: { target: language, translate_fields: 'nombre', estado: 'activo' } });
            return (response.data.data || []).map((dist) => ({ value: String(dist.id), label: dist.nombre }));
        } catch (error) {
            console.error(`Error obteniendo distritos para municipioId ${idMunicipio}:`, error);
            return [];
        }
    },

    async getSecciones(language: string, params: any): Promise<SelectOption[]> {
        if (!params) return [];

        try {
            if (params.idDistrito) {
                const response = await apiClient.get<SeccionResponse>(`${API_ENDPOINTS.UBICACIONES.SECCIONESBYDISTRITO(params.idDistrito)}`);
                return (response.data.data || []).map((sec) => ({ value: String(sec.id), label: sec.nombre }));
            } else if (params.idMunicipio) {
                const response = await apiClient.get<SeccionResponse>(`${API_ENDPOINTS.UBICACIONES.SECCIONESBYMUNICIPIO(params.idMunicipio)}`);
                return (response.data.data || []).map((sec) => ({ value: String(sec.id), label: sec.nombre }));
            } else {
                console.warn("No se proporcionó idDistrito ni idMunicipio para obtener secciones.");
                return [];
            }
        } catch (error) {
            console.error(`Error obteniendo secciones para params ${JSON.stringify(params)}:`, error);
            return [];
        }
    },

    async getBarrios(language: string, idSeccion: number): Promise<SelectOption[]> {
        if (!idSeccion) return [];

        try {
            const response = await apiClient.get<BarrioResponse>(`${API_ENDPOINTS.UBICACIONES.BARRIOS(idSeccion)}`, { params: { target: language, translate_fields: 'nombre', estado: 'activo' } });
            return (response.data.data || []).map((bar) => ({ value: String(bar.id), label: bar.nombre }));
        } catch (error) {
            console.error(`Error obteniendo barrios para seccionId ${idSeccion}:`, error);
            return [];
        }
    },

    async getSubbarrios(language: string, idBarrio: number): Promise<SelectOption[]> {
        if (!idBarrio) return [];

        try {
            const response = await apiClient.get<SubBarrioResponse>(`${API_ENDPOINTS.UBICACIONES.SUBBARRIOS(idBarrio)}`, { params: { target: language, translate_fields: 'nombre', estado: 'activo' } });
            return (response.data.data || []).map((sub) => ({ value: String(sub.id), label: sub.nombre }));
        } catch (error) {
            console.error(`Error obteniendo subbarrios para barrioId ${idBarrio}:`, error);
            return [];
        }
    },

    async getGeoPointsByBarrios(idBarrio: number): Promise<any> {
        if (!idBarrio) return [];
        try {
            const response = await apiClient.get(`${API_ENDPOINTS.UBICACIONES.GEOPOINTS_BY_BARRIOS(idBarrio)}`);
            return response.data.data || {};
        } catch (error) {
            console.error(`Error obteniendo geo points para barriosId ${idBarrio}:`, error);
            return {};
        }
    },

    async getDataBarrioFromGeoPoint(lng: number, lat: number): Promise<any> {
        if (!lng || !lat) return [];
        try {
            const response = await apiClient.get(`${API_ENDPOINTS.UBICACIONES.BARRIO_BY_GEOPOINT}`, { params: { longitud: lng, latitud: lat } });
            return response.data.data || {};
        } catch (error) {
            console.error(`Error obteniendo geo points para lat ${lat}, lng ${lng}:`, error);
            return {};
        }
    },

    async getLocationsByDoctor(language: string, source: string, params: any): Promise<any> {
        try {
            const response = await apiClient.get(`${API_ENDPOINTS.UBICACIONES.LOCATIONS_BY_DOCTOR}`, { params: { target: language, source: source, translate_fields: 'nombre' } });
            return (response.data.data || []);
        } catch (error) {
            console.error(`Error obteniendo ubicaciones para doctorId ${params.doctorId}:`, error);
            return [];
        }
    },

    async createLocation(data: createLocationRequest): Promise<CreateLocationResponse> {
        try {
            const response = await apiClient.post(`${API_ENDPOINTS.UBICACIONES.CREATE_LOCATION}`, data);
            return response.data;
        } catch (error) {
            console.error(`Error creando ubicación:`, error);
            throw error;
        }
    },

    async createLocationForHealthCenter(data: createLocationRequest): Promise<CreateLocationResponse> {
        try {
            const response = await apiClient.post(`${API_ENDPOINTS.UBICACIONES.CREATE_LOCATION_FOR_HEALTH_CENTER}`, data);
            return response.data;
        } catch (error) {
            console.error(`Error creando ubicación para centro de salud:`, error);
            throw error;
        }
    },

    async getLocationById(id: number): Promise<any> {
        try {
            const response = await apiClient.get(`${API_ENDPOINTS.UBICACIONES.LOCATION_BY_ID(id)}`);
            return response.data || {};
        } catch (error) {
            console.error(`Error obteniendo ubicación por id ${id}:`, error);
            return {};
        }
    },

    async updateLocation(id: number, data: UpdateLocationRequest): Promise<UpdateLocationResponse> {
        try {
            const response = await apiClient.put(`${API_ENDPOINTS.UBICACIONES.LOCATION_BY_ID(id)}`, data);
            return response.data;
        } catch (error) {
            console.error(`Error actualizando ubicación con id ${id}:`, error);
            throw error;
        }
    },

    async updateCenterLocation(data: { locationId: number; barrioId: number; direccion: string; codigoPostal?: string; coordinates: { latitude: number; longitude: number } }): Promise<any> {
        try {
            const response = await apiClient.put(`/ubicaciones/${data.locationId}`, {
                barrioId: data.barrioId,
                direccion: data.direccion,
                codigoPostal: data.codigoPostal,
                puntoGeografico: {
                    type: "Point",
                    coordinates: [data.coordinates.longitude, data.coordinates.latitude]
                }
            });

            return response.data;
        } catch (error) {
            console.error(`Error actualizando la ubicación del centro de salud:`, error);
            throw error;
        }
    }
};

export default ubicacionesService;
