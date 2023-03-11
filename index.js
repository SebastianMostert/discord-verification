const { ButtonBuilder, ButtonStyle, ActionRowBuilder, EmbedBuilder, User, BaseInteraction } = require("discord.js");

module.exports = class Verification {
    constructor({ pin } = { pin: undefined }) {
        this.pin = pin
    };

    get _pin() {
        const pin = this.pin;
        if (!pin) this._pin = (Math.floor(Math.random() * 10000) + 10000).toString().substring(1);
        return this.pin;
    }

    set _pin(pin) {
        this.pin = pin;
    }

    /**
      * @param {object} options
      * @param {User} options.user
      * @param {import("discord.js").Interaction} options.interaction
      */
    async verificationStart(options = {}) {
        const { user, interaction } = options;

        if (!interaction.deferred) await interaction.deferReply({ ephemeral: true })

        //#region Buttons 0 - 4
        const btn0 = new ButtonBuilder()
            .setCustomId('verify-number-0')
            .setLabel('0')
            .setStyle(ButtonStyle.Primary)

        const btn1 = new ButtonBuilder()
            .setCustomId('verify-number-1')
            .setLabel('1')
            .setStyle(ButtonStyle.Primary)

        const btn2 = new ButtonBuilder()
            .setCustomId('verify-number-2')
            .setLabel('2')
            .setStyle(ButtonStyle.Primary)

        const btn3 = new ButtonBuilder()
            .setCustomId('verify-number-3')
            .setLabel('3')
            .setStyle(ButtonStyle.Primary)

        const btn4 = new ButtonBuilder()
            .setCustomId('verify-number-4')
            .setLabel('4')
            .setStyle(ButtonStyle.Primary)
        //#endregion

        //#region Buttons 5 - 9
        const btn5 = new ButtonBuilder()
            .setCustomId('verify-number-5')
            .setLabel('5')
            .setStyle(ButtonStyle.Primary)

        const btn6 = new ButtonBuilder()
            .setCustomId('verify-number-6')
            .setLabel('6')
            .setStyle(ButtonStyle.Primary)

        const btn7 = new ButtonBuilder()
            .setCustomId('verify-number-7')
            .setLabel('7')
            .setStyle(ButtonStyle.Primary)

        const btn8 = new ButtonBuilder()
            .setCustomId('verify-number-8')
            .setLabel('8')
            .setStyle(ButtonStyle.Primary)

        const btn9 = new ButtonBuilder()
            .setCustomId('verify-number-9')
            .setLabel('9')
            .setStyle(ButtonStyle.Primary)
        //#endregion

        //#region Other buttons
        const btnVerify = new ButtonBuilder()
            .setCustomId('verify-check')
            .setLabel('Verify')
            .setStyle(ButtonStyle.Success)

        const btnRetry = new ButtonBuilder()
            .setCustomId('verify-retry')
            .setLabel('Retry')
            .setStyle(ButtonStyle.Danger)
        //#endregion

        //#region Rows
        const row1 = new ActionRowBuilder()
            .addComponents(
                btn0,
                btn1,
                btn2,
                btn3,
                btn4,
            )

        const row2 = new ActionRowBuilder()
            .addComponents(
                btn5,
                btn6,
                btn7,
                btn8,
                btn9,
            )

        const row3 = new ActionRowBuilder()
            .addComponents(
                btnVerify,
                btnRetry
            )

        const components = [row1, row2, row3]
        //#endregion

        let pin = this?._pin;
        if (!pin) pin = this?.pin;

        const verifyEmbed = new EmbedBuilder()
            .setAuthor({ name: user.tag, iconURL: user?.avatarURL() || null })
            .addFields(
                [
                    {
                        name: 'Enter these numbers',
                        value: `\`\`\`js\n${pin}\n\`\`\``,
                    },
                    {
                        name: 'Input',
                        value: '```js\n \n```',
                    },
                ]
            )

        interaction.editReply({ embeds: [verifyEmbed], components, ephemeral: true })
    }

    /**
     * @param {object} options
     * @param {number} options.number
     * @param {import("discord.js").ButtonInteraction} options.interaction
     */
    async verificationAddNumber(options = {}) {
        const { number, interaction } = options;

        // Get the old embed and edit it
        const oldEmbedData = interaction.message.embeds[0].data;
        const oldFields = oldEmbedData.fields;

        let previousInput = oldEmbedData.fields[1].value.slice(3);
        previousInput = previousInput.substring(0, previousInput.length - 3);
        previousInput = previousInput.replace(' ', '');
        previousInput = previousInput.replace('js\n', '');
        previousInput = previousInput.replace('\n', '');

        const updatedInput = `\`\`\`js\n${previousInput?.toString()}${number.toString()}\n\`\`\``;

        const embed = new EmbedBuilder(oldEmbedData)
            .setFields(
                [
                    {
                        name: 'Enter these numbers',
                        value: oldFields[0].value,
                    },
                    {
                        name: 'Input',
                        value: updatedInput,
                    },
                ]
            )


        interaction.update({ embeds: [embed] })
    }

    /**
     * @param {object} options
     * @param {import("discord.js").User} options.user
     * @param {import("discord.js").ButtonInteraction} options.interaction
     */
    async verificationRetry(options = {}) {
        const { user, interaction } = options;

        let pin = (Math.floor(Math.random() * 10000) + 10000).toString().substring(1);
        this._pin = pin;

        const verifyEmbed = new EmbedBuilder()
            .setAuthor({ name: user.tag, iconURL: user?.avatarURL() || null })
            .addFields(
                [
                    {
                        name: 'Enter these numbers',
                        value: `\`\`\`js\n${pin}\n\`\`\``,
                    },
                    {
                        name: 'Input',
                        value: '```js\n \n```',
                    },
                ]
            )

        interaction.update({ embeds: [verifyEmbed] })
    }

    /**
     * @param {object} options
     * @param {import("discord.js").ButtonInteraction} options.interaction
     * @param {import("discord.js").Role} options.role
     */
    async verificationCheck(options = {}) {
        const { interaction, role } = options;

        // Get the final number
        const oldEmbedData = interaction.message.embeds[0].data;
        const oldFields = oldEmbedData.fields;

        let originalNumber = this._pin

        let inputNumber = oldFields[1].value.slice(3);
        inputNumber = inputNumber.substring(0, inputNumber.length - 3);
        inputNumber = inputNumber.replace(' ', '');
        inputNumber = inputNumber.replace('js\n', '');
        inputNumber = inputNumber.replace('\n', '');

        if (originalNumber == inputNumber) {
            try {
                interaction.member.roles.add(role);
            }
            catch (err) {
                console.log(err);
                interaction.member.send('Please dm the owner of the server to give the role too you since I do not have the propper permissions.');
            }

            interaction.update({ content: `You have been verified!`, embeds: [], components: [] })
        } else {
            interaction.update({ content: `Incorrect!`, embeds: [], components: [] })
        }
    }

    /**
     * @param {number} newPin
     */
    async verificationNewPin(newPin) {
        let pin = newPin || (Math.floor(Math.random() * 10000) + 10000).toString().substring(1);
        this._pin = pin;
    }
}