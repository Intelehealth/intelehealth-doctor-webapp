# Mysql-5.7.29

#Remove previous versions:

sudo apt-get purge mysql-server mysql-client mysql-common mysql-server-core-* mysql-client-core-*

sudo rm -rf /etc/mysql /var/lib/mysql

sudo apt-get autoremove

sudo apt-get autoclean


# Download

git clone https://github.com/Fahad4654/Mysql-5.7.29.git


# Install (the order of these commands matters!)

sudo apt install libaio1 libmecab2 python3 libjson-perl

sudo dpkg -i mysql-common_5.7.29-1ubuntu18.04_amd64.deb

sudo dpkg -i libmysqlclient20_5.7.29-1ubuntu18.04_amd64.deb

sudo dpkg -i libmysqlclient-dev_5.7.29-1ubuntu18.04_amd64.deb

sudo dpkg -i libmysqld-dev_5.7.29-1ubuntu18.04_amd64.deb

sudo dpkg -i mysql-community-source_5.7.29-1ubuntu18.04_amd64.deb

sudo dpkg -i mysql-community-client_5.7.29-1ubuntu18.04_amd64.deb

sudo dpkg -i mysql-client_5.7.29-1ubuntu18.04_amd64.deb

sudo dpkg -i mysql-community-server_5.7.29-1ubuntu18.04_amd64.deb

sudo dpkg -i mysql-server_5.7.29-1ubuntu18.04_amd64.deb

