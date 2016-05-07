# Big data project

Project for the "NoSQL and Big data" lecture at the HAW.

## Setup and start

The setup is encapsulated in docker contains. To orchestrate the components docker-compose
is required.

Non-public information such as API client ids must be configured in an `.env` file. To start
copy the `.env.example` file as `.env` and fill all lines with your personal credentials.

To start the whole thing just `docker-compose up`. On the first run docker will download a
lot of base images and stuff so grab a drink of your choice and sit back.
