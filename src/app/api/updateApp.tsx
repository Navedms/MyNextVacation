import AppLink from 'react-native-app-link';
import {decode} from 'base-64';

export const fetchPackageJsonContentVersion = async () => {
  try {
    const response = await fetch(
      'https://api.github.com/repos/Navedms/MyNextVacation/contents/package.json',
    );
    const data = await response.json();

    if (response.ok && data && data.content) {
      const decodedContent = decode(data.content);
      const parsedContent = JSON.parse(decodedContent);
      return parsedContent.version;
    } else {
      console.error('Failed to fetch package.json content');
    }
  } catch (error) {
    console.error('Error while fetching package.json content:', error);
  }
};

export const gotoStore = () => {
  AppLink.openInStore({
    appName: 'My Next Vacation',
    appStoreId: Number('6450987187'),
    playStoreId: 'com.appn.mynextvacation',
    appStoreLocale: '',
  })
    .then(() => {})
    .catch(err => {});
};
