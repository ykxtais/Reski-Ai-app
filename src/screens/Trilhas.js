
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { useThemedStyles, useTheme } from '../context/themeContext';
import { auth } from '../firebase/firebaseConfig';

export default function Trilhas() {
  const styles = useThemedStyles(makeStyles);
  const { colors } = useTheme();
  const queryClient = useQueryClient();

  const { data: trilhas = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['trilhas'],
    queryFn: fetchTrilhas,
  });

  const [tab, setTab] = useState('minhas');
  const [form, setForm] = useState({
    conteudo: '',
    status: '',
    competencia: '',
  });
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const user = auth.currentUser;
  const userEmail = user?.email;

  const minhasTrilhas = trilhas;

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function resetForm() {
    setForm({ conteudo: '', status: '', competencia: '' });
    setEditingId(null);
  }

  async function handleSubmit() {
    if (!form.conteudo.trim() || !form.competencia.trim()) {
      Alert.alert('Ops', 'Preencha pelo menos conteúdo e competência.');
      return;
    }

    try {
      setSaving(true);

      const payload = {
        conteudo: form.conteudo.trim(),
        status: form.status.trim(),
        competencia: form.competencia.trim(),
      };

      if (editingId) {
        await api.put(`/trilhas/${editingId}`, payload);
      } else {
        await api.post('/trilhas', payload);
      }

      await queryClient.invalidateQueries({ queryKey: ['trilhas'] });
      resetForm();
      setTab('minhas');
    } catch (e) {
      console.log('ERRO SALVAR TRILHA ===>', e.response?.data || e.message);
      Alert.alert('Erro', 'Não foi possível salvar a trilha.');
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(t) {
    setEditingId(t.id);
    setForm({
      conteudo: t.conteudo || '',
      status: t.status || '',
      competencia: t.competencia || '',
    });
    setTab('minhas');
  }

  async function handleDelete(id) {
    Alert.alert(
      'Excluir trilha',
      'Tem certeza que deseja remover esta trilha?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/trilhas/${id}`);
              await queryClient.invalidateQueries({ queryKey: ['trilhas'] });
            } catch (e) {
              console.log('ERRO DELETE TRILHA ===>', e.response?.data || e.message);
              Alert.alert('Erro', 'Não foi possível excluir a trilha.');
            }
          },
        },
      ],
    );
  }

  async function fetchTrilhas() {
  const res = await api.get('/trilhas', {
    params: {
      pageNumber: 0,
      pageSize: 50,
      sort: 'id,asc',
    }});
  return res.data?.content ?? [];
}

