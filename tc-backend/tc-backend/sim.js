export function simulateSensorData() {
    const sensorData = {
        temperature: (Math.random() * 30 + 10).toFixed(2),
        humidity: (Math.random() * 50 + 30).toFixed(2),
        battery_level: (Math.random() * 100).toFixed(2),
        signal_strength: (-50 - Math.random() * 50).toFixed(2),
        timestamp: new Date().toISOString()
    };

    // Choose randomly which fields to return but always the timestamp
    const fields = ['temperature', 'humidity', 'battery_level', 'signal_strength'];
    const numFields = Math.floor(Math.random() * fields.length) + 1; // At least one field
    const selectedFields = [];
    while (selectedFields.length < numFields) {
        const field = fields[Math.floor(Math.random() * fields.length)];
        if (!selectedFields.includes(field)) {
            selectedFields.push(field);
        }
    }

    // Create result with only selected fields plus timestamp
    const result = { timestamp: sensorData.timestamp };
    selectedFields.forEach(field => {
        result[field] = sensorData[field];
    });

    return result;
}