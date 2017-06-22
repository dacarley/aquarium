Aquarium automation

Configuring the Raspberry Pi
This system has only been used/tested on a Raspberry Pi 3.

Install the latest version of node.
    See https://nodejs.org/en/download/package-manager/#debian-and-ubuntu-based-linux-distributions
`sudo npm install -g n pm2 webpack yarn`
`sudo n latest`

Ensure that i2c access is enabled.   Use raspi-config to configure.
Install pigpio.  See https://www.npmjs.com/package/pigpio for more information.
Install redis.
    `apt-get install redis-server`

Configure redis for persistence.
Edit /etc/redis/redis.conf with sudo
    Set `appendonly yes`
    Set `save 60 1` for writing to disk
