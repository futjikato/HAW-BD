#!/bin/sh
if ! id "appu" >/dev/null 2>&1; then
    adduser --disabled-password --gecos "" appu
fi
exec /sbin/setuser appu node /app/index.js
