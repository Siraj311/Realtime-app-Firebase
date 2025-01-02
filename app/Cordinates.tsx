import { FlatList, StyleSheet, Text, TouchableOpacity, View, Platform, Alert} from 'react-native';
import React, { useEffect, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from "expo-media-library";

// Define a type for the data structure
interface DataItem {
  radiation: string;
  latitude: string;
  longitude: string;
}

const Cordinates: React.FC = () => {
  const [data, setData] = useState<DataItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Extract savedData from useLocalSearchParams
  const { savedData } = useLocalSearchParams<{ savedData: string }>();

  useEffect(() => {
    if (savedData) {
      try {
        const newData: DataItem[] = JSON.parse(savedData);
        setData(newData);
      } catch (error) {
        console.error("Error parsing savedData:", error);
      }
    }
  }, [savedData]);

  const convertToCSV = (array: DataItem[]): string => {
    if (array.length === 0) {
      return "No data available.";
    }

    const headers = Object.keys(array[0]).join(",");
    const rows = array.map((obj) =>
      Object.values(obj).map((value) => `"${value}"`).join(",") // Quote values for safety
    );
    return [headers, ...rows].join("\n");
  };

  // const handleDownload = async (): Promise<void> => {
  //   setLoading(true);
  //   try {
  //     const newData = data.map((item) => {
  //       if (item.radiation.includes("Error") || item.latitude.includes("Error") || item.longitude.includes("Error")) {
  //         return null;
  //       }

  //       return item;
  //     }).filter((item) => item !== null);

  //     if (newData.length === 0) {
  //       Alert.alert("No Valid Data", "There are no valid data to export.");
  //       return;
  //     }
  
  //     const csvData = convertToCSV(newData);
  //     const fileName = "data.csv";
  //     const fileUri = `${FileSystem.cacheDirectory}${fileName}`;
  
  //     console.log("Writing file to:", fileUri);
  //     await FileSystem.writeAsStringAsync(fileUri, csvData, {
  //       encoding: FileSystem.EncodingType.UTF8,
  //     });
  
  //     const fileInfo = await FileSystem.getInfoAsync(fileUri);
  //     console.log("File Info:", fileInfo);
  
  //     if (!fileInfo.exists) {
  //       throw new Error("File does not exist at the given URI.");
  //     }
  
  //     const { status } = await MediaLibrary.requestPermissionsAsync();
  //     console.log("Permission Status:", status);
  
  //     if (status !== "granted") {
  //       throw new Error("Media library permission not granted.");
  //     }
  
  //     console.log("Creating asset...");
  //     const asset = await MediaLibrary.createAssetAsync(fileUri);
  //     console.log("Asset Created:", asset);
  
  //     const album = await MediaLibrary.getAlbumAsync("Download");
  //     console.log("Album Info:", album);
  
  //     if (album) {
  //       await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
  //     } else {
  //       await MediaLibrary.createAlbumAsync("Download", asset, false);
  //     }
  
  //     Alert.alert("Success", "File downloaded successfully to the Downloads folder.");
  //   } catch (error: any) {
  //     console.error("Error during download:", error);
  //     Alert.alert("Error", `Could not save file: ${error.message}`);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleDownload = async (): Promise<void> => {
    setLoading(true);
    try {
      if (data.length === 0) {
        Alert.alert("No Data", "There are no coordinates to export.");
        return;
      }

      const csvData = convertToCSV(data);
      const fileUri = `${FileSystem.documentDirectory}data.csv`;

      // Write CSV data to a file
      await FileSystem.writeAsStringAsync(fileUri, csvData, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      // Share the file if sharing is available
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      } else {
        Alert.alert("Sharing not available", "This feature is not supported on your device.");
      }
    } catch (error) {
      console.error("Error creating file:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {data.length > 0 ? (
        <>
          <View style={styles.downloadButtonContainer}>
            <TouchableOpacity style={styles.button} onPress={handleDownload} disabled={loading}>
              <Text style={styles.buttonText}>
                {loading ? "Processing..." : "Share as CSV"}
              </Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={data}
            keyExtractor={(item, index) => index.toString()}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <Text style={styles.txt}>Radiation: {item.radiation}</Text>
                <Text style={styles.txt}>Latitude: {item.latitude}</Text>
                <Text style={styles.txt}>Longitude: {item.longitude}</Text>
              </View>
            )}
          />
        </>
      ) : (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>No Coordinates to display</Text>
        </View>
      )}
    </View>
  );
};

export default Cordinates;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: '#e6e6e6',
  },
  txt: {
    fontSize: 15,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: '#333',
  },
  button: {
    padding: 10,
    backgroundColor: 'blue',
    width: 140,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    textAlign: 'center',
  },
  card: {
    justifyContent: 'center',
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#fff',
    margin: 10,
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    color: 'darkgray',
    fontSize: 25,
    fontWeight: 'bold',
  },
  downloadButtonContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginVertical: 10,
  },
});