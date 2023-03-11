
# Discord Verification

This package will help you create a simple verification system
## Usage & Examples
Here are some examples of the different functions.

The following functions are available:

1. Requiring the package
2. Starting the Verification process
3. The user entered a number
3. The user wants to retry
3. Verify the pin the user entered


### Requiring the package
```js
const Verification = require('discord-verification');

const verification = new Verification();
```

### Starting the verification process
The interaction provided **must** be a [Discord.JS ButtonInteraction!](https://discord.js.org/#/docs/main/stable/class/ButtonInteraction)

The interaction provided **must** be a [Discord.JS User!](https://discord.js.org/#/docs/main/stable/class/User)
```js
// Only needed if you want every user to have a different pin
// If you leave the function blank, a random pin will be made
await verification.verificationNewPin(NEW_PIN); 
await verification.verificationStart({ interaction, user })

```

### The user entered a number
The interaction provided **must** be a [Discord.JS ButtonInteraction!](https://discord.js.org/#/docs/main/stable/class/ButtonInteraction)
```js
await verification.verificationAddNumber({ interaction, number: THE_NUMBER_THE_USER_ENTERED})
```

### The user wants to retry
The interaction provided **must** be a [Discord.JS ButtonInteraction!](https://discord.js.org/#/docs/main/stable/class/ButtonInteraction)

The interaction provided **must** be a [Discord.JS User!](https://discord.js.org/#/docs/main/stable/class/User)
```js
await verification.verificationRetry({ interaction, user })
```

### Verify the pin the user entered
The interaction provided **must** be a [Discord.JS ButtonInteraction!](https://discord.js.org/#/docs/main/stable/class/ButtonInteraction)

The role provided **must** be a [Discord.JS Role!](https://discord.js.org/#/docs/main/stable/class/Role)
```js
await verification.verificationCheck({ interaction, role })
```