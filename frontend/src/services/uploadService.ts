import apiClient from './apiClient';

export interface UploadResponse {
  url: string;
}

const uploadService = {
  uploadImage: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const res = await apiClient.post<UploadResponse>('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    // Return full URL if it's relative
    const url = res.data.url;
    if (url.startsWith('/')) {
      return `${import.meta.env.VITE_API_URL}${url}`;
    }
    return url;
  },
};

export default uploadService;
