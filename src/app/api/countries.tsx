import client from './client';

const endpoint = '/v3.1/all';

const get = () => client.get(endpoint);

export default {
  get,
};
