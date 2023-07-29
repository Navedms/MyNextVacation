import React, {useEffect, useRef, useState} from 'react';
import {
  Dimensions,
  PermissionsAndroid,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import ViewShot from 'react-native-view-shot';
import Geolocation from 'react-native-geolocation-service';
import Share from 'react-native-share';
var RNFS = require('react-native-fs');

import settings from '../../../package.json';
import Activityindicator from '../components/Activityindicator';
import Text from '../components/Text';
import Icon from '../components/Icon';
import MapView, {Marker} from 'react-native-maps';
import colors from '../config/colors';
import countriesApi from '../api/countries';
import {ApiResponse} from 'apisauce';
import Modal from '../components/AppModal';
import Button from '../components/Button';
import {fetchPackageJsonContentVersion, gotoStore} from '../api/updateApp';

interface InitialRegion {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

const MapScreen = () => {
  const [initialRegion, setInitialRegion] = useState<InitialRegion | null>(
    null,
  );
  const [myLocation, setMyLocation] = useState<InitialRegion | null>(null);
  const [isNewVersion, setIsNewVersion] = useState<string | null>(null);
  const [pressFirstLocation, setPressFirstLocation] = useState<boolean>(false);
  const [nowRenderMarkers, setNowRenderMarkers] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [open, setOpen] = useState<boolean>(false);
  const [openVersion, setOpenVersion] = useState<boolean>(false);
  const [rendomData, setRendomData] = useState<any>({});
  const [allData, setAllData] = useState<any>(null);
  const [selectData, setSelectData] = useState<any>([]);
  const mapRef = useRef<any>(null);
  const viewShotref = useRef<any>(null);

  const goToNextLocation = async () => {
    setNowRenderMarkers(false);
    const placeNumber = Math.floor(Math.random() * allData.length);
    const tempRandon = allData[placeNumber];
    const tempSelectData = [];
    for (let i = -3; i < 4; i++) {
      tempSelectData.push(
        allData[(allData.length + placeNumber - i) % allData.length],
      );
    }
    setRendomData(tempRandon);
    setSelectData(tempSelectData);

    const tempInitialRegion = {
      latitude: tempRandon.latlng[0],
      longitude: tempRandon.latlng[1],
      latitudeDelta: 3,
      longitudeDelta: 3,
    };
    setInitialRegion(tempInitialRegion);
    mapRef.current.animateToRegion(tempInitialRegion, 4000);
    !pressFirstLocation && setPressFirstLocation(true);
    setTimeout(() => {
      setNowRenderMarkers(true);
    }, 4000);
  };

  const goBackToMyLocation = () => {
    mapRef.current.animateToRegion(myLocation, 4000);
    setPressFirstLocation(false);
  };

  const setAllLocations = async () => {
    const result: ApiResponse<any> = await countriesApi.get();
    setAllData(sortLocationsByDistance(result.data));
  };

  const haversine = (x1, y1, x2, y2) => {
    let y = x2 - x1;
    let x = y2 - y1;

    return Math.sqrt(x * x + y * y);
  };

  const sortLocationsByDistance = locations => {
    const sortedLocations = [...locations].sort((a, b) => {
      const latDiff = a.latlng[0] - b.latlng[0];
      if (latDiff !== 0) {
        return latDiff;
      }
      return a.latlng[1] - b.latlng[1];
    });

    sortedLocations.forEach((loc, i) => {
      if (i < sortedLocations.length - 1) {
        const {latitude: lat1, longitude: lon1} = loc;
        const {latitude: lat2, longitude: lon2} = sortedLocations[i + 1];
        loc.distanceToNext = haversine(lat1, lon1, lat2, lon2);
      } else {
        loc.distanceToNext = null;
      }
    });

    return sortedLocations;
  };

  const requestLocationPermission = async () => {
    try {
      const granted =
        Platform.OS === 'android'
          ? await PermissionsAndroid.request(
              PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
              {
                title: 'Geolocation Permission',
                message: 'Can we access your location?',
                buttonNeutral: 'Ask Me Later',
                buttonNegative: 'Cancel',
                buttonPositive: 'OK',
              },
            )
          : await Geolocation.requestAuthorization('whenInUse');

      if (granted === 'granted') {
        return true;
      } else {
        return false;
      }
    } catch (err) {
      return false;
    }
  };

  const numberWithCommas = (number: number) => {
    return number ? number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') : 0;
  };

  const getLocation = () => {
    const result = requestLocationPermission();

    result.then(res => {
      if (res) {
        Geolocation.getCurrentPosition(
          position => {
            setInitialRegion({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              latitudeDelta: 3,
              longitudeDelta: 3,
            });
            setMyLocation({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              latitudeDelta: 3,
              longitudeDelta: 3,
            });
          },
          error => {
            console.log(error.code, error.message);
          },
          {
            accuracy: {android: 'high', ios: 'best'},
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 10000,
          },
        );
      }
    });
  };

  const captureAndShareScreenshot = async () => {
    const takePhoto = await viewShotref.current.capture();

    RNFS.readFile(takePhoto, 'base64').then(async res => {
      let urlString = 'data:image/jpeg;base64,' + res;
      const options = {
        title: `Wow! Look where I'm going on vacation next time: ${rendomData?.name?.common}! Want to find out where your next vacation is gonna be too? just Download the app: AppStore: https://did.li/QNFCN | GooglePlay: https://did.li/3fjIw`,
        message: `Wow! Look where I'm going on vacation next time: ${rendomData?.name?.common}! Want to find out where your next vacation is gonna be too? just Download the app: AppStore: https://did.li/QNFCN | GooglePlay: https://did.li/3fjIw`,
        url: urlString,
        type: 'image/jpeg',
      };

      try {
        await Share.open(options);
      } catch (error: any) {}
    });
  };

  const checkVersionUpdate = async () => {
    const newVersion = await fetchPackageJsonContentVersion();
    if (
      Number(settings.version.split('.').join('')) <
      Number(newVersion.split('.').join(''))
    ) {
      setIsNewVersion(newVersion);
      setOpenVersion(true);
    } else {
      setIsNewVersion(null);
    }
  };

  useEffect(() => {
    checkVersionUpdate();
    setAllLocations();
    getLocation();
  }, []);

  return (
    <ViewShot
      style={styles.container}
      ref={viewShotref}
      options={{format: 'jpg', quality: 0.9}}>
      <Activityindicator visible={loading} />
      {initialRegion && (
        <MapView
          removeClippedSubviews={true}
          ref={mapRef}
          style={styles.map}
          initialRegion={initialRegion}
          // onRegionChange={() => setLoading(true)}
          onMapReady={() => setLoading(false)}
          // onRegionChangeComplete={() => setLoading(false)}
        >
          {pressFirstLocation &&
            selectData?.map((item: any) => (
              <Marker
                coordinate={{
                  latitude: item.latlng[0],
                  longitude: item.latlng[1],
                }}
                tappable={true}
                style={Platform.OS === 'android' && styles.marker}
                key={`marker-id-${item?.name?.common}`}
                onPress={() => {
                  Object.keys(item).length > 0 ? setOpen(true) : undefined;
                  setRendomData(item);
                  const newInitialRegion = {
                    latitude: item.latlng[0],
                    longitude: item.latlng[1],
                    latitudeDelta: 3,
                    longitudeDelta: 3,
                  };
                  setInitialRegion(newInitialRegion);
                  mapRef.current.animateToRegion(newInitialRegion, 500);
                }}>
                <View style={[styles.markerTitle]}>
                  <Text
                    style={[
                      styles.markerText,
                      item?.name?.official === rendomData.name.official && {
                        backgroundColor: colors.opacityMarker,
                      },
                    ]}>
                    {item?.name?.common}
                  </Text>
                </View>
                <Icon
                  name="map-marker"
                  size={50}
                  iconColor={
                    item?.name?.official === rendomData.name.official
                      ? colors.marker
                      : colors.darkMedium
                  }
                />
              </Marker>
            ))}
          {myLocation && !pressFirstLocation && (
            <Marker
              coordinate={{
                latitude: myLocation.latitude,
                longitude: myLocation.longitude,
              }}
              tappable={false}
              style={Platform.OS === 'android' && styles.marker}
              key={`marker-id-myLocation`}>
              <View style={styles.markerTitle}>
                <Text style={styles.markerRendomText}>{'My location'}</Text>
              </View>
              <Icon name="map-marker" size={50} iconColor={colors.marker} />
            </Marker>
          )}
        </MapView>
      )}
      <View style={styles.randomContainer}>
        <Text style={styles.title}>Where Should You Go On Vacation Next?</Text>
        <View style={styles.containerBtns}>
          <TouchableOpacity
            style={styles.myLocation}
            onPress={goBackToMyLocation}>
            <Icon
              name="my-location"
              type="MaterialIcons"
              size={20}
              iconColor={colors.dark}
            />
          </TouchableOpacity>
          <TouchableOpacity
            disabled={loading}
            onPress={goToNextLocation}
            style={[
              styles.btn,
              loading && styles.disabled,
              pressFirstLocation && styles.pressFirstLocation,
            ]}>
            <Text style={styles.btnText}>
              {pressFirstLocation ? `Let's try again...` : `Let's find out!`}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.share, !pressFirstLocation && {opacity: 0.5}]}
            activeOpacity={0.5}
            onPress={
              pressFirstLocation ? captureAndShareScreenshot : undefined
            }>
            <Icon name="share" size={20} iconColor={colors.white} />
          </TouchableOpacity>
        </View>
      </View>
      <Modal
        visible={open}
        setVisible={setOpen}
        closeBtnText={'Close'}
        closeBtnbackgroundColor={'dark'}>
        <ScrollView contentContainerStyle={styles.modal}>
          <Text
            style={
              styles.modalTitle
            }>{`${rendomData?.name?.common} ${rendomData?.flag}`}</Text>
          <View style={styles.modalItem}>
            <Text style={styles.modalKey}>Official name:</Text>
            <Text style={styles.modalValue}>{rendomData?.name?.official}</Text>
          </View>
          <View style={styles.modalItem}>
            <Text style={styles.modalKey}>Currencies:</Text>
            <Text style={styles.modalValue}>
              {rendomData?.currencies &&
                Object.values(rendomData?.currencies)
                  .map(item => `${item.name} (${item.symbol})`)
                  .join(', ')}
            </Text>
          </View>
          <View style={styles.modalItem}>
            <Text style={styles.modalKey}>Capital:</Text>
            <Text style={styles.modalValue}>
              {rendomData?.capital?.join(', ')}
            </Text>
          </View>
          <View style={styles.modalItem}>
            <Text style={styles.modalKey}>Languages:</Text>
            <Text style={styles.modalValue}>
              {rendomData?.languages &&
                Object.values(rendomData?.languages)
                  .map(item => `${item}`)
                  .join(', ')}
            </Text>
          </View>
          <View style={styles.modalItem}>
            <Text style={styles.modalKey}>Population:</Text>
            <Text style={styles.modalValue}>
              {numberWithCommas(rendomData?.population)}
            </Text>
          </View>
          <View style={styles.modalItem}>
            <Text style={styles.modalKey}>Region:</Text>
            <Text style={styles.modalValue}>{rendomData?.region}</Text>
          </View>
          <View style={styles.modalItem}>
            <Text style={styles.modalKey}>Continents:</Text>
            <Text style={styles.modalValue}>
              {rendomData?.continents?.join(', ')}
            </Text>
          </View>
          <View style={styles.modalItem}>
            <Text style={styles.modalKey}>Timezones:</Text>
            <Text style={styles.modalValue}>
              {rendomData?.timezones?.join(', ')}
            </Text>
          </View>
          <View style={styles.modalItem}>
            <Text style={styles.modalKey}>First day of the week:</Text>
            <Text style={styles.modalValue}>{rendomData?.startOfWeek}</Text>
          </View>
        </ScrollView>
      </Modal>
      <Modal
        visible={openVersion}
        setVisible={setOpenVersion}
        closeBtnText={'Close'}
        closeBtnbackgroundColor={'dark'}
        style={{height: Platform.OS === 'android' ? '35%' : '30%'}}>
        <View style={styles.container}>
          <Text style={styles.versionTitle}>A new version is out:</Text>
          <Text style={styles.versionTitle}>{`version ${isNewVersion}`}</Text>
          <Button onPress={gotoStore} title="Download" />
        </View>
      </Modal>
    </ViewShot>
  );
};

