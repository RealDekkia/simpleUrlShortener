# simpleUrlShortener

## This program uses versions of libraries with known security issues. I don't use it anymore so I won't be fixing them.

This is a very simple URL-Shortener in NodeJS. ~~I don't recommend using it.~~

It's not very sercure as is.

This is running on my Apache2 webserver. I use the [ProxyPass directive](https://httpd.apache.org/docs/current/mod/mod_proxy.html#proxypass) to forward requests to it.
The Apache2-configuration looks something like this:
```
<VirtualHost *:443>
        ServerName example.org
        ProxyPass /add http://localhost:8000
        ProxyPass /api http://localhost:8000/api
        ProxyPass / http://localhost:8001/
</VirtualHost>
```
# Dependencies
- NodeJS
- NPM
- Some Node-Modules

# Setup
1. Git clone the Repo to your machine
2. switch to /simpleUrlShortener/server
3. run `npm install`
4. run `node main.js`

# Optional
I use the Node-Module [Forever](https://www.npmjs.com/package/forever) to start the server

There's also a Chronjob that autostarts it after a Hardware-Reboot.

# Future Updates
I'll be adding stuff like:

 - Listing and Searching for already shortened URLs
 - an option to add users
 - a config-option to allow anonymous creation of URLs
 - some kind of admin-dashboard
 - ...
