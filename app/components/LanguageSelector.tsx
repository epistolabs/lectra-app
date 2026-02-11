import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  Modal,
  FlatList,
  SafeAreaView,
} from 'react-native';
import { SUPPORTED_LANGUAGES, Language } from '../constants/languages';
import * as Haptics from 'expo-haptics';

interface LanguageSelectorProps {
  selectedLanguageCode: string;
  onLanguageSelect: (languageCode: string) => void;
}

export function LanguageSelector({
  selectedLanguageCode,
  onLanguageSelect,
}: LanguageSelectorProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [modalVisible, setModalVisible] = useState(false);

  const selectedLanguage = SUPPORTED_LANGUAGES.find(
    (lang) => lang.code === selectedLanguageCode
  );

  const handleSelect = (languageCode: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onLanguageSelect(languageCode);
    setModalVisible(false);
  };

  const renderLanguageItem = ({ item }: { item: Language }) => {
    const isSelected = item.code === selectedLanguageCode;

    return (
      <TouchableOpacity
        onPress={() => handleSelect(item.code)}
        style={[
          styles.languageItem,
          { backgroundColor: isDark ? '#1c1c1e' : '#ffffff' },
        ]}
      >
        <View>
          <Text style={[styles.languageName, { color: isDark ? '#ffffff' : '#000000' }]}>
            {item.name}
          </Text>
          <Text style={[styles.nativeName, { color: isDark ? '#8e8e93' : '#636366' }]}>
            {item.nativeName}
          </Text>
        </View>
        {isSelected && (
          <Text style={styles.checkmark}>✓</Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <>
      <TouchableOpacity
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setModalVisible(true);
        }}
        style={[
          styles.selector,
          { backgroundColor: isDark ? '#1c1c1e' : '#ffffff' },
        ]}
      >
        <View style={styles.selectorContent}>
          <Text style={[styles.label, { color: isDark ? '#8e8e93' : '#636366' }]}>
            Language
          </Text>
          <View style={styles.selectedValue}>
            <Text style={[styles.selectedText, { color: isDark ? '#ffffff' : '#000000' }]}>
              {selectedLanguage?.nativeName || 'Select Language'}
            </Text>
            <Text style={[styles.chevron, { color: isDark ? '#8e8e93' : '#c7c7cc' }]}>
              ›
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView
          style={[styles.modalContainer, { backgroundColor: isDark ? '#000000' : '#f2f2f7' }]}
        >
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: isDark ? '#ffffff' : '#000000' }]}>
              Select Language
            </Text>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.closeButton}
            >
              <Text style={[styles.closeText, { color: '#007aff' }]}>Done</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={SUPPORTED_LANGUAGES}
            renderItem={renderLanguageItem}
            keyExtractor={(item) => item.code}
            contentContainerStyle={styles.list}
          />
        </SafeAreaView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  selector: {
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  selectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 15,
  },
  selectedValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedText: {
    fontSize: 16,
    fontWeight: '500',
    marginRight: 4,
  },
  chevron: {
    fontSize: 20,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#3a3a3c',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    padding: 8,
  },
  closeText: {
    fontSize: 17,
    fontWeight: '600',
  },
  list: {
    padding: 16,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  languageName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  nativeName: {
    fontSize: 14,
  },
  checkmark: {
    fontSize: 20,
    color: '#007aff',
    fontWeight: '600',
  },
});
