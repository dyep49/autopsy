#!/usr/bin/env node
var path = require('path')
var fs = require('fs')
var vbm = require('../lib/vbm')
var download = require('./download')

module.exports = function setupCmd() {
  vbm = vbm()
  console.time('SETUP TIME')
  console.log('SETUP: Setting up smartos vm')

  vbm.machine.list(function (err, list) {
    if (err) return console.error(err)
    var exists = Object.keys(list).some(function (name) {
      return name === 'smartos'
    })

    if (exists) {
      console.warn('SETUP: there is already a smartos vm')
      console.warn('SETUP: exiting gracefully')
      console.warn('')
      return
    }

    download(function (err) {
      if (err) return console.error(err)
      setup(function (err) {
        if (err) return console.error(err)
        console.log('SETUP: smart os vm has been set up')
        console.timeEnd('SETUP TIME')
      })
    })
  })

  function setup (cb) {
    vbm.machine.import(path.join(__dirname, '../assets/smartos.ovf'), 'smartos', function (err) {
      if (err) return cb(err)
      var args = [
        'smartos',
        '--storagectl', 'IDE Controller',
        '--port', '0',
        '--device', '0',
        '--type', 'dvddrive',
        '--medium', path.join(__dirname, '../assets/smartos.iso')
      ]

      vbm.command.exec('storageattach', args, function (err, code, output) {
        if (err) return cb(err)
        cb()
      })
    })
  }

}

if (!module.parent) { module.exports(process.argv.slice(2)) }
