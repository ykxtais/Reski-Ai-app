import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ImageBackground, TextInput, Alert, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

import { useThemedStyles } from '../context/themeContext';
import { auth } from '../firebase/firebaseConfig';
import { updateProfile, signOut, deleteUser } from 'firebase/auth';

const STORAGE_AVATAR = '@reski_profile_avatar';
const STORAGE_BANNER = '@reski_profile_banner';
const STORAGE_BIO = '@reski_profile_bio';

function userKey(base, user) {
  const id = user?.uid || user?.email || 'anon';
  return `${base}:${id}`;
}

function Perfil() {
  const styles = useThemedStyles(makeStyles);

  const user = auth.currentUser;

  const avatarKey = useMemo(() => userKey(STORAGE_AVATAR, user), [user]);
  const bannerKey = useMemo(() => userKey(STORAGE_BANNER, user), [user]);
  const bioKey = useMemo(() => userKey(STORAGE_BIO, user), [user]);

  const [nome, setNome] = useState(user?.displayName || '');
  const [bio, setBio] = useState('');
  const [avatarUri, setAvatarUri] = useState(null);
  const [bannerUri, setBannerUri] = useState(null);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  const [initialNome, setInitialNome] = useState('');
  const [initialBio, setInitialBio] = useState('');
  const [initialAvatarUri, setInitialAvatarUri] = useState(null);
  const [initialBannerUri, setInitialBannerUri] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [savedAvatar, savedBanner, savedBio] = await Promise.all([
          AsyncStorage.getItem(avatarKey),
          AsyncStorage.getItem(bannerKey),
          AsyncStorage.getItem(bioKey),
        ]);

        if (savedAvatar) {
          setAvatarUri(savedAvatar);
          setInitialAvatarUri(savedAvatar);
        }
        if (savedBanner) {
          setBannerUri(savedBanner);
          setInitialBannerUri(savedBanner);
        }
        if (savedBio) {
          setBio(savedBio);
          setInitialBio(savedBio);
        }

        if (user?.photoURL && !savedAvatar) {
          setAvatarUri(user.photoURL);
          setInitialAvatarUri(user.photoURL);
        }

        const baseNome = user?.displayName || '';
        setInitialNome(baseNome);
        if (!nome) setNome(baseNome);
      } catch (e) {
        console.log('Erro ao carregar dados do perfil', e);
      }
    })();
  }, [user, avatarKey, bannerKey, bioKey]);

  const displayName =
    nome || user?.displayName || user?.email || 'Usuário';

  const displayEmail = user?.email || 'sem e-mail';

  const displayBio =
    bio || 'Adicione uma breve descrição sobre você.';

  const initials = (displayName || 'U')
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  async function handlePickImage(kind) {
    const { status } =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permissão necessária',
        'Precisamos de acesso à sua galeria para atualizar o perfil.',
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (result.canceled) return;

    const uri = result.assets[0].uri;

    if (kind === 'avatar') {
      setAvatarUri(uri);
    } else {
      setBannerUri(uri);
    }
  }

  function handleRemoveAvatar() {
    setAvatarUri(null);
  }

  function handleRemoveBanner() {
    setBannerUri(null);
  }

  function startEditing() {
    setInitialNome(nome);
    setInitialBio(bio);
    setInitialAvatarUri(avatarUri);
    setInitialBannerUri(bannerUri);
    setEditing(true);
  }

  function cancelEditing() {
    setNome(initialNome);
    setBio(initialBio);
    setAvatarUri(initialAvatarUri);
    setBannerUri(initialBannerUri);
    setEditing(false);
  }

  async function handleSaveProfile() {
    if (!user) return;
    if (!nome.trim()) {
      Alert.alert('Ops', 'Digite um nome válido.');
      return;
    }

    try {
      setSaving(true);
      await updateProfile(user, { displayName: nome.trim() });

      await AsyncStorage.setItem(bioKey, bio || '');

      if (avatarUri) {
        await AsyncStorage.setItem(avatarKey, avatarUri);
        await updateProfile(user, { photoURL: avatarUri });
      } else {
        await AsyncStorage.removeItem(avatarKey);
        await updateProfile(user, { photoURL: null });
      }

      if (bannerUri) {
        await AsyncStorage.setItem(bannerKey, bannerUri);
      } else {
        await AsyncStorage.removeItem(bannerKey);
      }

      Alert.alert('Pronto!', 'Suas informações foram atualizadas.');

      setInitialNome(nome.trim());
      setInitialBio(bio);
      setInitialAvatarUri(avatarUri);
      setInitialBannerUri(bannerUri);
      setEditing(false);
    } catch (err) {
      console.log('Erro ao atualizar perfil', err);
      Alert.alert('Erro', 'Não foi possível atualizar suas informações.');
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    try {
      await signOut(auth);
    } catch (err) {
      console.log('Erro ao sair', err);
      Alert.alert('Erro', 'Não foi possível sair. Tente novamente.');
    }
  }

  function confirmDeleteAccount() {
    Alert.alert(
      'Excluir conta',
      'Essa ação é definitiva. Todos os dados associados a esta conta serão removidos. Deseja continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => handleDeleteAccount(),
        },
      ],
    );
  }

  async function handleDeleteAccount() {
    const current = auth.currentUser;
    if (!current) {
      Alert.alert('Erro', 'Nenhum usuário logado.');
      return;
    }

    try {
      await deleteUser(current);
      Alert.alert('Conta excluída', 'Sua conta foi removida com sucesso.');
    } catch (err) {
      console.log('Erro ao excluir conta', err);
      if (err?.code === 'auth/requires-recent-login') {
        Alert.alert(
          'Sessão expirada',
          'Por segurança, faça login novamente e tente excluir a conta de novo.',
        );
      } else {
        Alert.alert(
          'Erro',
          'Não foi possível excluir sua conta no momento.',
        );
      }
    }
  }

  return (
    <View style={styles.root}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.bannerContainer}>
          {bannerUri ? (
            <ImageBackground
              source={{ uri: bannerUri }}
              style={styles.bannerImage}
            >
              <View style={styles.bannerOverlay} />
            </ImageBackground>
          ) : null}

          {editing && (
            <View style={styles.bannerButtonsRow}>
              <TouchableOpacity
                style={styles.smallIconBtn}
                onPress={() => handlePickImage('banner')}
              >
                <Ionicons name="camera-outline" size={18} color="#FFF" />
              </TouchableOpacity>

              {bannerUri && (
                <TouchableOpacity
                  style={[styles.smallIconBtn, { marginLeft: 8, backgroundColor: 'rgba(239,68,68,0.85)' }]}
                  onPress={handleRemoveBanner}
                >
                  <Ionicons name="trash-outline" size={18} color="#FFF" />
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        <View style={styles.content}>
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarCircle}>
              {avatarUri ? (
                <Image
                  source={{ uri: avatarUri }}
                  style={styles.avatarImage}
                />
              ) : (
                <Text style={styles.avatarInitials}>{initials}</Text>
              )}
            </View>

            {editing && (
              <>
                <TouchableOpacity
                  style={styles.avatarEditButton}
                  onPress={() => handlePickImage('avatar')}
                >
                  <Ionicons name="camera-outline" size={18} color="#FFF" />
                </TouchableOpacity>

                {avatarUri && (
                  <TouchableOpacity
                    style={styles.avatarRemoveButton}
                    onPress={handleRemoveAvatar}
                  >
                    <Ionicons name="trash-outline" size={16} color="#FFF" />
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>

          <Text style={styles.displayName}>{displayName}</Text>

          <View style={styles.fieldCard}>
            <Text style={styles.fieldLabel}>Nome</Text>
            {editing ? (
              <TextInput
                style={styles.input}
                value={nome}
                onChangeText={setNome}
                placeholder="Seu nome"
                placeholderTextColor="#9CA3AF"
              />
            ) : (
              <Text style={styles.textReadOnly}>{displayName}</Text>
            )}
          </View>

          <View style={styles.fieldCard}>
            <Text style={styles.fieldLabel}>E-mail</Text>
            <Text style={styles.emailText}>{displayEmail}</Text>
          </View>

          <View style={styles.fieldCard}>
            <Text style={styles.fieldLabel}>Biografia</Text>
            {editing ? (
              <TextInput
                style={styles.bioInput}
                value={bio}
                onChangeText={setBio}
                placeholder="Conte um pouco sobre você, objetivos, interesses..."
                placeholderTextColor="#9CA3AF"
                multiline
              />
            ) : (
              <Text
                style={[
                  styles.bioReadOnly,
                  !bio && { color: '#9CA3AF' },
                ]}
              >
                {displayBio}
              </Text>
            )}
          </View>

          {editing ? (
            <View style={styles.editActionsRow}>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleSaveProfile}
                disabled={saving}
              >
                <Text style={styles.primaryButtonText}>
                  {saving ? 'Salvando...' : 'Salvar alterações'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={cancelEditing}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.editButton}
              onPress={startEditing}
            >
              <Text style={styles.editButtonText}>
                Editar informações
              </Text>
            </TouchableOpacity>
          )}

          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleLogout}
            >
              <Text style={styles.secondaryButtonText}>Sair</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dangerButton}
              onPress={confirmDeleteAccount}
            >
              <Text style={styles.dangerButtonText}>Excluir conta</Text>
            </TouchableOpacity>
          </View>
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
    },
    bannerContainer: {
      height: 150,
      backgroundColor: colors.primary,
    },
    bannerImage: {
      flex: 1,
      resizeMode: 'cover',
    },
    bannerOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.22)',
    },
    bannerButtonsRow: {
      position: 'absolute',
      right: 16,
      bottom: 16,
      flexDirection: 'row',
    },
    smallIconBtn: {
      width: 34,
      height: 34,
      borderRadius: 17,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(0,0,0,0.6)',
    },
    content: {
      paddingHorizontal: 20,
      paddingTop: 0,
      paddingBottom: 32,
    },
    avatarWrapper: {
      marginTop: -58,
      alignSelf: 'center',
    },
    avatarCircle: {
      width: 110,
      height: 110,
      borderRadius: 55,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.card,
      borderWidth: 3,
      borderColor: colors.accent,
      overflow: 'hidden',
    },
    avatarInitials: {
      fontSize: 34,
      fontWeight: '700',
      color: colors.accent,
    },
    avatarImage: {
      width: '100%',
      height: '100%',
    },
    avatarEditButton: {
      position: 'absolute',
      right: -4,
      bottom: -4,
      width: 34,
      height: 34,
      borderRadius: 17,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.accent,
      borderWidth: 1,
      borderColor: colors.background,
    },
    // NOVO: botão de remover avatar
    avatarRemoveButton: {
      position: 'absolute',
      left: -4,
      bottom: -4,
      width: 34,
      height: 34,
      borderRadius: 17,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.danger,
      borderWidth: 1,
      borderColor: colors.background,
    },
    displayName: {
      marginTop: 12,
      fontSize: 20,
      fontWeight: '700',
      textAlign: 'center',
      color: colors.text,
      marginBottom: 8,
    },
    fieldCard: {
      borderRadius: 16,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 16,
      paddingVertical: 12,
      marginTop: 12,
    },
    fieldLabel: {
      fontSize: 12,
      color: colors.textMuted,
      marginBottom: 6,
    },
    input: {
      fontSize: 15,
      color: colors.text,
      paddingVertical: 4,
      paddingHorizontal: 0,
      minHeight: 46,
    },
    textReadOnly: {
      fontSize: 15,
      color: colors.text,
      paddingVertical: 4,
    },
    emailText: {
      fontSize: 15,
      color: colors.textMuted,
      paddingVertical: 4,
    },
    bioReadOnly: {
      fontSize: 15,
      color: colors.text,
      paddingVertical: 4,
    },
    bioInput: {
      fontSize: 15,
      color: colors.text,
      minHeight: 90,
      textAlignVertical: 'top',
      paddingVertical: 4,
      paddingHorizontal: 0,
    },
    editActionsRow: {
      flexDirection: 'row',
      marginTop: 18,
    },
    primaryButton: {
      flex: 1,
      borderRadius: 14,
      paddingVertical: 13,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary,
      marginRight: 8,
    },
    primaryButtonText: {
      color: colors.onPrimary,
      fontWeight: '600',
      fontSize: 14,
    },
    cancelButton: {
      flex: 1,
      borderRadius: 14,
      paddingVertical: 13,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: colors.border,
      marginLeft: 8,
    },
    cancelButtonText: {
      color: colors.text,
      fontWeight: '600',
      fontSize: 14,
    },
    editButton: {
      marginTop: 20,
      borderRadius: 14,
      paddingVertical: 13,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary,
    },
    editButtonText: {
      color: colors.onPrimary,
      fontWeight: '600',
      fontSize: 14,
    },
    actionsRow: {
      flexDirection: 'row',
      marginTop: 24,
    },
    secondaryButton: {
      flex: 1,
      borderRadius: 14,
      paddingVertical: 13,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: colors.border,
      marginRight: 8,
    },
    secondaryButtonText: {
      color: colors.text,
      fontWeight: '600',
      fontSize: 14,
    },
    dangerButton: {
      flex: 1,
      borderRadius: 14,
      paddingVertical: 13,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: colors.danger,
      marginLeft: 8,
    },
    dangerButtonText: {
      color: colors.danger,
      fontWeight: '600',
      fontSize: 14,
    },
  });

export default Perfil;
