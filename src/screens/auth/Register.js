import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';

import { useThemedStyles } from '../../context/themeContext';
import { auth } from '../../firebase/firebaseConfig';

export default function Register() {
  const styles = useThemedStyles(makeStyles);
  const navigation = useNavigation();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  async function handleRegister() {
    if (!nome || !email || !senha) {
      Alert.alert('Ops', 'Preencha nome, e-mail e senha.');
      return;
    }

    try {
      const cred = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        senha,
      );
      await updateProfile(cred.user, { displayName: nome });
      Alert.alert('Conta criada!', 'Agora você já pode começar suas trilhas.');
    } catch (err) {
      console.log(err);
      Alert.alert('Erro ao cadastrar', 'Tente novamente mais tarde.');
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.container}>
        <Text style={styles.badge}>RESKI AI</Text>

        <Text style={styles.title}>Criar conta</Text>
        <Text style={styles.subtitle}>
          Comece dizendo quem você é para montarmos a melhor trilha.
        </Text>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Nome</Text>
          <TextInput
            style={styles.input}
            value={nome}
            onChangeText={setNome}
            placeholder="Seu nome"
            placeholderTextColor={styles.input.color || '#9CA3AF'}
          />
        </View>

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

        <TouchableOpacity style={styles.primaryButton} onPress={handleRegister}>
          <Text style={styles.primaryButtonText}>Cadastrar</Text>
        </TouchableOpacity>

        <View style={styles.linkRow}>
          <Text style={styles.linkLabel}>Já possui uma conta?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.linkBtnText}>Entrar</Text>
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