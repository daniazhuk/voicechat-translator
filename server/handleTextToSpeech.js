export const handleTextToSpeech = async (textToSpeak, voiceLanguage) => {
    const apiKey = process.env.GOOGLE_API_KEY;
    const language =
        voiceLanguage.toString() === 'auto'
            ? undefined
            : voiceLanguage.toString();
    const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`;
    const voiceOptions =  {
            languageCode: language ?? 'en-us',
        }
    const response = await fetch(url, {
        method: 'POST',
        body: JSON.stringify({
            input: { text: textToSpeak },
            voice: {
                ...voiceOptions,
            },
            audioConfig: { audioEncoding: 'MP3' },
        }),
    });
    const result = await response.json();
    if (!result.audioContent) {
        console.error(result);
    }
    return result.audioContent
}
