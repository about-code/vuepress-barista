/**
 * Inspired by https://npmjs.com/package/vuepress-bar
 * but usable with vuepress2 config. Not yet supporting
 * all options of original vuepress-bar.
 *
 * Currently returning a vuepress 'sidebar' only.
 */
import { SidebarConfigArray, SidebarGroup } from "@vuepress/theme-default";
type Options = {
    /** See https://npmjs.com/package/vuepress-bar */
    stripNumbers?: boolean;
    /** See https://npmjs.com/package/vuepress-bar */
    maxLevel?: number;
    /** Try capitalize words in all-lowercase directory and filenames. */
    capitalizeWords?: boolean;
    /** See https://npmjs.com/package/vuepress-bar */
    filter?: (item: SidebarGroup | string) => boolean;
};
/**
 * Drop-in replacement for npmjs.com/package/vuepress-bar.
 * Not yet supporting all options.
 */
export default function (path: string, options: Options): {
    sidebar: SidebarConfigArray;
};
export {};
