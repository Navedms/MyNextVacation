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
import Geolocation from 'react-native-geolocation-service';

import Activityindicator from '../components/Activityindicator';
import Text from '../components/Text';
import Icon from '../components/Icon';
import MapView, {Marker} from 'react-native-maps';
import colors from '../config/colors';
import countriesApi from '../api/countries';
import {ApiResponse} from 'apisauce';
import Modal from '../components/AppModal';

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
  const [pressFirstLocation, setPressFirstLocation] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);
  const [rendomData, setRendomData] = useState<any>({});
  const [allData, setAllData] = useState<any>(null);
  const mapRef = useRef<any>(null);

  const goToNextLocation = async () => {
    setLoading(true);
    const result: ApiResponse<any> = allData
      ? allData
      : await countriesApi.get();
    setAllData(result);
    const placeNumber = Math.floor(Math.random() * result.data.length);
    const tempRandon = result.data[placeNumber];
    setRendomData(tempRandon);

    const tempInitialRegion = {
      latitude: tempRandon.latlng[0],
      longitude: tempRandon.latlng[1],
      latitudeDelta: 3,
      longitudeDelta: 3,
    };
    setInitialRegion(tempInitialRegion);
    mapRef.current.animateToRegion(tempInitialRegion, 4000);
    setPressFirstLocation(true);
    setLoading(false);
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
    setLoading(true);
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
      setLoading(false);
    });
  };

  useEffect(() => {
    getLocation();
  }, []);

  return (
    <View style={styles.container}>
      <Activityindicator visible={loading} />
      {initialRegion && (
        <MapView
          removeClippedSubviews={true}
          ref={mapRef}
          style={styles.map}
          initialRegion={initialRegion}>
          <Marker
            coordinate={{
              latitude: initialRegion.latitude,
              longitude: initialRegion.longitude,
            }}
            tappable={true}
            style={Platform.OS === 'android' && styles.marker}
            key={`marker-id-${rendomData?.name?.common}`}
            onPress={() =>
              Object.keys(rendomData).length > 0 ? setOpen(true) : undefined
            }>
            <View style={styles.markerTitle}>
              <Text style={styles.markerText}>
                {rendomData?.name?.common || 'My location'}
              </Text>
            </View>
            <Icon name="map-marker" size={50} iconColor={colors.marker} />
          </Marker>
        </MapView>
      )}
      <View style={styles.randomContainer}>
        <Text style={styles.title}>Where Should You Go On Vacation Next?</Text>
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
    </View>
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
    bottom: 20,
    left: '5%',
    width: '90%',
    borderRadius: 10,
    padding: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: colors.white,
    fontSize: 16,
  },
  btn: {
    marginTop: 12,
    marginBottom: 4,
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
    backgroundColor: colors.opacityMarker,
    paddingHorizontal: 6,
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
});
