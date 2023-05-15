# CPTrainBot

CPTrainBot is a Discord bot that retrieves train schedules and information from Infrastruturas de Portugal and displays them on Discord.
## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [License](#license)
- [Note](#note)

## Installation

To use CPTrainBot, you need to follow these steps:

1. Clone the repository.
2. Rename the `config_example.json` file to `config.json`.
3. Fill in the following fields in the `config.json` file with your Discord bot token and the Client ID.
4. Install the required packages with the following command: `npm install`.
5. Run the following command to deploy the slash commands: `node deploy-commands.js`

## Usage

To start CPTrainBot, run the following command: `node .`.

CPTrainBot uses Discord Slash Commands. Here's a list of available commands:

- `/localizacaocomboio` - displays the current location of a train. Requires the train number.
- `/horarios` - displays the train schedule for a given station. Requires the station name and the time period in hours. Please note that due to a current limitation, you need to select the station from the presented list.
- `/alerta` - sends a private message to the user alerting when their train is about to arrive at their station. This command can also notify the user of any changes in the train’s status. Requires name of the station and the ID of the desired train.
- `/comboio` - displays an image of a train.

## License

CPTrainBot is released under the GNU GPLv3 license. Please refer to the `LICENSE` file for more information.

## Note

CPTrainBot is a work in progress. Future updates and improvements are in the works.
