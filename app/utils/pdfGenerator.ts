/**
 * PDF template generator for transcriptions
 */

import { Transcription } from '../types/api';
import { formatDateTime } from './dateHelpers';
import { formatDuration, formatFileSize } from './audioHelpers';
import { getLanguageName } from '../constants/languages';

export function generatePDFHTML(transcription: Transcription): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Transcription - ${transcription.audio_file_name}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      padding: 40px;
      max-width: 800px;
      margin: 0 auto;
    }

    .header {
      border-bottom: 3px solid #007aff;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }

    .header h1 {
      font-size: 28px;
      color: #007aff;
      margin-bottom: 10px;
    }

    .header .subtitle {
      color: #666;
      font-size: 14px;
    }

    .metadata {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 30px;
    }

    .metadata-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #e0e0e0;
    }

    .metadata-row:last-child {
      border-bottom: none;
    }

    .metadata-label {
      font-weight: 600;
      color: #666;
    }

    .metadata-value {
      color: #333;
    }

    .transcription-section {
      margin-top: 30px;
    }

    .transcription-section h2 {
      font-size: 20px;
      color: #333;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 2px solid #e0e0e0;
    }

    .transcription-text {
      font-size: 16px;
      line-height: 1.8;
      color: #333;
      text-align: justify;
      white-space: pre-wrap;
      word-wrap: break-word;
    }

    .footer {
      margin-top: 50px;
      padding-top: 20px;
      border-top: 1px solid #e0e0e0;
      text-align: center;
      color: #999;
      font-size: 12px;
    }

    @media print {
      body {
        padding: 20px;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Lectra Transcription</h1>
    <div class="subtitle">Generated on ${new Date().toLocaleString()}</div>
  </div>

  <div class="metadata">
    <div class="metadata-row">
      <div class="metadata-label">File Name</div>
      <div class="metadata-value">${escapeHTML(transcription.audio_file_name)}</div>
    </div>
    <div class="metadata-row">
      <div class="metadata-label">Date Created</div>
      <div class="metadata-value">${formatDateTime(transcription.created_at)}</div>
    </div>
    ${transcription.audio_duration_seconds ? `
    <div class="metadata-row">
      <div class="metadata-label">Duration</div>
      <div class="metadata-value">${formatDuration(transcription.audio_duration_seconds)}</div>
    </div>
    ` : ''}
    ${transcription.audio_file_size_bytes ? `
    <div class="metadata-row">
      <div class="metadata-label">File Size</div>
      <div class="metadata-value">${formatFileSize(transcription.audio_file_size_bytes)}</div>
    </div>
    ` : ''}
    <div class="metadata-row">
      <div class="metadata-label">Language</div>
      <div class="metadata-value">${getLanguageName(transcription.language_code)}</div>
    </div>
    ${transcription.word_count ? `
    <div class="metadata-row">
      <div class="metadata-label">Word Count</div>
      <div class="metadata-value">${transcription.word_count}</div>
    </div>
    ` : ''}
  </div>

  <div class="transcription-section">
    <h2>Transcription</h2>
    <div class="transcription-text">${escapeHTML(transcription.transcription_text)}</div>
  </div>

  <div class="footer">
    <p>Transcribed with Lectra AI Note Maker</p>
  </div>
</body>
</html>
  `;
}

function escapeHTML(text: string): string {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}
