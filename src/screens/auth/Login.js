import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { signInWithEmailAndPassword } from 'firebase/auth';

import { useThemedStyles } from '../../context/themeContext';
import { auth } from '../../firebase/firebaseConfig';

export default function Login() {
  const styles = useThemedStyles(makeStyles);
  const navigation = useNavigation();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  async function handleLogin() {
    if (!email || !senha) {
      Alert.alert('Ops', 'Preencha e-mail e senha.');
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email.trim(), senha);
    } catch (err) {
      console.log(err);
      Alert.alert('Erro ao entrar', 'Verifique suas credenciais.');
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.container}>
        <Text style={styles.badge}>RESKI AI</Text>

        <Text style={styles.title}>Bem-vindo</Text>
        <Text style={styles.subtitle}>
          Organize suas trilhas de estudo de acordo com o seu objetivo de
          carreira.
        </Text>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>E-mail</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="seuemail@exemplo.com"
            placeholderTextColor={styles.input.color || '#9CA3AF'}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Senha</Text>
          <TextInput
            style={styles.input}
            value={senha}
            onChangeText={setSenha}
            secureTextEntry
            placeholder="••••••••"
            placeholderTextColor={styles.input.color || '#9CA3AF'}
          />
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={handleLogin}>
          <Text style={styles.primaryButtonText}>Entrar</Text>
        </TouchableOpacity>

        <View style={styles.linkRow}>
          <Text style={styles.linkLabel}>Ainda não tem conta?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.linkBtnText}>Criar conta</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const makeStyles = ({ colors }) =>
  StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      flex: 1,
      paddingHorizontal: 24,
      paddingTop: 80,
    },
    badge: {
      alignSelf: 'flex-start',
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 999,
      backgroundColor: colors.accent,
      color: colors.onPrimary,
      fontWeight: '700',
      fontSize: 12,
      marginBottom: 16,
    },
    title: {
      fontSize: 28,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 24,
    },
    subtitle: {
      fontSize: 14,
      color: colors.textMuted,
      marginBottom: 32,
      maxWidth: 280,
    },
    fieldGroup: {
      marginBottom: 16,
    },
    label: {
      fontSize: 13,
      fontWeight: '500',
      color: colors.text,
      marginBottom: 6,
    },
    input: {
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 14,
      paddingVertical: 11,
      fontSize: 14,
      color: colors.text,
      backgroundColor: colors.surface,
    },
    primaryButton: {
      marginTop: 24,
      borderRadius: 14,
      paddingVertical: 13,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary,
    },
    primaryButtonText: {
      color: colors.onPrimary,
      fontWeight: '600',
      fontSize: 15,
    },
    linkRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: 18,
    },
    linkLabel: {
      fontSize: 13,
      color: colors.textMuted,
      marginRight: 4,
    },
    linkBtnText: {
      fontSize: 13,
      color: colors.accent,
      fontWeight: '600',
    },
  });