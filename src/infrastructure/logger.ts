import { configure, format, transports } from 'winston'

const logTransports = process.env.NODE_ENV === 'production'
  ? [new transports.Console()]
  : [new transports.File({ filename: process.env.API_LOG_FILENAME })]

configure({
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.json()
  ),
  transports: logTransports
})