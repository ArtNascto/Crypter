import React, { useState, useEffect } from 'react'
import { Text, View, StyleSheet, Button } from 'react-native'
import { BarCodeScanner } from 'expo-barcode-scanner'
import { decode, encode } from 'base-64'

export default function Scanner() {
  const [hasPermission, setHasPermission] = useState(null)
  const [scanned, setScanned] = useState(false)
  const [apiURL, setApiURL] = useState('http://10.0.0.109:8080')
  if (!global.btoa) {
    global.btoa = encode
  }

  if (!global.atob) {
    global.atob = decode
  }

  useEffect(() => {
    ;(async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync()
      setHasPermission(status === 'granted')
    })()
  }, [])
  const b64toBlob = (b64Data, sliceSize = 512) => {
    const byteCharacters = atob(b64Data)
    const byteArrays = []

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize)

      const byteNumbers = new Array(slice.length)
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i)
      }

      const byteArray = new Uint8Array(byteNumbers)
      byteArrays.push(byteArray)
    }

    const blob = new Blob(byteArrays, { type: 'image/png' })
    return blob
  }
  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true)
    alert(apiURL)
    fetch(apiURL + '/qr/DecryptMobile', {
      method: 'POST',
      body: JSON.stringify({
        data: data,
      }),
      headers: {
        'Content-type': 'application/json; charset=UTF-8',
      },
    })
      .then((response) => response.json())
      .then(
        (json) => {
          alert(json)
          let blob = b64toBlob(json.data)
          const reader = new FileReader()
          reader.onload = async () => {
            const fileUri = FileSystem.documentDirectory + 'file'
            await FileSystem.writeAsStringAsync(fileUri, json.contentType, {
              encoding: FileSystem.EncodingType.Base64,
            })
          }
          reader.readAsDataURL(blob)
        },
        (err) => {
          console.log(err)
          setScanned(false)
        },
      )
  }

  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>
  }

  return (
    <View style={styles.container}>
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
      />
      {scanned && (
        <Button title={'Tap to Scan Again'} onPress={() => setScanned(false)} />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
  },
})
