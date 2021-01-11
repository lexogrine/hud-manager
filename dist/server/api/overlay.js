"use strict";
exports.__esModule = true;
var _1 = require(".");
function overlay(hud) {
    return "<!DOCTYPE html>\n<html>\n    <head>\n        <style>\n            html, body, #hud-container {\n                margin: 0;\n                width:100%;\n                height:100%;\n                border: 0;\n            }\n            #hud-container {\n                position: absolute;\n                z-index:1;\n            }\n            #watermark {\n                position: fixed;\n                bottom: 20px;\n                right: 10px;\n                font-family: Arial;\n                font-weight: 600;\n                color: rgba(255,255,255,0.5);\n                font-size: 14pt;\n                z-index:2;\n            }\n        </style>\n    </head>\n    <body>\n        <iframe id=\"hud-container\" src=\"" + hud.substr(hud.indexOf('/hud')) + "\"></iframe>\n        " + (!_1.customer.customer || _1.customer.customer.license.type === 'free'
        ? "<div style=\"\n                    position: fixed !important;\n                    bottom: 20px !important;\n                    top: unset !important;\n                    left: unset !important;\n                    right: 10px !important;\n                    font-family: Arial !important;\n                    font-weight: 600 !important;\n                    color: rgba(255,255,255,0.5) !important;\n                    font-size: 14pt !important;\n                    z-index:2 !important;\n                    display: block !important;\n                    opacity: 1 !important;\n                    transform: none !important;\n                \">Powered by Lexogrine HUD Manager</div>"
        : '') + "\n    </body>\n</html>";
}
exports["default"] = overlay;
