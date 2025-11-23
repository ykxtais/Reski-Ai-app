import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useThemedStyles } from '../context/themeContext';
import { api } from '../services/api';

async function fetchObjetivos() {
  const res = await api.get('/objetivos', {
    params: {
      pageNumber: 0,
      pageSize: 50,
      sort: 'id,desc',
    },
  });
  return res.data;
}

export default function Objetivos() {
  const styles = useThemedStyles(makeStyles);
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['objetivos'],
    queryFn: fetchObjetivos,
  });

  const objetivos = Array.isArray(data?.content) ? data.content : [];

  const [cargo, setCargo] = useState('');
  const [area, setArea] = useState('');
  const [demanda, setDemanda] = useState('');
  const [descricao, setDescricao] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  function resetForm() {
    setCargo('');
    setArea('');
    setDemanda('');
    setDescricao('');
    setEditingId(null);
  }

  function handleEditFill(obj) {
    setEditingId(obj.id);
    setCargo(obj.cargo || '');
    setArea(obj.area || '');
    setDemanda(obj.demanda || '');
    setDescricao(obj.descricao || '');
  }

  async function handleSave() {
    if (!cargo.trim() || !area.trim() || !demanda.trim() || !descricao.trim()) {
      Alert.alert('Ops', 'Preencha todos os campos.');
      return;
    }

    const payload = {
      cargo: cargo.trim(),
      area: area.trim(),
      demanda: demanda.trim(),
      descricao: descricao.trim(),
    };

    try {
      setSaving(true);

      if (editingId) {
        await api.put(`/objetivos/${editingId}`, payload);
      } else {
        await api.post('/objetivos', payload);
      }

      await queryClient.invalidateQueries(['objetivos']);
      resetForm();
    } catch (e) {
      console.log('Erro ao salvar objetivo', e?.response?.data || e?.message);
      Alert.alert('Erro', 'Não foi possível salvar o objetivo.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    Alert.alert('Excluir objetivo', 'Tem certeza que deseja excluir este objetivo?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/objetivos/${id}`);
            await queryClient.invalidateQueries(['objetivos']);
            if (editingId === id) resetForm();
          } catch (e) {
            console.log('Erro ao excluir objetivo', e?.response?.data || e?.message);
            Alert.alert('Erro', 'Não foi possível excluir o objetivo.');
          }
        },
      },
    ]);
  }

  return (
    <View style={styles.root}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.headerTitle}>Objetivos</Text>
          <Text style={styles.headerSubtitle}>
            Registre cargos, áreas e demanda para orientar suas trilhas de estudo.
          </Text>

          {/* FORM */}
          <Text style={styles.sectionTitle}>
            {editingId ? 'Editar objetivo' : 'Novo objetivo'}
          </Text>

          <View style={styles.fieldCard}>
            <Text style={styles.label}>Cargo</Text>
            <TextInput
              style={styles.input}
              value={cargo}
              onChangeText={setCargo}
              placeholder="Ex.: Cientista de Dados Júnior"
              placeholderTextColor="#9CA3AF"
            />

            <Text style={styles.label}>Área</Text>
            <TextInput
              style={styles.input}
              value={area}
              onChangeText={setArea}
              placeholder="Ex.: Dados / Analytics"
              placeholderTextColor="#9CA3AF"
            />

            <Text style={styles.label}>Demanda</Text>
            <TextInput
              style={styles.input}
              value={demanda}
              onChangeText={setDemanda}
              placeholder="Ex.: Alta, em crescimento, etc."
              placeholderTextColor="#9CA3AF"
            />

            <Text style={styles.label}>Descrição</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={descricao}
              onChangeText={setDescricao}
              placeholder="Conte um pouco sobre o papel, responsabilidades, contexto…"
              placeholderTextColor="#9CA3AF"
              multiline
            />

            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleSave}
                disabled={saving}
              >
                <Text style={styles.primaryButtonText}>
                  {saving ? 'Salvando…' : editingId ? 'Atualizar' : 'Salvar'}
                </Text>
              </TouchableOpacity>

              {editingId && (
                <TouchableOpacity style={styles.secondaryButton} onPress={resetForm}>
                  <Text style={styles.secondaryButtonText}>Cancelar</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          <Text style={styles.sectionTitle}>Seus objetivos cadastrados</Text>

          {isLoading && (
            <View style={styles.loaderContainer}>
              <ActivityIndicator />
            </View>
          )}

          {isError && (
            <TouchableOpacity onPress={refetch}>
              <Text style={styles.errorText}>
                Não foi possível carregar os objetivos. Toque para tentar novamente.
              </Text>
            </TouchableOpacity>
          )}

          {!isLoading &&
            !isError &&
            objetivos.map((obj) => (
              <View key={obj.id} style={styles.card}>
                <Text style={styles.cardTitle}>{obj.cargo}</Text>

                <View style={styles.cardTagRow}>
                  {!!obj.area && <Text style={styles.cardTag}>Área: {obj.area}</Text>}
                  {!!obj.demanda && <Text style={styles.cardTag}>Demanda: {obj.demanda}</Text>}
                </View>

                {!!obj.descricao && (
                  <Text style={styles.cardDesc}>{obj.descricao}</Text>
                )}

                <View style={styles.cardActionsRow}>
                  <TouchableOpacity
                    style={styles.smallBtn}
                    onPress={() => handleEditFill(obj)}
                  >
                    <Text style={styles.smallBtnText}>Editar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.smallBtn, styles.smallBtnDanger]}
                    onPress={() => handleDelete(obj.id)}
                  >
                    <Text style={[styles.smallBtnText, styles.smallBtnDangerText]}>
                      Excluir
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
        </ScrollView>
      </KeyboardAvoidingView>
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
      paddingTop: 20,
      paddingBottom: 32,
    },
    headerTitle: {
      fontSize: 22,
      fontWeight: '800',
      color: colors.text,
      marginBottom: 4,
    },
    headerSubtitle: {
      fontSize: 14,
      color: colors.textMuted,
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.text,
      marginTop: 12,
      marginBottom: 8,
    },
    card: {
      borderRadius: 15,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 14,
      paddingVertical: 12,
      marginBottom: 10,
    },
    cardTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 4,
    },
    cardTagRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginBottom: 4,
    },
    cardTag: {
      fontSize: 12,
      color: colors.textMuted,
      marginRight: 10,
    },
    cardDesc: {
      fontSize: 13,
      color: colors.textMuted,
      marginBottom: 8,
    },
    cardActionsRow: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: 8,
    },
    smallBtn: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.border,
    },
    smallBtnText: {
      fontSize: 12,
      color: colors.text,
      fontWeight: '600',
    },
    smallBtnDanger: {
      borderColor: colors.danger,
    },
    smallBtnDangerText: {
      color: colors.danger,
    },
    fieldCard: {
      borderRadius: 16,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 14,
      paddingVertical: 12,
      marginBottom: 12,
    },
    label: {
      fontSize: 12,
      color: colors.textMuted,
      marginBottom: 4,
    },
    input: {
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 10,
      paddingVertical: 8,
      fontSize: 14,
      color: colors.text,
      backgroundColor: colors.surface,
      marginBottom: 8,
    },
    textArea: {
      minHeight: 70,
      textAlignVertical: 'top',
    },
    actionsRow: {
      flexDirection: 'row',
      marginTop: 4,
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
    secondaryButton: {
      flex: 1,
      borderRadius: 14,
      paddingVertical: 13,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    secondaryButtonText: {
      color: colors.text,
      fontWeight: '600',
      fontSize: 14,
    },
    loaderContainer: {
      marginTop: 16,
      alignItems: 'center',
    },
    errorText: {
      marginTop: 16,
      textAlign: 'center',
      fontSize: 13,
      color: colors.danger,
    },
  });