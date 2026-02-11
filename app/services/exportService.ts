/**
 * Export service for transcriptions
 * Supports text and PDF export formats
 */

import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import { Transcription } from '../types/api';
import { generatePDFHTML } from '../utils/pdfGenerator';

export class ExportService {
  /**
   * Exports transcription as plain text file
   */
  static async exportAsText(transcription: Transcription): Promise<void> {
    try {
      // Create text content
      const textContent = this.generateTextContent(transcription);

      // Generate file name
      const fileName = this.generateFileName(transcription, 'txt');
      const fileUri = `${FileSystem.cacheDirectory}${fileName}`;

      // Write file
      await FileSystem.writeAsStringAsync(fileUri, textContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      // Share file
      const canShare = await Sharing.isAvailableAsync();
      if (!canShare) {
        throw new Error('Sharing is not available on this device');
      }

      await Sharing.shareAsync(fileUri, {
        mimeType: 'text/plain',
        dialogTitle: 'Export Transcription as Text',
      });

      // Clean up temporary file
      await FileSystem.deleteAsync(fileUri, { idempotent: true });
    } catch (error) {
      console.error('Export as text error:', error);
      throw new Error('Failed to export as text');
    }
  }

  /**
   * Exports transcription as PDF file
   */
  static async exportAsPDF(transcription: Transcription): Promise<void> {
    try {
      // Generate HTML content
      const htmlContent = generatePDFHTML(transcription);

      // Create PDF
      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
      });

      // Generate file name
      const fileName = this.generateFileName(transcription, 'pdf');
      const targetUri = `${FileSystem.cacheDirectory}${fileName}`;

      // Copy to cache with proper name
      await FileSystem.copyAsync({
        from: uri,
        to: targetUri,
      });

      // Share file
      const canShare = await Sharing.isAvailableAsync();
      if (!canShare) {
        throw new Error('Sharing is not available on this device');
      }

      await Sharing.shareAsync(targetUri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Export Transcription as PDF',
      });

      // Clean up temporary files
      await FileSystem.deleteAsync(uri, { idempotent: true });
      await FileSystem.deleteAsync(targetUri, { idempotent: true });
    } catch (error) {
      console.error('Export as PDF error:', error);
      throw new Error('Failed to export as PDF');
    }
  }

  /**
   * Generates text file content with metadata
   */
  private static generateTextContent(transcription: Transcription): string {
    const date = new Date(transcription.created_at).toLocaleString();
    const lines: string[] = [
      '='.repeat(60),
      'LECTRA TRANSCRIPTION',
      '='.repeat(60),
      '',
      `File: ${transcription.audio_file_name}`,
      `Date: ${date}`,
      `Language: ${transcription.language_code}`,
    ];

    if (transcription.word_count) {
      lines.push(`Word Count: ${transcription.word_count}`);
    }

    lines.push(
      '',
      '-'.repeat(60),
      'TRANSCRIPTION',
      '-'.repeat(60),
      '',
      transcription.transcription_text,
      '',
      '='.repeat(60),
      'Generated with Lectra AI Note Maker',
      '='.repeat(60),
    );

    return lines.join('\n');
  }

  /**
   * Generates a safe file name from transcription data
   */
  private static generateFileName(
    transcription: Transcription,
    extension: string
  ): string {
    // Use audio file name (without extension) or fallback to timestamp
    const baseName = transcription.audio_file_name
      .replace(/\.[^/.]+$/, '') // Remove extension
      .replace(/[^a-zA-Z0-9-_]/g, '_') // Replace special chars
      .substring(0, 50); // Limit length

    const timestamp = new Date().getTime();
    return `${baseName || 'transcription'}_${timestamp}.${extension}`;
  }
}

export default ExportService;
