const {
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  EmbedBuilder,
  Embed,
} = require("discord.js");

// Custom Errors
class VerificationError extends Error { }

class IncorrectNumberOfArgumentsError extends VerificationError {
  constructor(expected, received) {
    super(`Incorrect number of arguments. Expected ${expected}, received ${received}.`);
    this.name = 'IncorrectNumberOfArgumentsError';
  }
}

class IncorrectOptionTypeError extends VerificationError {
  constructor(optionName, expected, received) {
    super(`The "${optionName}" option must be of type ${expected}. Received: ${received}`);
    this.name = 'IncorrectOptionTypeError';
  }
}

class InvalidPinError extends VerificationError {
  constructor() {
    super('Invalid characters in the pin. Only numeric characters are allowed.');
    this.name = 'InvalidPinError';
  }
}

class InvalidPinLengthError extends VerificationError {
  constructor() {
    super('Invalid pin length. The pin must be exactly 4 digits long.');
    this.name = 'InvalidPinLengthError';
  }
}

class MissingFieldsError extends VerificationError {
  constructor() {
    super(`Embed must contain a fields property.`);
    this.name = 'MissingFieldsError';
  }
}

class IncorrectFieldsLengthError extends VerificationError {
  constructor(field) {
    super(`The ${field} array must be of length 2.`);
    this.name = 'IncorrectFieldsLengthError';
  }
}

class IncorrectFieldTypeError extends VerificationError {
  constructor(field, expected, received) {
    super(`The "${field}" option must be of type ${expected}. Received: ${received}`);
    this.name = 'IncorrectFieldTypeError';
  }
}

class Verification {
  #pin;
  #verified;

  /**
   * @param {object} options The options object
   * @param {number|undefined} options.pin The pin
   */
  constructor(options = { pin: undefined }) {
    this.#pin = options.pin || this.#generatePin();
    this.#verified = false;
  }

  // Getter for the pin property
  get pin() {
    return this.#pin;
  }