export default MapScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  randomContainer: {
    backgroundColor: colors.opacityBlack,
    position: 'absolute',
    zIndex: 1,
    bottom: 0,
    left: 0,
    width: '100%',
    padding: 15,
    paddingBottom: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: colors.white,
    fontSize: 16,
  },
  containerBtns: {
    marginTop: 20,
    marginBottom: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  btn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  pressFirstLocation: {
    backgroundColor: colors.secondary,
  },
  btnText: {
    fontWeight: 'bold',
    color: colors.white,
  },
  disabled: {
    opacity: 0.5,
  },
  marker: {
    width: Dimensions.get('screen').width,
    height: 74,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  markerTitle: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 0 : -20,
    left:
      Platform.OS === 'android'
        ? 0
        : -(Dimensions.get('screen').width / 2) * 0.87,
    justifyContent: 'center',
    alignItems: 'center',
    width: Dimensions.get('screen').width,
    zIndex: 1,
  },
  markerText: {
    textAlign: 'center',
    color: colors.white,
    backgroundColor: colors.opacityBlack,
    paddingHorizontal: 6,
  },
  markerRendomText: {
    textAlign: 'center',
    color: colors.white,
    backgroundColor: colors.opacityMarker,
    paddingHorizontal: 6,
  },
  myLocation: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.darkMedium,
    width: 40,
    height: 40,
    borderRadius: 20,
    zIndex: 5,
  },
  share: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderWidth: 1,
    borderColor: colors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    zIndex: 5,
  },
  modal: {
    justifyContent: 'flex-start',
    alignItems: Platform.OS === 'android' ? 'flex-end' : 'flex-start',
    marginBottom: 20,
  },
  modalTitle: {
    paddingBottom: 30,
    fontSize: 20,
    textAlign: 'center',
    width: '100%',
    fontWeight: 'bold',
  },
  modalItem: {
    marginVertical: 5,
    justifyContent: 'flex-start',
    alignItems: Platform.OS === 'android' ? 'flex-end' : 'flex-start',
    width: '90%',
  },
  modalKey: {
    fontWeight: 'bold',
    paddingEnd: 5,
  },
  modalValue: {
    color: colors.dark,
  },
  versionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.black,
  },
});
