const AiraloException = require("../exceptions/AiraloException");

class CloudSimShareValidator {
  static EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  static ALLOWED_SHARING_OPTIONS = ["link", "pdf"];

  /**
   * Validates the CloudSimShare payload
   * @param {Object} simCloudShare - The cloud sim share payload
   * @param {Array} requiredFields - Array of required field names
   * @returns {boolean} - Returns true if validation passes
   * @throws {AiraloException} - Throws exception if validation fails
   */
  static validate(simCloudShare, requiredFields = []) {
    this.checkRequiredFields(simCloudShare, requiredFields);

    if (
      simCloudShare.to_email &&
      !this.EMAIL_REGEX.test(simCloudShare.to_email)
    ) {
      throw new AiraloException(
        `The to_email must be valid email address, payload: ${JSON.stringify(simCloudShare)}`,
      );
    }

    if (
      simCloudShare.sharing_option &&
      Array.isArray(simCloudShare.sharing_option)
    ) {
      for (const sharingOption of simCloudShare.sharing_option) {
        if (!this.ALLOWED_SHARING_OPTIONS.includes(sharingOption)) {
          throw new AiraloException(
            `The sharing_option may be ${this.ALLOWED_SHARING_OPTIONS.join(" or ")} or both, payload: ${JSON.stringify(simCloudShare)}`,
          );
        }
      }
    }

    if (
      simCloudShare.copy_address &&
      Array.isArray(simCloudShare.copy_address)
    ) {
      for (const eachCCemail of simCloudShare.copy_address) {
        if (!this.EMAIL_REGEX.test(eachCCemail)) {
          throw new AiraloException(
            `The copy_address: ${eachCCemail} must be valid email address, payload: ${JSON.stringify(simCloudShare)}`,
          );
        }
      }
    }

    return true;
  }

  /**
   * Checks if all required fields are present
   * @param {Object} simCloudShare - The cloud sim share payload
   * @param {Array} requiredFields - Array of required field names
   * @returns {boolean} - Returns true if all required fields are present
   * @throws {AiraloException} - Throws exception if required field is missing
   */
  static checkRequiredFields(simCloudShare, requiredFields) {
    for (const field of requiredFields) {
      if (!simCloudShare[field]) {
        throw new AiraloException(
          `The ${field} is required, payload: ${JSON.stringify(simCloudShare)}`,
        );
      }
    }

    return true;
  }
}

module.exports = CloudSimShareValidator;
