function parseMalformedJson(s) {
    if (!s || typeof s !== 'string') return [];
    try {
        // fix doubled quotes "" -> " and ensure valid JSON
        const fixed = s.replace(/""/g, '"').replace(/^"|"$/g, '');
        return JSON.parse(fixed);
    } catch (e) {
        // fallback: return original string in array
        return [s];
    }
}
