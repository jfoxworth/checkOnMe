// Minimal crypto polyfill for amazon-cognito-identity-js
import 'react-native-get-random-values';

// Polyfill global.crypto if not available
if (typeof global.crypto === 'undefined') {
  // @ts-ignore
  global.crypto = {
    getRandomValues: (array: any) => {
      if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
        return crypto.getRandomValues(array);
      }
      // Fallback for environments without crypto
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
      return array;
    },
  };
}

export default global.crypto;
