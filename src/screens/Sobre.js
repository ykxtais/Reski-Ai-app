import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';
import Constants from 'expo-constants';
import { useThemedStyles } from '../context/themeContext';

export default function Sobre() {
  const styles = useThemedStyles(makeStyles);

  const info = Constants.expoConfig?.extra ?? {};

  return (
    <View style={styles.root}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <Image
              source={require('../../assets/icon.png')}
              style={styles.logo}
            />
            <View>
              <Text style={styles.title}>{info.appName}</Text>
              <Text style={styles.subtitle}>
                Plataforma inteligente para trilhas e aprendizado profissional.
              </Text>

              <View style={styles.pill}>
                <Text style={styles.pillText}>{info.channel}</Text>
              </View>
            </View>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Versão</Text>
            <Text style={styles.value}>{info.appVersion}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Build</Text>
            <Text style={styles.value}>{info.buildNumber}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Commit</Text>
            <Text style={styles.value}>{info.gitCommit}</Text>
          </View>

          <View style={styles.divider} />
        </View>

        <View style={styles.foot}>
          <Text style={styles.footText}>
            Obrigado por usar o Reski AI.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const makeStyles = ({ colors }) =>
  StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scroll: {
      flex: 1,
      paddingHorizontal: 20,
      paddingTop: 24,
      paddingBottom: 32,
    },
    card: {
      borderRadius: 18,
      backgroundColor: colors.card,
      padding: 18,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.10,
      shadowRadius: 18,
      elevation: 6,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    logo: {
      width: 52,
      height: 52,
      borderRadius: 12,
      marginRight: 12,
      backgroundColor: colors.background,
    },
    title: {
      color: colors.text,
      fontSize: 20,
      fontWeight: '800',
    },
    subtitle: {
      color: colors.textMuted,
      fontSize: 13,
      marginTop: 5,
      maxWidth: 250,
    },
    pill: {
      alignSelf: 'flex-start',
      marginTop: 8,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
      backgroundColor: colors.accent + '22',
      borderWidth: 1,
      borderColor: colors.accent + '66',
    },
    pillText: {
      color: colors.accent,
      fontWeight: '700',
      letterSpacing: 0.3,
      fontSize: 12,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 12,
    },
    label: {
      color: colors.textMuted,
      fontSize: 14,
      width: 80,
    },
    value: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '600',
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: 16,
    },
    foot: {
      marginTop: 22,
      alignItems: 'center',
      opacity: 0.85,
    },
    footText: {
      color: colors.textMuted,
      fontSize: 12,
      textAlign: 'center',
    },
  });