import apiClient from './apiClient';
import type { Province, Ward } from '../types/location';

export const locationService = {
  getProvinces: async (): Promise<Province[]> => {
    const res = await apiClient.get('/locations/provinces');
    return res.data;
  },
  getWardsByProvince: async (provinceCode: string): Promise<Ward[]> => {
    const res = await apiClient.get(`/locations/provinces/${provinceCode}/wards`);
    return res.data;
  }
};
