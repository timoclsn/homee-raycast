/// <reference types="@raycast/api">

/* 🚧 🚧 🚧
 * This file is auto-generated from the extension's manifest.
 * Do not modify manually. Instead, update the `package.json` file.
 * 🚧 🚧 🚧 */

/* eslint-disable @typescript-eslint/ban-types */

type ExtensionPreferences = {
  /** homeeID - Your homee ID */
  "homeeId": string,
  /** Access Token - Your homee Access Token */
  "accessToken": string
}

/** Preferences accessible in all the extension's commands */
declare type Preferences = ExtensionPreferences

declare namespace Preferences {
  /** Preferences accessible in the `groups` command */
  export type Groups = ExtensionPreferences & {}
  /** Preferences accessible in the `devices` command */
  export type Devices = ExtensionPreferences & {}
  /** Preferences accessible in the `homeegrams` command */
  export type Homeegrams = ExtensionPreferences & {}
}

declare namespace Arguments {
  /** Arguments passed to the `groups` command */
  export type Groups = {}
  /** Arguments passed to the `devices` command */
  export type Devices = {}
  /** Arguments passed to the `homeegrams` command */
  export type Homeegrams = {}
}

