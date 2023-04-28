import React from 'react';
import { Dimensions ,ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { BLACK, WHITE } from '../constants/constants';

const windowHeight = Dimensions.get('window').height;

const TextItem = ({ text, onPress }) => {
    const styles = StyleSheet.create({
        container: {
          borderWidth: 1,
          borderColor: '#ddd',
          padding: 10,
          marginBottom: 10,
          borderRadius: 5,
        },
      });

    return (
      <TouchableOpacity style={styles.container} onPress={onPress}>
        <Text>{text}</Text>
      </TouchableOpacity>
    );
  };

const RollUpWindow = ({ visible, setVisible, texts }) => {

  if (!visible) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
      <TouchableOpacity style={styles.removeButton} onPress={() => setVisible(false)}>
        <FontAwesome name="close" color={BLACK} size={25} />
      </TouchableOpacity>
        <Text style={styles.headerText}>Select payment account</Text>
      </View>
      <ScrollView style={styles.scrollView} scrollEnabled={visible}>
          {texts.map((text, index) => (
            <TextItem key={index} text={text} onPress={() => console.log(text)} />
          ))}
        </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
  closeButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'black',
  },
  headerText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  content: {
    flex: 1,
    marginTop: 20,
    alignItems: 'center',
  },
  box: {
    width: '100%',
    height: 60,
    borderRadius: 10,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  boxText: {
    fontSize: 14,
    color: 'black',
  },
  scrollView: {
    height: windowHeight * 0.4,
  },
  removeButton: {
    position: 'absolute',
    top: 0,
    right: 0
  }
});

export default RollUpWindow;
