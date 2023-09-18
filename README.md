# vuepress-barista

A vuepress 2.x sidebar generator inspired by [vuepress-bar](https://npmjs.com/package/vuepress-bar).

## Usage

*.vuepress/config.ts*
~~~js
import { defaultTheme } from "@vuepress/theme-default";
import getConfig from "vuepress-barista";

/**
 * getConfig(filepath, opts)
 */
const { sidebar } = getConfig("../", {
  stripNumbers: true,
  capitalizeWords: true,
  maxLevel: 2
});

export default {
  title: 'VuePress 2.x Website',
  description: 'Vuepress 2.x site with auto-generated sidebar',
  ,theme: defaultTheme({ sidebar })
}
~~~

## Options

|      Param      |                Type                 | Default |                                                     Description                                                     |
| --------------- | ----------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------- |
| capitalizeWords | `boolean`                           | false   | Capitalize words derived from all-lowercase directory or filenames. When false uses directory or filename spelling. |
| stripNumbers    | `boolean`                           | true    | Remove number prefixes from directory names where it helps sorting.                                                 |
| maxLevel        | `number`                            | 2       | Maximum level of recursion for subdirectory traversing.                                                             |
| filter          | `function(i: SidebarItem): boolean` |         | Filter function to filter files.                                                                                    |