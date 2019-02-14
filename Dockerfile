FROM keymetrics/pm2:8-alpine

# create app folder and copy source files
#RUN mkdir -p /usr/soundwise
#COPY . /usr/soundwise
RUN mkdir -p /var/www/preprod.soundwise.com
RUN mkdir -p /var/repo/site.git

# update npm
RUN npm i -g npm

# add git
RUN apk update && apk add --no-cache bash git openssh openrc

# set up ssh server (http://wiki.alpinelinux.org/wiki/Setting_up_a_ssh-server)
#RUN touch /run/openrc/softlevel
#RUN /etc/init.d/sshd start

# install node modules
WORKDIR /usr/soundwise
#RUN npm i

# build client bundle
#RUN NODE_ENV=${NODE_ENV} npm run build

# expose port
#EXPOSE 3000
