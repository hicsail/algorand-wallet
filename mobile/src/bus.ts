/* eslint-disable */
const emitter = require('tiny-emitter/instance')

export const bus = {
    $on: (...args: any[]): void => emitter.on(...args),
    $once: (...args: any[]):void => emitter.once(...args),
    $off: (...args: any[]): void => emitter.off(...args),
    $emit: (...args: any[]):void => emitter.emit(...args)
}