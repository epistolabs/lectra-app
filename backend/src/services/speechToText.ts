import { SpeechClient } from '@google-cloud/speech';
import { google } from '@google-cloud/speech/build/protos/protos';

export class SpeechToTextService {
  private client: SpeechClient;

  constructor() {
    // Initialize the Google Speech client
    // Credentials are loaded from GOOGLE_APPLICATION_CREDENTIALS env variable
    this.client = new SpeechClient();
  }

  /**
   * Transcribes audio buffer using Google Speech-to-Text API
   * @param audioBuffer - Audio file buffer
   * @param mimeType - Audio MIME type (e.g., 'audio/wav', 'audio/mpeg')
   * @returns Transcribed text
   */
  async transcribeAudio(
    audioBuffer: Buffer,
    mimeType: string = 'audio/wav'
  ): Promise<string> {
    try {
      // Detect audio encoding from MIME type
      const encoding = this.getEncodingFromMimeType(mimeType);

      // Configure request
      const audio: google.cloud.speech.v1.IRecognitionAudio = {
        content: audioBuffer.toString('base64'),
      };

      const config: google.cloud.speech.v1.IRecognitionConfig = {
        encoding: encoding,
        sampleRateHertz: 16000, // Default sample rate
        languageCode: 'en-US',
        enableAutomaticPunctuation: true,
        model: 'default',
        useEnhanced: true,
      };

      const request: google.cloud.speech.v1.IRecognizeRequest = {
        audio: audio,
        config: config,
      };

      // Perform transcription
      const [response] = await this.client.recognize(request);

      // Extract transcription from response
      if (!response.results || response.results.length === 0) {
        return '';
      }

      const transcription = response.results
        .map((result: any) => result.alternatives?.[0]?.transcript || '')
        .join('\n')
        .trim();

      return transcription;
    } catch (error) {
      console.error('Speech-to-Text error:', error);
      throw new Error(
        `Transcription failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Maps MIME type to Google Speech encoding
   */
  private getEncodingFromMimeType(
    mimeType: string
  ): google.cloud.speech.v1.RecognitionConfig.AudioEncoding {
    const mimeToEncoding: Record<
      string,
      google.cloud.speech.v1.RecognitionConfig.AudioEncoding
    > = {
      'audio/wav': google.cloud.speech.v1.RecognitionConfig.AudioEncoding.LINEAR16,
      'audio/x-wav': google.cloud.speech.v1.RecognitionConfig.AudioEncoding.LINEAR16,
      'audio/mpeg': google.cloud.speech.v1.RecognitionConfig.AudioEncoding.MP3,
      'audio/mp3': google.cloud.speech.v1.RecognitionConfig.AudioEncoding.MP3,
      'audio/mp4': google.cloud.speech.v1.RecognitionConfig.AudioEncoding.MP3,
      'audio/m4a': google.cloud.speech.v1.RecognitionConfig.AudioEncoding.MP3,
      'audio/ogg': google.cloud.speech.v1.RecognitionConfig.AudioEncoding.OGG_OPUS,
      'audio/webm': google.cloud.speech.v1.RecognitionConfig.AudioEncoding.WEBM_OPUS,
      'audio/flac': google.cloud.speech.v1.RecognitionConfig.AudioEncoding.FLAC,
    };

    return (
      mimeToEncoding[mimeType] ||
      google.cloud.speech.v1.RecognitionConfig.AudioEncoding.LINEAR16
    );
  }

  /**
   * Transcribes long audio files using asynchronous recognition
   * (For files longer than 1 minute)
   */
  async transcribeLongAudio(
    audioBuffer: Buffer,
    mimeType: string = 'audio/wav'
  ): Promise<string> {
    try {
      const encoding = this.getEncodingFromMimeType(mimeType);

      const audio: google.cloud.speech.v1.IRecognitionAudio = {
        content: audioBuffer.toString('base64'),
      };

      const config: google.cloud.speech.v1.IRecognitionConfig = {
        encoding: encoding,
        sampleRateHertz: 16000,
        languageCode: 'en-US',
        enableAutomaticPunctuation: true,
        model: 'default',
        useEnhanced: true,
      };

      const request: google.cloud.speech.v1.ILongRunningRecognizeRequest = {
        audio: audio,
        config: config,
      };

      // Start long-running operation
      const [operation] = await this.client.longRunningRecognize(request);

      // Wait for operation to complete
      const [response] = await operation.promise();

      if (!response.results || response.results.length === 0) {
        return '';
      }

      const transcription = response.results
        .map((result: any) => result.alternatives?.[0]?.transcript || '')
        .join('\n')
        .trim();

      return transcription;
    } catch (error) {
      console.error('Long audio transcription error:', error);
      throw new Error(
        `Long transcription failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}

export default new SpeechToTextService();
