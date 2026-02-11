import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  Modal,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { Transcription } from '../types/api';
import ExportService from '../services/exportService';
import Toast from 'react-native-toast-message';
import * as Haptics from 'expo-haptics';

interface ExportModalProps {
  visible: boolean;
  onClose: () => void;
  transcription: Transcription;
}

export function ExportModal({ visible, onClose, transcription }: ExportModalProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [isExporting, setIsExporting] = useState(false);

  const handleExportText = async () => {
    try {
      setIsExporting(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      await ExportService.exportAsText(transcription);

      Toast.show({
        type: 'success',
        text1: 'Exported',
        text2: 'Transcription exported as text',
      });

      onClose();
    } catch (error) {
      console.error('Export text error:', error);
      Toast.show({
        type: 'error',
        text1: 'Export Failed',
        text2: error instanceof Error ? error.message : 'Failed to export as text',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      setIsExporting(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      await ExportService.exportAsPDF(transcription);

      Toast.show({
        type: 'success',
        text1: 'Exported',
        text2: 'Transcription exported as PDF',
      });

      onClose();
    } catch (error) {
      console.error('Export PDF error:', error);
      Toast.show({
        type: 'error',
        text1: 'Export Failed',
        text2: error instanceof Error ? error.message : 'Failed to export as PDF',
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
      transparent={false}
    >
      <SafeAreaView
        style={[styles.container, { backgroundColor: isDark ? '#000000' : '#f2f2f7' }]}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: isDark ? '#ffffff' : '#000000' }]}>
            Export Transcription
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton} disabled={isExporting}>
            <Text style={[styles.closeText, { color: '#007aff' }]}>Close</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={[styles.description, { color: isDark ? '#8e8e93' : '#636366' }]}>
            Choose a format to export your transcription
          </Text>

          {/* Export Options */}
          <TouchableOpacity
            style={[
              styles.optionButton,
              { backgroundColor: isDark ? '#1c1c1e' : '#ffffff' },
            ]}
            onPress={handleExportText}
            disabled={isExporting}
          >
            <View style={styles.optionContent}>
              <View style={styles.optionIcon}>
                <Text style={styles.optionIconText}>📄</Text>
              </View>
              <View style={styles.optionInfo}>
                <Text style={[styles.optionTitle, { color: isDark ? '#ffffff' : '#000000' }]}>
                  Export as Text
                </Text>
                <Text style={[styles.optionSubtitle, { color: isDark ? '#8e8e93' : '#636366' }]}>
                  Plain text file (.txt)
                </Text>
              </View>
              {isExporting && <ActivityIndicator size="small" color="#007aff" />}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.optionButton,
              { backgroundColor: isDark ? '#1c1c1e' : '#ffffff' },
            ]}
            onPress={handleExportPDF}
            disabled={isExporting}
          >
            <View style={styles.optionContent}>
              <View style={styles.optionIcon}>
                <Text style={styles.optionIconText}>📑</Text>
              </View>
              <View style={styles.optionInfo}>
                <Text style={[styles.optionTitle, { color: isDark ? '#ffffff' : '#000000' }]}>
                  Export as PDF
                </Text>
                <Text style={[styles.optionSubtitle, { color: isDark ? '#8e8e93' : '#636366' }]}>
                  Formatted PDF document with metadata
                </Text>
              </View>
              {isExporting && <ActivityIndicator size="small" color="#007aff" />}
            </View>
          </TouchableOpacity>

          {isExporting && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#007aff" />
              <Text style={[styles.loadingText, { color: isDark ? '#8e8e93' : '#636366' }]}>
                Preparing export...
              </Text>
            </View>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#3a3a3c',
  },
  title: {
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
  content: {
    padding: 16,
  },
  description: {
    fontSize: 15,
    marginBottom: 24,
    textAlign: 'center',
  },
  optionButton: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#007aff20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  optionIconText: {
    fontSize: 24,
  },
  optionInfo: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 4,
  },
  optionSubtitle: {
    fontSize: 14,
  },
  loadingContainer: {
    alignItems: 'center',
    marginTop: 32,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
  },
});
