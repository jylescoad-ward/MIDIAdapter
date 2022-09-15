# MIDIAdapter
Use your MIDI Devices as a Macropad to control OBS Studio (and may other things!)

## Tested Devices
- Novation
  - Launchpad MK2

`MIDIAdapter` can work with any MIDI Compliant device that is detected by your computer. The tested devices section is mainly for people who would like to purchase a known-working device for use with `MIDIAdapter`.

## Building
Requirements
- Node.js (v16.x)
- npm (v8.x and later)
- x86/x86_64 Processor
- [node-gyp](https://github.com/nodejs/node-gyp#readme) installed

```bash
$ npm install
$ npm run postinstall
$ npm run build

# Windows
# Portable:  build/win-unpacked/
# Installer: build/MIDI Adapter x.x.x.msi

# Linux
# Portable:  build/linux-unpacked/
# AppImage:  build/MIDI Adapter.AppImage
```

