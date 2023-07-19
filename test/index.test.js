
const { EmbedBuilder, ButtonBuilder, ActionRowBuilder } = require("discord.js");

const VerificationClass = require("../index");
const Verification = new VerificationClass();
const mockEmbed1 = {
  fields: [
    {
      name: "Enter these numbers",
      value: `\`\`\`js\n1234\n\`\`\``,
    },
    {
      name: "Input",
      value: `\`\`\`js\n123\n\`\`\``,
    },
  ],
};
const mockEmbedBuilder1 = new EmbedBuilder().addFields([
  {
    name: "Enter these numbers",
    value: `\`\`\`js\n1234\n\`\`\``,
  },
  {
    name: "Input",
    value: `\`\`\`js\n123\n\`\`\``,
  },
])

describe("Verification Start module", () => {
  test("Should return an object containing arrays", () => {
    const val = Verification.verificationStart();
    expect(val).toEqual(expect.objectContaining({
      embeds: expect.arrayContaining([
        expect.any(EmbedBuilder),
      ]),
      components: expect.arrayContaining([
        expect.any(ActionRowBuilder),
      ]),
    }));
  });

  test("Returned object must contain an array of 1 embed builder", async () => {
    const val = Verification.verificationStart();
    const pin = Verification.pin;
    expect(val.embeds).toHaveLength(1);
    expect(val.embeds[0].data.fields[0].value).toEqual(`\`\`\`js\n${pin}\n\`\`\``);
  });

  test("Returned object must contain 3 action row builders, containing 12 button builders in total", () => {
    const val = Verification.verificationStart();
    const components = val.components;
    const buttons = components.reduce((acc, row) => acc.concat(row.components), []);
    expect(components).toHaveLength(3);
    expect(buttons).toHaveLength(12);
    for (let i = 0; i < buttons.length; i++) {
      expect(buttons[i]).toBeInstanceOf(ButtonBuilder);
    }
  });
});

describe("Verification Add Number module", () => {
  test("Should throw an error if the incorrect number of arguments are provided", () => {
    expect(() => {
      Verification.verificationAddNumber();
    }).toThrow("Incorrect number of arguments. Expected 2, received 0.");

    expect(() => {
      Verification.verificationAddNumber({ embed: 1, number: 2, test: 3 });
    }).toThrow("Incorrect number of arguments. Expected 2, received 3.");
  });

  test("Should throw an error if the incorrect argument types are provided", () => {
    expect(() => {
      Verification.verificationAddNumber({ number: "1", embed: mockEmbed1 });
    }).toThrow(`The "number" option must be of type number. Received: string`);
  });

  test("Should return an embed builder", () => {
    const val = Verification.verificationAddNumber({
      number: 4,
      embed: mockEmbed1,
    });
    expect(val).toBeInstanceOf(EmbedBuilder);
  });

  test("The returned embed should have the correct updated value", () => {
    const val = Verification.verificationAddNumber({
      number: 4,
      embed: mockEmbed1,
    });
    expect(val.data.fields[1].value).toEqual("```js\n1234\n```");
  });

  test("Should correctly convert Embedbuilder to Embed and still work", () => {
    const val = Verification.verificationAddNumber({
      number: 4,
      embed: mockEmbedBuilder1,
    });
    expect(val).toBeInstanceOf(EmbedBuilder);
  });
});

describe("Verification Retry module", () => {
  test("Should return an embed builder", () => {
    const val = Verification.verificationRetry();
    expect(val).toBeInstanceOf(EmbedBuilder);
  });

  test("The pin must be a newly generated one", () => {
    const pin1 = Verification.pin;
    const val = Verification.verificationRetry();
    const pin2 = Verification.pin;
    expect(pin1).not.toEqual(pin2);
  });
});

