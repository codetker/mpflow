#!/usr/bin/env node

const { spawnSync } = require('child_process')
const fs = require('fs')
const { join, resolve, relative } = require('path')
const glob = require('glob')
const crypto = require('crypto')

const resolveFromRoot = (...paths) => {
  return resolve(__dirname, '..', ...paths)
}

const cwd = process.cwd()

const files = glob.sync('src/**/*.ts', { ignore: ['**/*.test.ts', '**/*.spec.ts'], cwd, absolute: true })

// Load existing config
const tsconfigPath = resolveFromRoot('tsconfig.base.json')

// Write a temp config file
const tmpTsconfig = {
  extends: relative(cwd, tsconfigPath),
  files,
}
const tmpTsconfigContent = JSON.stringify(tmpTsconfig, null, 2)
const tmpTsconfigPath = join(cwd, `tsconfig.json`)

const argsToForward = ['--outDir', './lib', '-p', tmpTsconfigPath, '--declaration', '--emitDeclarationOnly']

fs.writeFileSync(tmpTsconfigPath, tmpTsconfigContent)

// Type-check our files
const { status } = spawnSync(`tsc${process.platform === 'win32' ? '.cmd' : ''}`, argsToForward, {
  stdio: 'inherit',
  cwd,
})

// Delete temp config file
fs.unlinkSync(tmpTsconfigPath)

process.exit(status)