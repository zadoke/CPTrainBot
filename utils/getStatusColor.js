function getStatusColor(info) {
    switch (true) {
        case info.includes('Atraso previsto de'):
            return '🟡';
        case info === 'SUPRIMIDO':
            return '🔴';
        default:
            return '🟢';
    }
}

module.exports = getStatusColor;