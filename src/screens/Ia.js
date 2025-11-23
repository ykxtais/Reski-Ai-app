import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useThemedStyles } from '../context/themeContext';
import { api } from '../services/api';
import { auth } from '../firebase/firebaseConfig';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const STORAGE_CHATS = '@reski_ai_chats';

function initialHistory() {
  return [
    {
      from: 'bot',
      text: 'Olá! Sou a Reski IA. Me diga seu objetivo de carreira e eu sugiro trilhas.',
    },
  ];
}

let nextId = 2;

function createChat(id = 1) {
  return {
    id,
    title: `Chat ${id}`,
    history: initialHistory(),
  };
}

export default function Ia() {
  const styles = useThemedStyles(makeStyles);

  const user = auth.currentUser;
  const userId = user?.uid || user?.email || 'anon';
  const chatsKey = `${STORAGE_CHATS}:${userId}`;

  const [chats, setChats] = useState(null); 
  const [activeChatId, setActiveChatId] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStorage, setLoadingStorage] = useState(true);

  const scrollRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const json = await AsyncStorage.getItem(chatsKey);

        if (json) {
          const parsed = JSON.parse(json);

          const loadedChats = Array.isArray(parsed.chats)
            ? parsed.chats
            : [createChat(1)];

          setChats(loadedChats);

          const firstId =
            parsed.activeChatId ??
            (loadedChats[0] ? loadedChats[0].id : 1);
          setActiveChatId(firstId);

          const maxId =
            loadedChats.length > 0
              ? Math.max(...loadedChats.map((c) => c.id))
              : 1;
          nextId = maxId + 1;
        } else {
          const firstChat = createChat(1);
          setChats([firstChat]);
          setActiveChatId(1);
          nextId = 2;
        }
      } catch (e) {
        console.log('Erro ao carregar chats da IA', e);
        const firstChat = createChat(1);
        setChats([firstChat]);
        setActiveChatId(1);
        nextId = 2;
      } finally {
        setLoadingStorage(false);
      }
    })();
  }, [chatsKey]);

  useEffect(() => {
    if (!chats) return;

    const data = JSON.stringify({ chats, activeChatId });
    AsyncStorage.setItem(chatsKey, data).catch((e) =>
      console.log('Erro ao salvar chats da IA', e),
    );
  }, [chats, activeChatId, chatsKey]);

  const activeChat =
    chats && chats.find((c) => c.id === activeChatId);
  const history = activeChat ? activeChat.history : [];

  function scrollToEnd() {
    if (scrollRef.current) {
      scrollRef.current.scrollToEnd({ animated: true });
    }
  }

  function updateChatHistory(chatId, newHistory) {
    setChats((prev) =>
      prev.map((c) =>
        c.id === chatId ? { ...c, history: newHistory } : c,
      ),
    );
  }

  async function handleSend() {
    if (!message.trim() || loading || !activeChat) return;

    const text = message.trim();
    setMessage('');

    updateChatHistory(activeChat.id, [
      ...activeChat.history,
      { from: 'user', text },
    ]);

    try {
      setLoading(true);

      const res = await api.post('/chat', { mensagem: text });

      const resposta =
        res.data?.resposta || 'Sem resposta no momento.';

      setChats((prev) =>
        prev.map((c) =>
          c.id === activeChat.id
            ? {
                ...c,
                history: [
                  ...c.history,
                  { from: 'bot', text: resposta },
                ],
              }
            : c,
        ),
      );
    } catch (e) {
      console.log('ERRO IA ====>', {
        message: e.message,
        status: e.response?.status,
        data: e.response?.data,
      });

      setChats((prev) =>
        prev.map((c) =>
          c.id === activeChat.id
            ? {
                ...c,
                history: [
                  ...c.history,
                  {
                    from: 'bot',
                    text: 'Erro ao se comunicar com a IA.',
                  },
                ],
              }
            : c,
        ),
      );
    } finally {
      setLoading(false);
    }
  }

  function handleClearChat() {
    if (!activeChat) return;
    updateChatHistory(activeChat.id, initialHistory());
  }

  function handleNewChat() {
    const newId = nextId++;
    const newChat = createChat(newId);
    setChats((prev) => [...prev, newChat]);
    setActiveChatId(newId);
  }

  function handleSelectChat(id) {
    setActiveChatId(id);
  }

  function handleDeleteChat(id) {
    setChats((prev) => {
      if (prev.length === 1) {
        const firstChat = createChat(1);
        setActiveChatId(1);
        nextId = 2;
        return [firstChat];
      }

      const filtered = prev.filter((c) => c.id !== id);

      if (id === activeChatId) {
        const fallback = filtered[filtered.length - 1];
        setActiveChatId(fallback.id);
      }
      return filtered;
    });
  }

  if (loadingStorage || !chats) {
    return (
      <View style={styles.root}>
        <View style={styles.loadingCenter}>
          <ActivityIndicator size="large" color="#FDBA74" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.container}>
          <View style={styles.headerRow}>
            <Text style={styles.headerTitle}>Reski IA</Text>
          </View>

          <Text style={styles.headerSubtitle}>
            Converse com a IA e receba sugestões personalizadas.
          </Text>

          <View style={styles.chatsRow}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chatsScroll}
            >
              {chats.map((chat) => {
                const isActive = chat.id === activeChatId;
                return (
                  <TouchableOpacity
                    key={chat.id}
                    style={[
                      styles.chatChip,
                      isActive && styles.chatChipActive,
                    ]}
                    onPress={() => handleSelectChat(chat.id)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.chatChipText,
                        isActive && styles.chatChipTextActive,
                      ]}
                    >
                      {chat.title}
                    </Text>
                    <TouchableOpacity
                      style={styles.closeChatBtn}
                      onPress={() => handleDeleteChat(chat.id)}
                      hitSlop={{
                        top: 8,
                        bottom: 8,
                        left: 8,
                        right: 8,
                      }}
                    >
                      <Text
                        style={[
                          styles.closeChatText,
                          isActive && styles.closeChatTextActive,
                        ]}
                      >
                        ×
                      </Text>
                    </TouchableOpacity>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.smallButton}
              onPress={handleClearChat}
            >
              <Text style={styles.smallButtonText}>Limpar chat</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.smallButton}
              onPress={handleNewChat}
            >
              <Text style={styles.smallButtonText}>Novo chat</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.chatBox}>
            <ScrollView
              ref={scrollRef}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.messagesContent}
              onContentSizeChange={scrollToEnd}
            >
              {history.map((m, i) => (
                <View key={i} style={styles.bubbleRow}>
                  <View
                    style={
                      m.from === 'user'
                        ? styles.bubbleUser
                        : styles.bubbleBot
                    }
                  >
                    <Text
                      style={
                        m.from === 'user'
                          ? styles.bubbleUserText
                          : styles.bubbleBotText
                      }
                    >
                      {m.text}
                    </Text>
                  </View>
                </View>
              ))}
            </ScrollView>

            {loading && (
              <ActivityIndicator size="small" style={{ marginTop: 4 }} />
            )}
          </View>

          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Digite sua mensagem..."
              placeholderTextColor="#808080"
              value={message}
              onChangeText={setMessage}
              multiline
            />
            <TouchableOpacity
              style={styles.sendButton}
              onPress={handleSend}
              disabled={loading}
            >
              <Text style={styles.sendButtonText}>
                {loading ? 'Enviando...' : 'Enviar'}
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.hintText}>
            Dica: experimente perguntar algo como “Quero ser desenvolvedor
            backend Java” ou “Quero migrar para dados”.
          </Text>
        </View>
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
    loadingCenter: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    container: {
      flex: 1,
      height: SCREEN_HEIGHT,
      paddingHorizontal: 19,
      paddingTop: 15,
      paddingBottom: 15,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 5,
    },
    headerTitle: {
      fontSize: 22,
      fontWeight: '800',
      color: colors.text,
    },
    headerSubtitle: {
      fontSize: 14,
      color: colors.textMuted,
      marginBottom: 9,
    },
    chatsRow: {
      flexDirection: 'row',
      marginBottom: 5,
    },
    chatsScroll: {
      flexGrow: 0,
    },
    chatChip: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 999,
      borderWidth: 1,
      marginRight: 8,
      backgroundColor: colors.card,
      borderColor: colors.border,
    },
    chatChipActive: {
      backgroundColor: colors.accent,
      borderColor: colors.accent,
    },
    chatChipText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.text,
    },
    chatChipTextActive: {
      color: colors.onPrimary,
    },
    closeChatBtn: {
      marginLeft: 6,
      padding: 2,
    },
    closeChatText: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.textMuted,
    },
    closeChatTextActive: {
      color: colors.onPrimary,
    },
    actionRow: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginBottom: 10,
    },
    smallButton: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      marginLeft: 8,
    },
    smallButtonText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.text,
    },
    chatBox: {
      flex: 1,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      padding: 15,
      marginBottom: 15,
      minHeight: SCREEN_HEIGHT * 0.5,
      maxHeight: SCREEN_HEIGHT * 0.5,
    },
    messagesContent: {
      flexGrow: 1,
    },
    bubbleRow: { marginBottom: 8 },
    bubbleBot: {
      alignSelf: 'flex-start',
      maxWidth: '85%',
      backgroundColor: colors.card,
      padding: 10,
      borderRadius: 12,
      borderBottomLeftRadius: 4,
      borderWidth: 1,
      borderColor: colors.border,
    },
    bubbleBotText: { color: colors.text, fontSize: 14 },
    bubbleUser: {
      alignSelf: 'flex-end',
      maxWidth: '85%',
      backgroundColor: colors.primary,
      padding: 10,
      borderRadius: 12,
      borderBottomRightRadius: 4,
    },
    bubbleUserText: { color: colors.onPrimary, fontSize: 14 },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 6,
    },
    input: {
      flex: 1,
      backgroundColor: colors.card,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: 999,
      paddingHorizontal: 14,
      paddingVertical: 10,
      color: colors.text,
      fontSize: 14,
    },
    sendButton: {
      backgroundColor: colors.accent,
      paddingVertical: 10,
      paddingHorizontal: 18,
      marginLeft: 8,
      borderRadius: 999,
    },
    sendButtonText: {
      color: colors.onPrimary,
      fontWeight: '700',
      fontSize: 13,
    },
    hintText: {
      fontSize: 12,
      color: colors.textMuted,
      marginTop: 10,
    },
  });