  /**
   * @param {number} newPin
   */
  set #setPin(newPin) {
    this.#verifyPinLength(newPin);
    this.#pin = this.#convertToNum(newPin);
  }

  get verified() {
    return this.#verified;
  }

  /**
   * @description This creates the verification menu.
   *
   * @returns {object} An object containing the buttons and the embed
   */
  verificationStart() {
    const buttonRows = [];
    for (let i = 0; i < 10; i += 5) {
      const row = new ActionRowBuilder();
      for (let j = i; j < i + 5; j++) {
        const btn = new ButtonBuilder()
          .setCustomId(`verify-number-${j}`)
          .setLabel(j.toString())
          .setStyle(ButtonStyle.Primary);
        row.addComponents(btn);
      }
      buttonRows.push(row);
    }

    const btnVerify = new ButtonBuilder()
      .setCustomId("verify-check")
      .setLabel("Verify")
      .setStyle(ButtonStyle.Success);

    const btnRetry = new ButtonBuilder()
      .setCustomId("verify-retry")
      .setLabel("Retry")
      .setStyle(ButtonStyle.Danger);

    const row3 = new ActionRowBuilder().addComponents(btnVerify, btnRetry);

    const components = [...buttonRows, row3];

    const verifyEmbed = new EmbedBuilder().addFields(
      {
        name: "Enter these numbers",
        value: `\`\`\`js\n${this.pin}\n\`\`\``,
      },
      {
        name: "Input",
        value: "```js\n \n```",
      }
    );

    return {
      embeds: [verifyEmbed],
      components,
    };
  }

  /**
   * @param {object} options The options object
   * @param {number} options.number The number the user just entered
   * @param {Embed} options.embed The embed too update
   *
   * @description This will add a number too the pin entered by the user.
   *
   * @returns {EmbedBuilder} The updated embed
   */
  verificationAddNumber(options = {}) {
    const { number } = options;
    let { embed } = options;

    if (embed instanceof EmbedBuilder) embed = this.#convertEmbedBuilder(embed);

    //#region Error Handling
    const lengthOfObj = Object.keys(options).length;
    if (lengthOfObj !== 2) {
      throw new IncorrectNumberOfArgumentsError(2, lengthOfObj);
    }

    const numberType = typeof number;
    if (numberType != "number") {
      throw new IncorrectOptionTypeError("number", "number", typeof number);

    }

    this.#verifyEmbed(embed);
    //#endregion
    const previousInput = embed.fields[1].value.replace(/```|js|\n|\s/g, "");

    const updatedInput = `\`\`\`js\n${previousInput}${number}\n\`\`\``;

    const newEmbed = new EmbedBuilder(embed).setFields(
      {
        name: "Enter these numbers",
        value: this.pin.toString(),
      },
      {
        name: "Input",
        value: updatedInput,
      }
    );

    return newEmbed;
  }

  /**
   * @description This will clear whatever the user has entered so far, generate a new pin and then let the user try again
   *
   * @returns {EmbedBuilder} Returns the new embed builder
   */
  verificationRetry() {
    this.verificationNewPin();

    const verifyEmbed = new EmbedBuilder().addFields(
      {
        name: "Enter these numbers",
        value: `\`\`\`js\n${this.pin.toString()}\n\`\`\``,
      },
      {
        name: "Input",
        value: "```js\n \n```",
      }
    );

    return verifyEmbed;
  }

  /**
   * @param {Embed} embed The embed
   *
   * @description This will check if the code entered by the user is the same as the pin
   *
   * @returns {boolean} Wether or not the user passed verification
   */
  verificationCheck(embed) {
    if (embed instanceof EmbedBuilder) embed = this.#convertEmbedBuilder(embed);
    const originalNumber = this.pin;
    const inputNumberStr = embed.fields[1].value.replace(/```|js|\n|\s/g, ""); // Remove non-numeric characters
    const inputNumber = this.#convertToNum(inputNumberStr);

    const isCorrect = originalNumber == inputNumber;
    this.#verified = isCorrect;
    return this.#verified;
  }

  /**
   * @param {number|string|undefined} newPin The new pin
   *
   * @description This sets a new pin
   */
  verificationNewPin(newPin) {
    const newPinType = typeof newPin;
    if (newPinType === "undefined") {
      this.#setPin = this.#generatePin();
    }
    else if (newPinType === "number") {
      this.#setPin = newPin;
    } else if (newPinType === "string") {

      this.#setPin = newPin
    } else {
      throw new IncorrectOptionTypeError("Pin", "number | string | undefined", newPinType);
    }
  }

  /**
   * @param {Embed} embed The embed to verify
   *
   * @description This will check if the embed provided to a function contains the correct properties
   */
  #verifyEmbed(embed) {
    const embedType = typeof embed;
    if (embedType !== "object") {
      throw new IncorrectOptionTypeError("embed", "object", embedType);
    }

    if (typeof embed.fields === "undefined") {
      throw new MissingFieldsError();
    }

    if (!Array.isArray(embed.fields)) {
      throw new IncorrectOptionTypeError("embed.fields", "Array", typeof embed.fields);
    }

    if (embed.fields.length !== 2) {
      throw new IncorrectFieldsLengthError("embed.fields");
    }

    for (let i = 0; i < embed.fields.length; i++) {
      const element = embed.fields[i];
      const elementType = typeof element;

      if (elementType !== "object") {
        throw new IncorrectFieldTypeError(`embed.fields[${i}]`, "object", elementType);
      }

      const elementNameType = typeof element.name;
      const elementValueType = typeof element.value;

      if (elementNameType !== "string") {
        throw new IncorrectFieldTypeError(
          `embed.fields[${i}].name`,
          "string",
          elementNameType
        );
      }

      if (elementValueType !== "string") {
        throw new IncorrectFieldTypeError(
          `embed.fields[${i}].value`,
          "string",
          elementValueType
        );
      }
    }
  }

  /**
   * @description Takes in a string and attempts to convert it to a number
   * 
   * @param {string} numStr The string to convert to a number
   * 
   * @returns {number} The number
   * 
   * @throws Throws an error if unable to convert string to number
   */
  #convertToNum(numStr) {
    if (/^\d+$/.test(numStr)) {
      numStr = parseInt(numStr); // Convert to a number
      return numStr;
    } else {
      throw new InvalidPinError();
    }
  }

  /**
   * @description Verifies that the pin is the correct length
   * 
   * @param {number} pin The pin
   */
  #verifyPinLength(pin) {
    if (pin.toString().length !== 4) {
      throw new InvalidPinLengthError();
    }
  }

  /**
   * @description Converts an embed builder to an embed
   * 
   * @param {EmbedBuilder} embed The embed builder
   * 
   * @returns {Embed} The embed
   */
  #convertEmbedBuilder(embed) {
    return embed?.data;
  }

  /**
   * @description This will generate a new 4 digit pin
   * @returns {string} A 4 digit number
   */
  #generatePin() {
    return Math.floor(Math.random() * 9000) + 1000; // Generate a 4-digit number
  }
};

module.exports = Verification;