describe("Verification Check module", () => {
  test("Result should return false and the verified property should be set to false", () => {
    const val = Verification.verificationCheck(mockEmbed1);
    expect(val).toBeFalsy();
    expect(Verification.verified).toBeFalsy();
  });

  test("Result should return true and the verified property should be set to true", () => {
    const verification = new VerificationClass({ pin: "1234" }); // Use a known pin for testing
    const embed = {
      fields: [
        { name: "Enter these numbers", value: "1234" },
        { name: "Input", value: "```js\n1234\n```" },
      ],
    };

    const val = verification.verificationCheck(embed);

    expect(val).toBeTruthy();
    expect(verification.verified).toBeTruthy();
  });

  test("Should correctly convert EmbedBuilder to Embed and still work", () => {
    const val = Verification.verificationCheck(mockEmbedBuilder1);
    expect(val).toBeFalsy();
    expect(Verification.verified).toBeFalsy();
  });

  test("Should throw an error if an invalid pin is provided (not a number)", () => {
    expect(() => {
      Verification.verificationNewPin("abcd");
    }).toThrow(`Invalid characters in the pin. Only numeric characters are allowed.`);
  });

  test("Should throw an error if the pin length is not exactly 4 digits long (string)", () => {
    expect(() => {
      Verification.verificationNewPin("123");
    }).toThrow(`Invalid pin length. The pin must be exactly 4 digits long.`);
  });

  test("Should throw an error if the pin length is not exactly 4 digits long (number)", () => {
    expect(() => {
      Verification.verificationNewPin(123);
    }).toThrow(`Invalid pin length. The pin must be exactly 4 digits long.`);
  });

  test("Should throw an error if an invalid pin is provided (object)", () => {
    expect(() => {
      Verification.verificationNewPin({ test: ["1"] });
    }).toThrow(
      `The "Pin" option must be of type number | string | undefined. Received: object`
    );
  });

  test("Should throw an error if the input contains non-numeric characters", () => {
    const verification = new VerificationClass({ pin: "1234" }); // Use a known pin for testing
    const embed = {
      fields: [
        { name: "Enter these numbers", value: "1234" },
        { name: "Input", value: "```js\n12a4\n```" }, // Non-numeric characters
      ],
    };

    expect(() => {
      verification.verificationCheck(embed);
    }).toThrow("Invalid characters in the pin. Only numeric characters are allowed.");
  });
});

describe("Verification New Pin module", () => {
  test("Should throw an error if anything is provided that isn't a number or undefined", () => {
    expect(() => {
      Verification.verificationNewPin("abcd");
    }).toThrow(`Invalid characters in the pin. Only numeric characters are allowed.`);

    expect(() => {
      Verification.verificationNewPin({ test: ["1"] });
    }).toThrow(`The "Pin" option must be of type number | string | undefined. Received: object`);
  });

  test("Should correctly update the pin if a new one is provided", () => {
    const newPin = 1234;
    Verification.verificationNewPin(newPin);
    expect(Verification.pin).toEqual(newPin);
  });

  test("Should generate a new pin if none is provided and update it correctly", () => {
    const oldPin = Verification.pin;
    Verification.verificationNewPin();
    expect(Verification.pin).not.toEqual(oldPin);
    expect(Verification.pin.toString()).toHaveLength(4); // Check that the generated pin has the correct length
  });

  test("Should throw an error if the pin is a number but not 4 digits long", () => {
    expect(() => {
      Verification.verificationNewPin(12);
    }).toThrow(`Invalid pin length. The pin must be exactly 4 digits long.`);
  });

  test("Should throw an error if the pin is a string but not 4 digits long", () => {
    expect(() => {
      Verification.verificationNewPin("12345");
    }).toThrow(`Invalid pin length. The pin must be exactly 4 digits long.`);
  });
});

describe("Verify Embed module", () => {
  test("Embed should be of type object", () => {
    expect(() => {
      Verification.verificationAddNumber({ number: 1, embed: "1" });
    }).toThrow(`The "embed" option must be of type object. Received: string`);
  });

  test("Embed should contain a fields property", () => {
    expect(() => {
      Verification.verificationAddNumber({ number: 1, embed: {} });
    }).toThrow("Embed must contain a fields property.");
  });

  test("Fields should be of type array", () => {
    expect(() => {
      Verification.verificationAddNumber({ number: 1, embed: { fields: {} } });
    }).toThrow(`The "embed.fields" option must be of type Array. Received: object`);
  });

  test("Fields Array should be of length 2", () => {
    expect(() => {
      Verification.verificationAddNumber({
        number: 1,
        embed: { fields: [{}] },
      });
    }).toThrow(`The embed.fields array must be of length 2.`);
  });

  test("Field entries should be of type object", () => {
    expect(() => {
      Verification.verificationAddNumber({
        number: 1,
        embed: { fields: ["Test", "Test2"] },
      });
    }).toThrow(`The "embed.fields[0]" option must be of type object. Received: string`);
  });

  test("Field entries must contain a name and value which should both be of type string", () => {
    expect(() => {
      Verification.verificationAddNumber({
        number: 1,
        embed: {
          fields: [
            { name: "true", value: 1111 },
            { name: "Hey", value: "1234" },
          ],
        },
      });
    }).toThrow(`The "embed.fields[0].value" option must be of type string. Received: number`);

    expect(() => {
      Verification.verificationAddNumber({
        number: 1,
        embed: { fields: [{ name: "true", value: "1111" }, {}] },
      });
    }).toThrow(`The "embed.fields[1].name" option must be of type string. Received: undefined`);
  });
});

describe("Class properties", () => {
  test("Should not be able to modify the \"verified\" property", () => {
    Verification.verified = true;
    expect(Verification.verified).toBeFalsy();
  });

  test("Should be able to modify the \"pin\" property", () => {
    Verification.verified = true;
    expect(Verification.verified).toBeFalsy();
  });
})