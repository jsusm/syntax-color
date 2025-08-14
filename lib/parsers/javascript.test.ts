import { expect, it, describe } from 'vitest'
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { highlight } from '../main'
import { javascriptSM } from './javascript.ts'

const testFilesDir = join(process.cwd(), '/lib/tests/javascript/')

describe('should match input files and expect files', async () => {

  const files = await readdir(testFilesDir, {})
  const expectFilesPattern = /\.expect\./
  const expectFiles = files.filter(file => expectFilesPattern.test(file as string))
  const inputFiles = files.filter(file => !expectFilesPattern.test(file as string))

  for (const inputFile of inputFiles) {
    const buf = await readFile(join(testFilesDir, inputFile as string), {})
    const content = new TextDecoder().decode(buf)

    const filePrefix = (inputFile as string).slice(0, -4)
    const expectFile = expectFiles.find(f => (f as string).startsWith(filePrefix)) as string
    const expectBuf = await readFile(join(testFilesDir, expectFile), {})
    const expectContent = new TextDecoder().decode(expectBuf)

    it(`Should match ${inputFile} and ${expectFile} contents`, () => {
      expect(highlight(content, javascriptSM, 'initial')).toBe(expectContent)
    })
  }
})
