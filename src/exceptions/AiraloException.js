class AiraloException extends Error {
    constructor(message) {
        super(message);
        this.name = 'AiraloException';
    }
}

module.exports = AiraloException;