import {create} from 'apisauce';

const apiClient = create({
  baseURL: `https://restcountries.com`,
});

export default apiClient;
