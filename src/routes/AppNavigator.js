import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { onAuthStateChanged } from 'firebase/auth';

import { auth } from '../firebase/firebaseConfig';
import { useTheme } from '../context/themeContext';

import BtnTheme from '../components/btnTheme';
import Login from '../screens/auth/Login';
import Register from '../screens/auth/Register';
import DrawerRoutes from './Drawer.routes';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsub;
  }, []);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerShadowVisible: false,
        headerTintColor: colors.text,
      }}
    >
      {!user ? (
        <>
          <Stack.Screen
            name="Login"
            component={Login}
            options={{
              title: 'Login',
              headerBackVisible: false,
              headerLeft: () => null,
              headerRight: () => <BtnTheme compact />,
            }}
          />
          <Stack.Screen
            name="Register"
            component={Register}
            options={{
              title: 'Cadastro',
              headerBackVisible: false,
              headerLeft: () => null,
              headerRight: () => <BtnTheme compact />,
            }}
          />
        </>
      ) : (
        <Stack.Screen
          name="Main"
          component={DrawerRoutes}
          options={{ headerShown: false }}
        />
      )}
    </Stack.Navigator>
  );
}
