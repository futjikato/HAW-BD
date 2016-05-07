FROM phusion/baseimage:0.9.15

# Use baseimage-docker's init system.
CMD ["/sbin/my_init"]

# install dependencies
RUN curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
RUN apt-get install -y nodejs git

# install app
RUN git clone https://github.com/futjikato/HAW-BD-Synaptic.git /app
RUN cd /app && npm install
RUN mkdir /etc/service/app
ADD app.sh /etc/service/app/run

# Clean up APT when done.
RUN apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*
