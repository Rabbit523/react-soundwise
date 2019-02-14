FROM selenium/standalone-chrome-debug:3.141.5-astatine

USER root
RUN curl -sL https://deb.nodesource.com/setup_10.x | sudo -E bash -
RUN apt update
RUN apt install -y nodejs

#USER seluser
RUN mkdir -p /home/seluser/tests-selenium
COPY . /home/seluser/tests-selenium
WORKDIR /home/seluser/tests-selenium
RUN npm i
