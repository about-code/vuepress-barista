/**
 * Inspired by https://npmjs.com/package/vuepress-bar
 * but usable with vuepress2 config. Not yet supporting
 * all options of original vuepress-bar.
 *
 * Currently returning a vuepress 'sidebar' only.
 */

import { SidebarConfigArray, SidebarGroup } from "@vuepress/theme-default";
import fs from "node:fs";

type Options = {

  /** See https://npmjs.com/package/vuepress-bar */
  stripNumbers?: boolean,

  /** See https://npmjs.com/package/vuepress-bar */
  maxLevel?: number,

  /** Try capitalize words in all-lowercase directory and filenames. */
  capitalizeWords?: boolean,

  /** See https://npmjs.com/package/vuepress-bar */
  filter?: (item: SidebarGroup | string ) => boolean
}

const isMarkdownFileOrUnknown = /^\.?[a-zA-Z0-9-+_]+(\.md)?$/;
const isMarkdownFile = /\.md$/;
const isMarkdownReadme = /README\.md$/;

function toForwardSlash(path: string) {
  return path.replace(/(\\+|\/\/+)/g, "/");
}

/**
 * Comparator which sorts README.md files to the beginning and any
 * other files by their file name.
 *
 * @param fileA
 * @param fileB
 * @returns
 */
function sortByFileName(fileA: string, fileB: string) {
  if (isMarkdownReadme.test(fileA)) {
    return -1;
  } else if (isMarkdownReadme.test(fileB)) {
    return 1;
  } else {
    return fileA.localeCompare(fileB);
  }
}

let recursion = 0;
function mapToSidebarItem(file: string, path: string, _basePath: string, opts: Options): SidebarGroup | string {
  // Path normalization: replace duplicate and OS-dependent path separators
  const _path = toForwardSlash(`${path}/${file}`);
  const stat  = fs.statSync(_path);

  if (stat.isDirectory()) {
    let children: SidebarConfigArray = [];
    if (recursion < (opts.maxLevel || 2)) {
      // Enter recursion! Get items for subdirectory!
      recursion++;
      children = getSidebar(_path, _basePath, opts);
      recursion--;
    }

    if (children.length > 0) {
      const filenameParts = `${file}`.split("--");
      const filenameText = filenameParts.shift();
      const filenameArgs = filenameParts.shift();
      const text = `${filenameText}`
        .replace(/(\w)[-_](\w)/g, "$1 $2") // Convert single dashes and underscores to whitespaces
        .replace(/(-|_)+/g, "$1") // Convert duplicate dashes and underscores to single dash or underscore
        .replace(/^\/?\d+\s?/, char => opts.stripNumbers ? "" : char) // Strip leading numbers in file names
        .replace(/(^\w{1})|(\s+\w{1})/g, char => opts.capitalizeWords ? char.toUpperCase() : char);

      const args = `${filenameArgs}`.split(",") || [];
      const collapsible = !!args.find(param => param === "nc") ? false : true;

      // Determine item link URL: check whether subdirectory has file entries or README.md
      const files       = children.filter(c => typeof c === "string") as string[];
      const mdReadme    = files.find(file => isMarkdownReadme.test(file));
      const mdFile      = files.find(file => isMarkdownFile.test(file));
      const pathSegment = toForwardSlash(_path.replace(_basePath, "/"));
      const link        = mdReadme || mdFile || pathSegment;
      const item = {
        text,
        link,
        children,
        collapsible
      };
      return item;
    } else {
      // no markdown children in this directory
      return "{EMPTY}";
    }
  } else if (isMarkdownFile.test(file)) {
    // Just return file path. Strip basePath to root path in vuepress' root
    return toForwardSlash(_path.replace(_basePath, "/"));
  } else {
    return "{EMPTY}";
  }
}

/**
 *
 * @param path Path relative to the current working directory of vuepress containing markdown files.
 * @param _basePath Path relative to the current working directory of vuepress which corresponds to the document root path. Recommended to leave empty. Will default to `path`.
 * @returns
 */
function getSidebar(path: string, _basePath = "", opts: Options = {}): SidebarConfigArray {

  if (! path) {
    throw new Error("Missing search path argument (0)");
  }
  if (! _basePath) {
    _basePath = path;
  }

  const files = fs.readdirSync(path);

  /**
   * Filter "" items that may be created
   * when attempting to map directories without .md content
   */
  const filterEmptyDirs = (item: string | SidebarGroup) => item !== "{EMPTY}";
  const filterCustom = opts.filter || filterEmptyDirs

  return files
    .filter((file: string) => isMarkdownFileOrUnknown.test(file))
    .sort(sortByFileName)
    .map((file: string) => mapToSidebarItem(file, path, _basePath, opts))
    .filter(filterEmptyDirs)
    .filter(filterCustom);
}

/**
 * Drop-in replacement for npmjs.com/package/vuepress-bar.
 * Not yet supporting all options.
 */
export default function (path: string, options: Options) {
  recursion = 0;
  return {
    sidebar: getSidebar(path, "", options)
  }
}