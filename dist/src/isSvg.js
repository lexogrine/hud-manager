"use strict";
exports.__esModule = true;
var regex = /^\s*(?:<\?xml[^>]*>\s*)?(?:<!doctype svg[^>]*\s*(?:\[?(?:\s*<![^>]*>\s*)*\]?)*[^>]*>\s*)?(?:<svg[^>]*>[^]*<\/svg>|<svg[^/>]*\/\s*>)\s*$/i;
exports["default"] = (function (img) {
    return regex.test(img
        .toString()
        .replace(/\s*<!Entity\s+\S*\s*(?:"|')[^"]+(?:"|')\s*>/gim, '')
        .replace(/<!--([\s\S]*?)-->/g, ''));
});
