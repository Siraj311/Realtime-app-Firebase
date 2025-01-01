import { useRouter } from 'expo-router';
import { database } from '../config/firebaseConfig';
import { ref, onValue } from 'firebase/database';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import FontAwesome from '@expo/vector-icons/FontAwesome';

// Define types for your data and coordinates
interface SensorData {
  key: string;
  radiation?: number;
  latitude?: number;
  longitude?: number;
}

interface Coordinates {
  latitude: number;
  longitude: number;
}

export default function Index() {
  const router = useRouter();

  // Refs for map and other elements
  const mapRef = useRef<any>(null);

  // State for data, coordinates, and latest data
  const [data, setData] = useState<SensorData[]>([{ key: '' }]);
  const [savedData, setSavedData] = useState<string>('');
  const [latestData, setLatestData] = useState<SensorData>({ key: '' });
  const [keys, setKeys] = useState<string[]>(['']);

  const [coordinates, setCoordinates] = useState<Coordinates[]>([]);
  const [startingPosition, setStartingPosition] = useState<Coordinates | null>(null);
  const [currentPosition, setCurrentPosition] = useState<Coordinates | null>(null);

  useEffect(() => {
    const dataRef = ref(database, 'sensor_data');

    const unsubscribe = onValue(dataRef, (snapshot) => {
      const value = snapshot.val();
      console.log(value);

      if (value) {
        const dataArray: SensorData[] = Object.keys(value).map((key) => ({
          key, // Use the key as the unique identifier
          ...value[key],
        }));
        const dataCoordinates: Coordinates[] = Object.keys(value)
          .map((key) => {
            const item = value[key];

            if (!isNaN(Number(item.latitude)) && !isNaN(Number(item.longitude))) {
              return {
                latitude: Number(item.latitude),
                longitude: Number(item.longitude),
              };
            }

            return null;
          })
          .filter((item) => item !== null) as Coordinates[];

        // Get existing keys for comparison
        const existingKeys = data.map((item) => item.key); // Use `key` instead of `id`

        // Identify newly added items
        const newItems = dataArray.filter((item) => !existingKeys.includes(item.key));

        // Update the latest data state if new items exist
        if (newItems.length > 0) {
          setLatestData(newItems[newItems.length - 1]); // Last new item is the latest
          setCurrentPosition({ latitude : Number(latestData.latitude), longitude: Number(latestData.longitude) });
        }

        if (!startingPosition && dataCoordinates.length > 0) {
          setStartingPosition(dataCoordinates[0]);
        }

        // Update the data state
        setData(dataArray);
        setCoordinates(dataCoordinates);
      }
    });

    return () => unsubscribe();
  }, [startingPosition]);

  const focusMap = () => {
    if(!currentPosition) {
      return;
    }

    const currentLocation = {
      latitude: currentPosition?.latitude,
      longitude: currentPosition?.longitude,
      latitudeDelta: 0.1,
      longitudeDelta: 0.1
    }

    // mapRef.current?.animateToRegion(currentLocation);
    // mapRef.current?.animateCamera({center: currentLocation, zoom: 18}, {duration: 2000})
  }

  const handleSave = () => {
    setSavedData(JSON.stringify(data));
  };

  const handleHistory = () => {
    router.push({
      pathname: './Cordinates',
      params: {
        savedData,
      },
    });
  };

  const INITIAL_REGION = {
    latitude: 7.8731, // Approximate latitude for Sri Lanka
    longitude: 80.7718, // Approximate longitude for Sri Lanka
    latitudeDelta: 3.5, // Adjust zoom level for latitude (larger value means zoomed out)
    longitudeDelta: 3.5, // Adjust zoom level for longitude
  };

  return (
    <View style={styles.container}>
      <View style={{marginBottom: 30, width: '100%'}}>
      <View style={styles.radiation}>
        <Text style={styles.txt}>Radiation: </Text>
        <View style={{backgroundColor: 'white', marginTop: 10, paddingVertical: 10, borderRadius: 10}}>
          <Text style={styles.darkTxt}>{latestData.radiation}</Text>
        </View>
      </View>

      <View style={styles.cordinateContainer}>
        <Text style={styles.txt}>Latitude: </Text>
        <View style={{backgroundColor: 'white', marginTop: 10, paddingVertical: 10, borderRadius: 10}}>
          <Text style={styles.darkTxt}>{latestData.latitude}</Text>
        </View>
      </View>

      <View style={styles.cordinateContainer}>
        <Text style={styles.txt}>Longitude: </Text>
        <View style={{backgroundColor: 'white', marginTop: 10, paddingVertical: 10, borderRadius: 10}}>
          <Text style={styles.darkTxt}>{latestData.longitude}</Text>
        </View>
      </View>
      </View>

      <View style={styles.btnContainer}>
        <TouchableOpacity style={styles.btn} onPress={handleSave}>
          <AntDesign name="save" size={24} color="black" />
          <Text style={styles.reload}>Save</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btn} onPress={handleHistory}>
          <FontAwesome name="history" size={24} color="black" />
          <Text style={styles.reload}>History</Text>
        </TouchableOpacity>
      </View>

      <View style={{...styles.btnContainer}}>
        <TouchableOpacity style={styles.btn} onPress={() => router.replace('/')}>
          <AntDesign name="reload1" size={22} color="black" />
          <Text style={styles.reload}>Reload</Text>
        </TouchableOpacity>

        {/* <TouchableOpacity style={styles.btn} onPress={focusMap}>
          <FontAwesome6 name="location-crosshairs" size={22} color="black" />
          <Text style={styles.reload}>Focus</Text>
        </TouchableOpacity> */}
      </View>

      {/* <View style={styles.mapContainer}> */}
      {/* <MapView 
          style={styles.map} 
          initialRegion={INITIAL_REGION}
          showsUserLocation
          showsMyLocationButton
          ref={mapRef}
        >
          

        { startingPosition &&
          <Marker
            coordinate={startingPosition}
            title="Starting Position"
            description="The starting point of the journey"
          />
        }

        

        { currentPosition && 
          <Marker
            coordinate={currentPosition}
            title="Current Position"
            description="The current position of the device"
          />
        }

        <Polyline coordinates={coordinates} strokeColor="#000" strokeWidth={6} />
        </MapView> */}
      {/* </View> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#5827cc',

  },
  btnContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
  },
  btn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'lightgreen',
    color: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 20,
  },
  txt: {
    color: '#fff',
    fontSize: 20,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  darkTxt: {
    color: 'black',
    marginLeft: 10,
    fontSize: 20,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  radiation: {
    // flexDirection: 'row',
    // justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 20,
    width: '100%',
    marginTop: 20,
  },
  cordinateContainer: {
    // flexDirection: 'row',
    // justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 20,
    width: '100%',
  },
  reload: {
    fontSize: 20,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  mapContainer: {
    backgroundColor: '#fff',
    width: '100%',
    flex: 1,
    marginVertical: 20,
    borderRadius: 20,
  },
  map: {
    height: '100%',
    width: '100%',
    borderRadius: 20,
  },
});
