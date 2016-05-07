#!/bin/sh
exec /sbin/setuser appu node /app/index.js >>/var/log/app.log 2>&1
