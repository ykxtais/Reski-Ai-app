import React from 'react';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItem, DrawerToggleButton } from '@react-navigation/drawer';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import Home from '../screens/Home';
import Sobre from '../screens/Sobre';
import Perfil from '../screens/Perfil';
import Trilhas from '../screens/Trilhas';
import Objetivos from '../screens/Objetivos';
import Ia from '../screens/Ia';
import BtnTheme from '../components/btnTheme';
import { useTheme } from '../context/themeContext';

const Drawer = createDrawerNavigator();
const Tab = createBottomTabNavigator();

function AppTabs() {
  const { colors } = useTheme();

  const activeTint = '#FDBA74';
  const inactiveTint = '#94A3B8';
  const tabBg = colors.tabBar ?? colors.surface;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerTitleAlign: 'left',
        headerRight: () => <BtnTheme />,
        headerLeft: () => (
          <DrawerToggleButton tintColor={colors.text} />
        ),

        headerShadowVisible: false,
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,

        tabBarStyle: {
          backgroundColor: tabBg,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: 60,
          borderTopWidth: 0,
          elevation: 8,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },

        tabBarActiveTintColor: activeTint,
        tabBarInactiveTintColor: inactiveTint,

        tabBarIcon: ({ color, size }) => {
          let iconName = 'ellipse-outline';

          switch (route.name) {
            case 'Home':
              iconName = 'home-outline';
              break;
            case 'Trilhas':
              iconName = 'list-outline';
              break;
            case 'Objetivos':
              iconName = 'flag-outline';
              break;
            case 'Ia':
              iconName = 'sparkles-outline';
              break;
            case 'Sobre':
              iconName = 'information-circle-outline';
              break;
            case 'Perfil':
              iconName = 'person-circle-outline';
              break;
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={Home}
        options={{ title: 'Início' }}
      />
      <Tab.Screen
        name="Trilhas"
        component={Trilhas}
        options={{ title: 'Trilhas' }}
      />
      <Tab.Screen
        name="Objetivos"
        component={Objetivos}
        options={{ title: 'Objetivos' }}
      />
      <Tab.Screen
        name="Ia"
        component={Ia}
        options={{ title: 'IA' }}
      />
      <Tab.Screen
        name="Sobre"
        component={Sobre}
        options={{ title: 'Sobre' }}
      />
      <Tab.Screen
        name="Perfil"
        component={Perfil}
        options={{ title: 'Perfil' }}
      />
    </Tab.Navigator>
  );
}

function CustomDrawerContent(props) {
  const { colors } = useTheme();
  const { navigation } = props;

  const navState = navigation.getState();
  const appTabsRoute = navState.routes?.find((r) => r.name === 'AppTabs');
  const tabState = appTabsRoute?.state;

  const currentTab =
    tabState && typeof tabState.index === 'number'
      ? tabState.routeNames[tabState.index]
      : 'Home';

  const activeTint = '#FDBA74';
  const inactiveTint = '#E5E7EB';

  const goToTab = (screenName) => {
    navigation.navigate('AppTabs', { screen: screenName });
  };

  const renderItem = (label, screenName, iconName) => {
    const focused = currentTab === screenName;
    const tint = focused ? activeTint : inactiveTint;

    return (
      <DrawerItem
        key={screenName}
        label={label}
        icon={({ size }) => (
          <Ionicons name={iconName} size={size} color={tint} />
        )}
        labelStyle={{
          color: tint,
          fontWeight: focused ? '700' : '500',
        }}
        onPress={() => goToTab(screenName)}
      />
    );
  };

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={{ flex: 1, paddingTop: 40 }}
      style={{ backgroundColor: colors.background }}
    >
      {renderItem('Início', 'Home', 'home-outline')}
      {renderItem('Trilhas', 'Trilhas', 'list-outline')}
      {renderItem('Objetivos', 'Objetivos', 'flag-outline')}
      {renderItem('IA', 'Ia', 'sparkles-outline')}
      {renderItem('Sobre', 'Sobre', 'information-circle-outline')}
      {renderItem('Perfil', 'Perfil', 'person-circle-outline')}
    </DrawerContentScrollView>
  );
}

export default function DrawerRoutes() {
  const { colors } = useTheme();

  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: false,
        drawerStyle: { backgroundColor: colors.background },
        drawerActiveTintColor: '#FDBA74',
        drawerInactiveTintColor: '#E5E7EB',
      }}
      drawerContent={(props) => <CustomDrawerContent {...props} />}
    >
      <Drawer.Screen
        name="AppTabs"
        component={AppTabs}
        options={{ title: 'Reski AI' }}
      />
    </Drawer.Navigator>
  );
}
