export const handleTranslation = async (text,translationLanguage) => {
    if (text) {
        const apiKey = process.env.DEEPL_API_KEY;
        const params = new URLSearchParams();
        params.append('text', text.replace(/\\newLine/g, ' '));
        params.append('target_lang', translationLanguage.substring(0, 2));
        const response = await fetch('https://api-free.deepl.com/v2/translate', {
            method: 'POST',
            headers: {
                Authorization: 'DeepL-Auth-Key ' + apiKey,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params.toString(),
        }).catch((error) => console.error('Error:', error));
        const result = await response?.json();
        if (!result.translations) {
            console.error('result', result);
            throw new Error(result.error?.message || 'Failed to get translation');
        }
        return result.translations[0].text;
    }
};
