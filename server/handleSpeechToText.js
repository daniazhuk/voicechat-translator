export const handleSpeechToText = async (audioBase64, audioLanguage) => {
    const apiKey = process.env.GOOGLE_API_KEY;
    const language =
        audioLanguage.toString() === 'auto'
            ? undefined
            : audioLanguage.toString();

    const url = `https://speech.googleapis.com/v1/speech:recognize?key=${apiKey}`;

    const requestBody = {
        config: {
            encoding: 'LINEAR16',
            sampleRateHertz: 16000,
            languageCode: language || 'en-US',
            model: 'default',
        },
        audio: {
            content: audioBase64
        }
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            body: JSON.stringify(requestBody),
        });

        const result = await response.json();

        if (!result.results || result.results.length === 0) {
            console.error('No transcription results:', result);
            return '';
        }
        return result.results
            .map(result => result.alternatives[0].transcript)
            .join(' ');
    } catch (error) {
        console.error('Speech-to-text error:', error);
        throw new Error('Failed to transcribe speech');
    }
}
