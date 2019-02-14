# Soundwise

Mobile-focused audio publishing platform for coaches, consultants, and entrepreneurial experts to sell and deliver on-demand audio programs, and leverage their podcast to build their email list and an engaged audience.

## Synchronizing files with soundwise-worker1 repository

Files expected to be updated after changes in _soundwise-worker1_ repository:
```
database/index.js
server/scripts/parseFeed.js
server/scripts/utils.js
```

## Development

### Installing Dependencies

From within the root directory:

```sh
npm install
```

### Configure Postgres database (locally)
1. install postgres
     ```brew install postgresql```
2. initialize postgres and restart everytime computer starts
     ```pg_ctl -D /usr/local/var/postgres start && brew services start postgresql```
3. (for restart postgres server:)
     ```postgres -D /usr/local/var/postgres```
4. create a user called root
     ```createuser --pwprompt root```
   (when prompted for password, just hit n, and then enter)
5. create a database called soundwise
     ```createdb -Oroot -Eutf8 soundwise```
OR
```
sudo apt-add-repository ppa:pitti/postgresql
sudo apt-get update
sudo apt-get install postgresql-9.2
sudo -u postgres psql
    CREATE DATABASE soundwise;
    CREATE USER root WITH password '111';
    GRANT ALL ON DATABASE soundwise TO root;
```
ctrl+d OR \q+enter

To connect to database:
    ```psql soundwise```
See all tables:
    `\dt`
Drop the table called 'Soundcasts':
    `drop table "Soundcasts";`
See table content of table 'Users':
    `select * from "Users";`

### setup strongloop api
```
node server/bin/create-lb-tables.js
node server/bin/automigrate.js
```
### setup test publisher and transactions:
```
node server/bin/create-test-data.js
```

### SSL certificate renewal
- every three months, need to renew certificate (cron job set up for auto-renewal, but need to check regularly, just to make sure)
```
sudo certbot --nginx -d mysoundwise.com -d www.mysoundwise.com
```
For reference, see https://www.digitalocean.com/community/tutorials/how-to-secure-nginx-with-let-s-encrypt-on-ubuntu-14-04

#### Issues

##### - wrong buffer length:
node_modules/microm/dist/microm.js:3125
change
self.buffer = new ArrayBuffer(view);
to
self.buffer = new ArrayBuffer(view.buffer.byteLength);

##### - Error: Cannot resolve module 'fs' in /home/developer/www/SoundwiseCMS_web/node_modules/request/lib:
open node_modules/request/lib/har.js
and remove
var fs = require('fs')
because fs is the default nodejs package

### Start the Server

```
npm run-script start:server
```

### Start the webpack bundle compiler

```
npm run-script start
```

### Start the server.js and webpack bundle compiler in development mode (stripe testing)

Load development environment variables with:
```
set -o allexport
source api.env
source db.env
source client-development.env
set +o allexport
```

To run server:
```
node --inspect server/server.js
```
To run client (in second terminal, with same environment imports):
```
npm run-script start
```

### Start loopback api

```
node .
```

### Directories
- Front end code is under `/client`
- Audio player controls are in `/client/components/course_section.js` and `/client/containers/player_bar.js`

### URL format
- Course landing page: `localhost:8080/courses/120`
- Course page: `localhost:8080/myprograms/120`

### Coding style

Install https://github.com/prettier/prettier

Check _package.json > "prettier"_ configuration


## api
```
sudo npm i -g strongloop
cd api/
npm i
node .
```

## recreate db
```
sudo -u postgres psql
    drop database "soundwise";
    CREATE DATABASE soundwise;
    GRANT ALL ON DATABASE soundwise TO root;
node database/index.js
node server/bin/create-lb-tables.js
node .
```

# Server update:

Load production environment variables (both on the server and before bundle compiling) with:
```
set -o allexport
source api.env
source db.env
source client-production.env
set +o allexport
```

Run webpack bundle compiler:

>npm run-script build

*In case if you have **Allocation failed - JavaScript heap out of memory** error - you can try:

>node --max_old_space_size=4096 node_modules/.bin/webpack 

*you can check git configuration with *"git remote -v"* command,

to add live remote run:

>git remote add live ssh://USER@IP/PATH/TO/GIT/REPO.git

additional info: https://digitalocean.com/community/tutorials/how-to-set-up-automatic-deployment-with-git-with-a-vps

Push to deployed server
>git push live --force

copy uglified **bundle.js/bundle.js.map** files to the server:
>scp /path/to/repo/client/bundle.js* USER@IP:/PATH/TO/RUN/REPO

for example, if under root folder:
> scp ./client/bundle.js* root@162.243.196.88:/var/www/mysoundwise.com/client/

under root(!) on remote server run:
>pm2 restart server

*Note - to update environment, run: *pm2 restart server --update-env*  
*Note2 - to start fresh server instance, run: *pm2 start server/server.js --name server --log-date-format 'DD-MM HH:mm:ss.SSS'*


# Issues:

#### - express-fileuploader module changes files names when upload to aws s3:
./node_modules/express-fileuploader/lib/index.js:91-93
```
var uid = uuid.v1(),
    ext = path.extname(file.name);
file.name = uid + ext;
```
comment these 3 strings

#### - webpack watch not recompiling files on changes
solution https://webpack.js.org/configuration/watch/#not-enough-watchers

#### - progress-label.js:13 Uncaught TypeError: Cannot read property 'number' of undefined
fix: edit *node_modules/react-progress-label/dist/progress-label.js*
and add after   *var React = require('react');*   :
```
React.PropTypes = require('prop-types');
React.createClass = require('create-react-class');
```


## Archiving in xcode shows 'duplicate symbol error' because of conflicts in cocoapod

Follow instructions in this:
https://github.com/facebook/react-native/issues/12814

1. Open your [yourproject].xcworkspace
2. Select your Pods project
3. In TARGETS delete React.
4. Clean (Product > Clean) & archive/build/whatever.

## Database backup

Run command `crontab -e`
```
00 00 * * * /usr/bin/pg_dump soundwise > /root/database_backups/soundwise_`date +\%Y_\%m_\%d`.sql && tar -cjf /root/database_backups/soundwise_`date +\%Y_\%m_\%d`.sql.tar.bz2 /root/database_backups/soundwise_`date +\%Y_\%m_\%d`.sql && rm /root/database_backups/soundwise_`date +\%Y_\%m_\%d`.sql
00 00 * * * /usr/bin/find /root/database_backups/ -mtime +30 -exec rm {} \;
```

# Client notes

color codes:

>light blue: #61E1FB  
>orange: #F76B1C  
