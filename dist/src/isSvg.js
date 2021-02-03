"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const regex = /^\s*(?:<\?xml[^>]*>\s*)?(?:<!doctype svg[^>]*\s*(?:\[?(?:\s*<![^>]*>\s*)*\]?)*[^>]*>\s*)?(?:<svg[^>]*>[^]*<\/svg>|<svg[^/>]*\/\s*>)\s*$/i;
exports.default = (img) => regex.test(img
    .toString()
    .replace(/\s*<!Entity\s+\S*\s*(?:"|')[^"]+(?:"|')\s*>/gim, '')
    .replace(/<!--([\s\S]*?)-->/g, ''));
