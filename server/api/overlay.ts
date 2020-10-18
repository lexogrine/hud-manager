import { customer } from '.';

export default function overlay(hud: string) {
	return `<!DOCTYPE html>
<html>
    <head>
        <style>
            html, body, #hud-container {
                margin: 0;
                width:100%;
                height:100%;
                border: 0;
            }
            #hud-container {
                position: absolute;
                z-index:1;
            }
            #watermark {
                position: fixed;
                bottom: 20px;
                right: 10px;
                font-family: Arial;
                font-weight: 600;
                color: rgba(255,255,255,0.5);
                font-size: 14pt;
                z-index:2;
            }
        </style>
    </head>
    <body>
        <iframe id="hud-container" src="${hud.substr(hud.indexOf('/hud'))}"></iframe>
        ${
			!customer.customer || customer.customer.license.type === 'free'
				? '<div id="watermark">Powered by Lexogrine HUD Manager</div>'
				: ''
		}
    </body>
</html>`;
}
