import type {
	ProvinciasResponse,
	MunicipiosResponse,
	DistritoMunicipalResponse,
	SeccionResponse,
	BarrioResponse,
	SubBarrioResponse,
	SelectOption
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

	async getSecciones(language: string, idDistrito: number): Promise<SelectOption[]> {
		if (!idDistrito) return [];
		
        try {
            const response = await apiClient.get<SeccionResponse>(`${API_ENDPOINTS.UBICACIONES.SECCIONES(idDistrito)}`, { params: { target: language, translate_fields: 'nombre', estado: 'activo' } });
            return (response.data.data || []).map((sec) => ({ value: String(sec.id), label: sec.nombre }));
        } catch (error) {
            console.error(`Error obteniendo secciones para distritoId ${idDistrito}:`, error);
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
};

export default ubicacionesService;
