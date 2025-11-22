import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { auth } from '../firebase/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { useThemedStyles } from '../context/themeContext';

export default function Home() {
  const styles = useThemedStyles(makeStyles);
  const navigation = useNavigation();

  const [user, setUser] = useState(auth.currentUser);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        await u.reload();
      }
      setUser(u);
    });

    return unsub;
  }, []);

  const rawName =
    user?.displayName?.trim() ||
    user?.email?.split('@')[0] ||
    'explorador(a)';

  const firstName = rawName.split(' ')[0];

  return (
    <View style={styles.root}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.helloSmall}>Olá, {firstName}!</Text>
        <Text style={styles.helloName}>Você está no caminho certo.</Text>
        <View style={styles.highlightLine} />
        <Text style={styles.helloSubtitle}>
          Use o Reski AI para transformar seus objetivos de carreira em trilhas
          de estudo claras e acionáveis.
        </Text>

        <Text style={styles.sectionTitle}>Por onde você quer começar?</Text>
        <Text style={styles.sectionText}>
          Escolha um dos caminhos abaixo para organizar sua jornada:
        </Text>

        <View style={styles.chipRow}>
          <TouchableOpacity
            style={styles.chip}
            onPress={() => navigation.navigate('Trilhas')}
          >
            <Text style={styles.chipText}>Ver trilhas de estudo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.chip}
            onPress={() => navigation.navigate('Objetivos')}
          >
            <Text style={styles.chipText}>Definir objetivos</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.chipAccent}
            onPress={() => navigation.navigate('Ia')}
          >
            <Text style={styles.chipAccentText}>
              Conversar com a IA agora
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.blockTitle}>Como o Reski AI te ajuda?</Text>
        <Text style={styles.blockText}>
          • <Text style={{ fontWeight: '600' }}>Objetivos</Text>: registre cargos
          e áreas que você deseja alcançar para ter clareza de direção.
        </Text>
        <Text style={styles.blockText}>
          • <Text style={{ fontWeight: '600' }}>Trilhas</Text>: organize
          conteúdos, competências e status de cada etapa do seu plano.
        </Text>
        <Text style={styles.blockText}>
          • <Text style={{ fontWeight: '600' }}>Reski IA</Text>: peça sugestões
          de trilhas, temas de estudo e próximos passos com base no seu perfil.
        </Text>

        <Text style={styles.blockTitle}>Dica rápida</Text>
        <Text style={styles.blockText}>
          Comece definindo um objetivo de carreira. Em seguida, crie trilhas de
          estudo relacionadas e use a IA para descobrir conteúdos que faltam.
        </Text>
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
    helloSmall: {
      fontSize: 14,
      color: colors.textMuted,
      marginBottom: 4,
    },
    helloName: {
      fontSize: 24,
      fontWeight: '800',
      color: colors.text,
      marginBottom: 6,
    },
    helloSubtitle: {
      fontSize: 14,
      color: colors.textMuted,
      marginBottom: 24,
      maxWidth: 320,
    },

    sectionTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 6,
    },
    sectionText: {
      fontSize: 13,
      color: colors.textMuted,
      marginBottom: 12,
    },

    chipRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: 20,
    },
    chip: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    chipText: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.primary,
    },

    chipAccent: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 999,
      borderWidth: 0,
      backgroundColor: colors.accent,
    },
    chipAccentText: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.onPrimary,
    },

    blockTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.text,
      marginTop: 10,
      marginBottom: 4,
    },
    blockText: {
      fontSize: 13,
      color: colors.textMuted,
      marginBottom: 4,
    },
    highlightLine: {
      height: 3,
      width: 56,
      borderRadius: 999,
      backgroundColor: colors.accent,
      marginBottom: 12,
    },
  });