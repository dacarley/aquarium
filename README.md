# Aquarium automation
This system has only been used/tested on a Raspberry Pi 3.

## Configuring the system

#### Install some basic utilities
    sudo apt-get update
    sudo apt-get install vim git

#### Install the latest version of node.
The system is known to work with Node 18
https://nodejs.org/en/download/package-manager/#debian-and-ubuntu-based-linux-distributions

#### Install system dependencies
    sudo npm install -g pm2

#### Ensure that i2c access is enabled.
Use raspi-config to configure.

## Starting the system
Build the latest source

    npm run build

If debugging, run the system manually

    sudo node build/aquarium.js

#### Configuring the system for auto-start
Ensure that PM2 is installed.

Configure PM2 auto-start

    sudo pm2 startup

Add the aquarium to PM2's process list

    sudo pm2 start build/aquarium.js

#### Restarting the system
If the system is running via PM2, you can check the state with `sudo pm2 list` or `sudo pm2 monit`

To restart (particularly, after making source changes), use `sudo pm2 restart aquarium`