function InspirationCard({ icon, title, subtitle, description, colors }) {
  return (
    <View
      style={[
        stylesBase.inspCard,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <View
        style={[
          stylesBase.inspIconCircle,
          { backgroundColor: colors.primary + '22' },
        ]}
      >
        <Ionicons name={icon} size={24} color={colors.primary} />
      </View>

      <View style={stylesBase.inspTextBox}>
        <Text style={[stylesBase.inspTitle, { color: colors.text }]}>
          {title}
        </Text>
        <Text style={[stylesBase.inspSubtitle, { color: colors.textMuted }]}>
          {subtitle}
        </Text>
        {description ? (
          <Text style={[stylesBase.inspDesc, { color: colors.textMuted }]}>
            {description}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

  const inspiracoes = [
    {
      id: 1,
      icon: 'laptop-outline',
      title: 'Desenvolvedor de Software',
      subtitle: 'Fundamentos de programação e boas práticas.',
      description:
        'Algoritmos, estrutura de dados, orientação a objetos e versionamento com Git.',
    },
    {
      id: 2,
      icon: 'cloud-outline',
      title: 'Infraestrutura e Nuvem',
      subtitle: 'Ambientes em cloud e automação.',
      description:
        'Linux, redes, Docker, pipelines CI/CD e serviços básicos de cloud (Azure/AWS).',
    },
    {
      id: 3,
      icon: 'shield-outline',
      title: 'Cibersegurança',
      subtitle: 'Proteção de aplicações e dados.',
      description:
        'Segurança em redes, hardening, análise de vulnerabilidades e resposta a incidentes.',
    },
    {
      id: 4,
      icon: 'brush-outline',
      title: 'UX/UI Designer',
      subtitle: 'Experiência e interface do usuário.',
      description:
        'Pesquisa com usuário, wireframes, protótipos, design systems e testes de usabilidade.',
    },
    {
      id: 5,
      icon: 'analytics-outline',
      title: 'Analista de Dados',
      subtitle: 'Transforme dados em decisões.',
      description:
        'SQL, modelagem de dados, BI, Python para análise e visualização de dashboards.',
    },
    {
      id: 6,
      icon: 'code-working',
      title: 'Desenvolvedor Front-end',
      subtitle: 'Interfaces modernas e responsivas.',
      description:
        'HTML, CSS, JavaScript, frameworks SPA e consumo de APIs REST.',
    },
  ];

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: 90 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.headerTitle}>Trilhas</Text>
        <Text style={styles.headerSubtitle}>
          Transforme planos em ações reais. Crie, acompanhe e se inspire em trilhas de estudo.
        </Text>

        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[
              styles.tabBtn,
              tab === 'minhas' && styles.tabBtnActive,
            ]}
            onPress={() => setTab('minhas')}
          >
            <Text
              style={[
                styles.tabBtnText,
                tab === 'minhas' && styles.tabBtnActiveText,
              ]}
            >
              Minhas trilhas
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabBtn,
              tab === 'inspiracao' && styles.tabBtnActive,
            ]}
            onPress={() => setTab('inspiracao')}
          >
            <Text
              style={[
                styles.tabBtnText,
                tab === 'inspiracao' && styles.tabBtnActiveText,
              ]}
            >
              Inspiração
            </Text>
          </TouchableOpacity>
        </View>

        {tab === 'minhas' && (
          <>
            <Text style={styles.sectionTitle}>Criar / atualizar trilha</Text>
            <Text style={styles.sectionSubtitle}>
              Preencha os campos abaixo para registrar conteúdos que compõem sua trilha de estudo.
            </Text>

            <View style={styles.formCard}>
              <Text style={styles.fieldLabel}>Conteúdo</Text>
              <TextInput
                style={styles.input}
                value={form.conteudo}
                onChangeText={(v) => handleChange('conteudo', v)}
                placeholder="Ex: Fundamentos da cibersegurança"
                placeholderTextColor="#9CA3AF"
              />

              <Text style={styles.fieldLabel}>Status</Text>
              <TextInput
                style={styles.input}
                value={form.status}
                onChangeText={(v) => handleChange('status', v)}
                placeholder="Ex: Em andamento / Finalizado"
                placeholderTextColor="#9CA3AF"
              />

              <Text style={styles.fieldLabel}>Competência</Text>
              <TextInput
                style={styles.input}
                value={form.competencia}
                onChangeText={(v) => handleChange('competencia', v)}
                placeholder="Ex: Segurança em redes"
                placeholderTextColor="#9CA3AF"
              />

              <View style={styles.formButtonsRow}>
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={handleSubmit}
                  disabled={saving}
                >
                  <Text style={styles.primaryButtonText}>
                    {saving
                      ? 'Salvando...'
                      : editingId
                      ? 'Atualizar trilha'
                      : 'Salvar trilha'}
                  </Text>
                </TouchableOpacity>

                {editingId && (
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={resetForm}
                  >
                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <Text style={styles.sectionTitle}>Suas trilhas cadastradas</Text>

            {isLoading && (
              <View style={styles.loaderContainer}>
                <ActivityIndicator />
              </View>
            )}

            {isError && (
              <TouchableOpacity onPress={refetch}>
                <Text style={styles.errorText}>
                  Não foi possível carregar as trilhas. Toque para tentar novamente.
                </Text>
              </TouchableOpacity>
            )}

            {!isLoading &&
              !isError &&
              minhasTrilhas.map((t) => (
                <View key={t.id} style={styles.card}>
                  <Text style={styles.cardTitle}>{t.conteudo}</Text>
                  {!!t.status && (
                    <Text style={styles.cardStatus}>{t.status}</Text>
                  )}
                  <Text style={styles.cardText}>{t.competencia}</Text>

                  <View style={styles.cardActionsRow}>
                    <TouchableOpacity
                      style={styles.smallBtn}
                      onPress={() => handleEdit(t)}
                    >
                      <Text style={styles.smallBtnText}>Editar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.smallBtn, styles.smallBtnDanger]}
                      onPress={() => handleDelete(t.id)}
                    >
                      <Text
                        style={[
                          styles.smallBtnText,
                          styles.smallBtnDangerText,
                        ]}
                      >
                        Excluir
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
          </>
        )}

        {tab === 'inspiracao' && (
          <>
            <Text style={styles.sectionTitle}>Trilhas de estudo mais famosas</Text>
            <Text style={styles.sectionSubtitle}>
              Use essas trilhas como ponto de partida para montar o seu plano ou adaptar à sua realidade.
            </Text>

            {inspiracoes.map((item) => (
              <InspirationCard
                key={item.id}
                icon={item.icon}
                title={item.title}
                subtitle={item.subtitle}
                description={item.description}
                colors={colors}
              />
            ))}
          </>
        )}
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
      marginBottom: 18,
    },
    tabRow: {
      flexDirection: 'row',
      borderRadius: 999,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 3,
      marginBottom: 18,
    },
    tabBtn: {
      flex: 1,
      paddingVertical: 8,
      borderRadius: 999,
      alignItems: 'center',
      justifyContent: 'center',
    },
    tabBtnText: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.textMuted,
    },
    tabBtnActive: {
      backgroundColor: colors.accent,
    },
    tabBtnActiveText: {
      color: colors.onPrimary,
    },
    sectionTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 8,
      marginTop: 6,
    },
    sectionSubtitle: {
      fontSize: 13,
      color: colors.textMuted,
      marginBottom: 12,
    },
    formCard: {
      borderRadius: 16,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 16,
      paddingVertical: 14,
      marginBottom: 16,
    },
    fieldLabel: {
      fontSize: 12,
      color: colors.textMuted,
      marginBottom: 4,
      marginTop: 4,
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
    },
    formButtonsRow: {
      flexDirection: 'row',
      marginTop: 14,
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
      borderWidth: 1,
      borderColor: colors.border,
    },
    cancelButtonText: {
      color: colors.text,
      fontWeight: '600',
      fontSize: 14,
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
    cardStatus: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.accent,
      marginBottom: 4,
    },
    cardText: {
      fontSize: 13,
      color: colors.textMuted,
      marginBottom: 6,
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
      fontWeight: '600',
      color: colors.text,
    },
    smallBtnDanger: {
      borderColor: colors.danger,
    },
    smallBtnDangerText: {
      color: colors.danger,
    },
    loaderContainer: {
      marginTop: 16,
      alignItems: 'center',
    },
    errorText: {
      marginTop: 16,
      textAlign: 'center',
      color: colors.danger,
      fontSize: 13,
    },
  });

const stylesBase = StyleSheet.create({
  inspCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    marginBottom: 10,
  },
  inspIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  inspTextBox: {
    flex: 1,
  },
  inspTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  inspSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  inspDesc: {
    fontSize: 12,
    marginTop: 4,
  },
});