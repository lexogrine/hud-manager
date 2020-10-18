"use strict";
exports.__esModule = true;
var _1 = require(".");
function overlay(hud) {
    return "<!DOCTYPE html>\n<html>\n    <head>\n        <style>\n            html, body, #hud-container {\n                margin: 0;\n                width:100%;\n                height:100%;\n                border: 0;\n            }\n            #hud-container {\n                position: absolute;\n                z-index:1;\n            }\n            #watermark {\n                position: fixed;\n                bottom: 20px;\n                right: 10px;\n                font-family: Arial;\n                font-weight: 600;\n                color: rgba(255,255,255,0.5);\n                font-size: 14pt;\n                z-index:2;\n            }\n        </style>\n    </head>\n    <body>\n        <iframe id=\"hud-container\" src=\"" + hud.substr(hud.indexOf('/hud')) + "\"></iframe>\n        " + (!_1.customer.customer || _1.customer.customer.license.type === 'free'
        ? '<div id="watermark">Powered by Lexogrine HUD Manager</div>'
        : '') + "\n    </body>\n</html>";
}
exports["default"] = overlay;
