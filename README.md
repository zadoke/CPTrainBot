# CPTrainBot

CPTrainBot is a Discord bot that retrieves train schedules and information from Infrastruturas de Portugal and displays them on Discord.
The backend for this bot is located in another repository, which you can access [here](https://github.com/zadoke/CPTrainBot-backend).

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [License](#license)
- [Note](#note)

## Installation
To use CPTrainBot, please follow these steps:

1. Clone both the CPTrainBot repository and the [backend repository](https://github.com/zadoke/CPTrainBot-backend) to your local machine.
2. In the CPTrainBot repository, rename the `config_example.json` file to `config.json`.
3. Open the `config.json` file and enter your Discord bot token and Client ID in the appropriate fields.
4. Open the `.env` file and enter your backend URL in the `BACKEND_URL` field.
5. Install the required packages by running the command `npm install`.
6. Deploy the slash commands by running the command `node deploy-commands.js`.
7. Follow the [installation instructions](https://github.com/zadoke/CPTrainBot-backend#installation) to build and run the backend.

## Usage

To start using CPTrainBot, first ensure that the backend is running. Then, navigate to the CPTrainBot repository on your local machine and run the command `node .` to start the bot.

CPTrainBot uses Slash Commands. Here's a list of available commands:

- `/imagem` - displays an image of a train.
- `/horarios` - displays the train schedule for a given station. Requires the station name and the time period in hours. Please note that due to a current limitation, you need to select the station from the presented list.
- `/alerta` - sends a private message to the user alerting when their train is about to arrive at their station. This command can also notify the user of any changes in the train’s status. Requires name of the station and the ID of the desired train.
- `/comboio` - displays the current location of a train. Requires the train number.

## License

CPTrainBot is released under the GNU GPLv3 license. Please refer to the `LICENSE` file for more information.

## Note

CPTrainBot is a work in progress. Future updates and improvements are in the works.
