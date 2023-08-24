import AsyncStorage from '@react-native-async-storage/async-storage';
import {InitialRegion} from '../screens/MapScreen';

const store = async (key: string, location: InitialRegion) => {
  try {
    const item = {
      location,
      timestap: Date.now(),
    };
    await AsyncStorage.setItem(key, JSON.stringify(item));
  } catch (error) {
    console.log(error);
  }
};

const get = async (key: string) => {
  try {
    const location = await AsyncStorage.getItem(key);
    const item = JSON.parse(location);

    if (!item) return null;

    return item.location;
  } catch (error) {
    console.log(error);
  }
};

export default {
  store,
  get,
};
