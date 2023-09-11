# CPTrainBot

CPTrainBot is a Discord bot that retrieves train schedules and information from Infrastruturas de Portugal and displays them on Discord.
The backend for this bot is located in another repository, which you can access [here](https://github.com/zadoke/CPTrainBot-backend).

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [License](#license)
- [Note](#note)

## Installation
You have multiple options for deploying CPTrainBot:

- **Docker Compose**: Deploy CPTrainBot and its backend using Docker Compose.
- **Normal Installation**: Deploy CPTrainBot using the traditional installation method.
- **Kubernetes**: Deploy CPTrainBot on a Kubernetes cluster (refer to the [Kubernetes Deployment README](deployments/README.md) for detailed instructions).

**Docker Compose**

1. Install Docker and Docker Compose on your system.
2. Clone the CPTrainBot repository or download the Docker Compose file directly.
3. Create a file named `.env` in the same directory as the Docker Compose file and specify your `CLIENT_ID` and `TOKEN` values like this:

```
CLIENT_ID=<insert your client id here>
TOKEN=<insert your token here>
```

Make sure to replace `<insert your client id here>` and `<insert your token here>` with your own values.

4. Run the command `docker-compose up -d` to start the services in detached mode, on the directory containing the Docker Compose file and the .env file.

**Normal Installation**

1. Clone both the CPTrainBot repository and the [backend repository](https://github.com/zadoke/CPTrainBot-backend) to your local machine.
2. In the CPTrainBot repository, create a new file named `.env` and enter your Discord bot token, Client ID, and backend URL in the `TOKEN`, `CLIENT_ID`, and `BACKEND_URL` fields, respectively. Alternatively, you can pass these values as environment variables in the terminal when starting the bot.
3. Install the required packages by running the command `npm install`.
4. Deploy the slash commands by running the command `node deploy-commands.js`.
5. Follow the [installation instructions](https://github.com/zadoke/CPTrainBot-backend#installation) to build and run the backend.
6. After following the above instructions, navigate to the CPTrainBot repository on your local machine and run the command `node .` to start the bot.

## Usage

CPTrainBot uses Slash Commands. Here's a list of available commands:

- `/imagem` - displays an image of a train.
- `/horarios` - displays the train schedule for a given station. Requires the station name and the time period in hours. Please note that due to a current limitation, you need to select the station from the presented list.
- `/alerta` - sends a private message to the user alerting when their train is about to arrive at their station. This command can also notify the user of any changes in the train’s status. Requires name of the station and the ID of the desired train.
- `/comboio` - displays the current location of a train. Requires the train number.

## License

CPTrainBot is released under the GNU GPLv3 license. Please refer to the `LICENSE` file for more information.

## Note

CPTrainBot is a work in progress. Future updates and improvements are in the works.
