/**
 * Inspired by https://npmjs.com/package/vuepress-bar
 * but usable with vuepress2 config. Not yet supporting
 * all options of original vuepress-bar.
 *
 * Currently returning a vuepress 'sidebar' only.
 */
import fs from "node:fs";
const isMarkdownFileOrUnknown = /^\.?[a-zA-Z0-9-+_]+(\.md)?$/;
const isMarkdownFile = /\.md$/;
const isMarkdownReadme = /README\.md$/;
function toForwardSlash(path) {
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
function sortByFileName(fileA, fileB) {
    if (isMarkdownReadme.test(fileA)) {
        return -1;
    }
    else if (isMarkdownReadme.test(fileB)) {
        return 1;
    }
    else {
        return fileA.localeCompare(fileB);
    }
}
let recursion = 0;
function mapToSidebarItem(file, path, _basePath, opts) {
    // Path normalization: replace duplicate and OS-dependent path separators
    const _path = toForwardSlash(`${path}/${file}`);
    const stat = fs.statSync(_path);
    if (stat.isDirectory()) {
        let children;
        if (recursion < (opts.maxLevel || 2)) {
            // Enter recursion! Get items for subdirectory!
            recursion++;
            children = getSidebar(_path, _basePath);
            recursion--;
        }
        else {
            children = [];
        }
        if (children.length > 0) {
            const text = `${file}`
                .replace(/(\w)[-_](\w)/g, "$1 $2") // Convert single dashes and underscores to whitespaces
                .replace(/(-|_)+/g, "$1") // Convert duplicate dashes and underscores to single dash or underscore
                .replace(/^\d+\s?/, char => opts.stripNumbers ? "" : char) // Strip leading numbers in file names
                .replace(/(^\w{1})|(\s+\w{1})/g, char => opts.capitalizeWords ? char.toUpperCase() : char); // Capitalize
            // Determine item link URL: check whether subdirectory has file entries or README.md
            const files = children.filter(c => typeof c === "string");
            const mdReadme = files.find(file => isMarkdownReadme.test(file));
            const mdFile = files.find(file => isMarkdownFile.test(file));
            const pathSegment = toForwardSlash(_path.replace(_basePath, "/"));
            const link = mdReadme || mdFile || pathSegment;
            return { text, link, children, collapsible: true };
        }
        else {
            return ""; // no markdown children in this directory
        }
    }
    else {
        // Since basePath is a filesystem path pointing to vuepress's root
        return toForwardSlash(_path.replace(_basePath, "/"));
    }
}
/**
 *
 * @param path Path relative to the current working directory of vuepress containing markdown files.
 * @param _basePath Path relative to the current working directory of vuepress which corresponds to the document root path. Recommended to leave empty. Will default to `path`.
 * @returns
 */
function getSidebar(path, _basePath = "", opts = {}) {
    if (!path) {
        throw new Error("Missing search path argument (0)");
    }
    if (!_basePath) {
        _basePath = path;
    }
    const files = fs.readdirSync(path);
    const filter = opts.filter || function (item) {
        // filter `null` or `undefined` items that may be created
        // when attempting to map directories without .md content
        return !!item;
    };
    return files
        .filter(file => isMarkdownFileOrUnknown.test(file))
        .sort(sortByFileName)
        .map(file => mapToSidebarItem(file, path, _basePath, opts))
        .filter(filter);
}
/**
 * Drop-in replacement for npmjs.com/package/vuepress-bar.
 * Not yet supporting all options.
 */
export default function (path, options) {
    recursion = 0;
    return {
        sidebar: getSidebar(path, "", options)
    };
}
