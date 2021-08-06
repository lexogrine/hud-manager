import { customer } from '.';

export default function overlay(hud: string) {
	return `<!DOCTYPE html>
<html>
    <head>
        <style>
            @font-face {
                font-family: 'Montserrat';
                font-style: normal;
                font-weight: 200;
                src: url('/Montserrat-ExtraLight.ttf') format('truetype');
            }
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
            #banned {
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 40px;
                font-weight: 100;
                background-color: #24272d;
                text-transform: uppercase;
                text-align: center;
                padding: 0 20%;
                width: 60%;
                flex-direction: column;
                font-family: "Montserrat";
                color: white;
            }
            #banned img {
                margin-bottom: 93px;
            }
        </style>
        <script src="/socket.io/socket.io.js"></script>
        <script>
            const loadBannedPage = () => {
                const hud = document.getElementById('hud-container');
                if(hud) hud.remove();
                const innerDiv = document.createElement('div');
                innerDiv.id = 'banned';
                innerDiv.innerHTML = '<img src="/banned.png" />You have been banned for breaking TOS<br/>of the Lexogrine HUD Manager';
                document.body.appendChild(innerDiv);
            }
            var socket = io('/');
            socket.on('banned', loadBannedPage);
        </script>
    </head>
    <body>
        <iframe id="hud-container" src="${hud}"></iframe>
        ${
			!customer.customer || customer.customer.license.type === 'free'
				? `<div style="
                    position: fixed !important;
                    bottom: unset !important;
                    top: 40px !important;
                    left: unset !important;
                    right: 500px !important;
                    font-family: Arial !important;
                    font-weight: 600 !important;
                    color: rgba(255,255,255,0.5) !important;
                    font-size: 24pt !important;
                    z-index:2 !important;
                    display: block !important;
                    opacity: 1 !important;
                    transform: none !important;

                    align-content: stretch !important;
                    align-items: stretch !important;
                    align-self: auto !important;
                    animation-delay: 0s !important;
                    animation-direction: normal !important;
                    animation-duration: 0s !important;
                    animation-fill-mode: none !important;
                    animation-iteration-count: 1 !important;
                    animation-name: none !important;
                    animation-play-state: running !important;
                    animation-timing-function: ease !important;
                    azimuth: center !important;
                    backface-visibility: visible !important;
                    background-attachment: scroll !important;
                    background-blend-mode: normal !important;
                    background-clip: border-box !important;
                    background-color: transparent !important;
                    background-image: none !important;
                    background-origin: padding-box !important;
                    background-position: 0% 0% !important;
                    background-repeat: repeat !important;
                    background-size: auto auto !important;
                    block-size: auto !important;
                    border-block-end-color: currentcolor !important;
                    border-block-end-style: none !important;
                    border-block-end-width: medium !important;
                    border-block-start-color: currentcolor !important;
                    border-block-start-style: none !important;
                    border-block-start-width: medium !important;
                    border-bottom-color: currentcolor !important;
                    border-bottom-left-radius: 0 !important;
                    border-bottom-right-radius: 0 !important;
                    border-bottom-style: none !important;
                    border-bottom-width: medium !important;
                    border-collapse: separate !important;
                    border-image-outset: 0s !important;
                    border-image-repeat: stretch !important;
                    border-image-slice: 100% !important;
                    border-image-source: none !important;
                    border-image-width: 1 !important;
                    border-inline-end-color: currentcolor !important;
                    border-inline-end-style: none !important;
                    border-inline-end-width: medium !important;
                    border-inline-start-color: currentcolor !important;
                    border-inline-start-style: none !important;
                    border-inline-start-width: medium !important;
                    border-left-color: currentcolor !important;
                    border-left-style: none !important;
                    border-left-width: medium !important;
                    border-right-color: currentcolor !important;
                    border-right-style: none !important;
                    border-right-width: medium !important;
                    border-spacing: 0 !important;
                    border-top-color: currentcolor !important;
                    border-top-left-radius: 0 !important;
                    border-top-right-radius: 0 !important;
                    border-top-style: none !important;
                    border-top-width: medium !important;
                    box-decoration-break: slice !important;
                    box-shadow: none !important;
                    box-sizing: content-box !important;
                    break-after: auto !important;
                    break-before: auto !important;
                    break-inside: auto !important;
                    caption-side: top !important;
                    caret-color: auto !important;
                    clear: none !important;
                    clip: auto !important;
                    clip-path: none !important;
                    column-count: auto !important;
                    column-fill: balance !important;
                    column-gap: normal !important;
                    column-rule-color: currentcolor !important;
                    column-rule-style: none !important;
                    column-rule-width: medium !important;
                    column-span: none !important;
                    column-width: auto !important;
                    content: normal !important;
                    counter-increment: none !important;
                    counter-reset: none !important;
                    cursor: auto !important;
                    empty-cells: show !important;
                    filter: none !important;
                    flex-basis: auto !important;
                    flex-direction: row !important;
                    flex-grow: 0 !important;
                    flex-shrink: 1 !important;
                    flex-wrap: nowrap !important;
                    float: none !important;
                    font-feature-settings: normal !important;
                    font-kerning: auto !important;
                    font-language-override: normal !important;
                    font-size-adjust: none !important;
                    font-stretch: normal !important;
                    font-style: normal !important;
                    font-synthesis: weight style !important;
                    font-variant: normal !important;
                    font-variant-alternates: normal !important;
                    font-variant-caps: normal !important;
                    font-variant-east-asian: normal !important;
                    font-variant-ligatures: normal !important;
                    font-variant-numeric: normal !important;
                    font-variant-position: normal !important;
                    grid-auto-columns: auto !important;
                    grid-auto-flow: row !important;
                    grid-auto-rows: auto !important;
                    grid-column-end: auto !important;
                    grid-column-gap: 0 !important;
                    grid-column-start: auto !important;
                    grid-row-end: auto !important;
                    grid-row-gap: 0 !important;
                    grid-row-start: auto !important;
                    grid-template-areas: none !important;
                    grid-template-columns: none !important;
                    grid-template-rows: none !important;
                    height: auto !important;
                    hyphens: manual !important;
                    image-orientation: 0deg !important;
                    image-rendering: auto !important;
                    image-resolution: 1dppx !important;
                    ime-mode: auto !important;
                    inline-size: auto !important;
                    isolation: auto !important;
                    justify-content: flex-start !important;
                    letter-spacing: normal !important;
                    line-break: auto !important;
                    line-height: normal !important;
                    list-style-image: none !important;
                    list-style-position: outside !important;
                    list-style-type: disc !important;
                    margin-block-end: 0 !important;
                    margin-block-start: 0 !important;
                    margin-bottom: 0 !important;
                    margin-inline-end: 0 !important;
                    margin-inline-start: 0 !important;
                    margin-left: 0 !important;
                    margin-right: 0 !important;
                    margin-top: 0 !important;
                    mask-clip: border-box !important;
                    mask-composite: add !important;
                    mask-image: none !important;
                    mask-mode: match-source !important;
                    mask-origin: border-box !important;
                    mask-position: 0% 0% !important;
                    mask-repeat: repeat !important;
                    mask-size: auto !important;
                    mask-type: luminance !important;
                    max-height: none !important;
                    max-width: none !important;
                    min-block-size: 0 !important;
                    min-height: 0 !important;
                    min-inline-size: 0 !important;
                    min-width: 0 !important;
                    mix-blend-mode: normal !important;
                    object-fit: fill !important;
                    object-position: 50% 50% !important;
                    offset-block-end: auto !important;
                    offset-block-start: auto !important;
                    offset-inline-end: auto !important;
                    offset-inline-start: auto !important;
                    order: 0 !important;
                    orphans: 2 !important;
                    outline-color: initial !important;
                    outline-offset: 0 !important;
                    outline-style: none !important;
                    outline-width: medium !important;
                    overflow: visible !important;
                    overflow-wrap: normal !important;
                    overflow-x: visible !important;
                    overflow-y: visible !important;
                    padding-block-end: 0 !important;
                    padding-block-start: 0 !important;
                    padding-bottom: 0 !important;
                    padding-inline-end: 0 !important;
                    padding-inline-start: 0 !important;
                    padding-left: 0 !important;
                    padding-right: 0 !important;
                    padding-top: 0 !important;
                    page-break-after: auto !important;
                    page-break-before: auto !important;
                    page-break-inside: auto !important;
                    perspective: none !important;
                    perspective-origin: 50% 50% !important;
                    pointer-events: auto !important;
                    quotes: initial !important;
                    resize: none !important;
                    ruby-align: space-around !important;
                    ruby-merge: separate !important;
                    ruby-position: over !important;
                    scroll-behavior: auto !important;
                    scroll-snap-coordinate: none !important;
                    scroll-snap-destination: 0px 0px !important;
                    scroll-snap-points-x: none !important;
                    scroll-snap-points-y: none !important;
                    scroll-snap-type: none !important;
                    shape-image-threshold: 0.0 !important;
                    shape-margin: 0 !important;
                    shape-outside: none !important;
                    tab-size: 8 !important;
                    table-layout: auto !important;
                    text-align: initial !important;
                    text-align-last: auto !important;
                    text-combine-upright: none !important;
                    text-decoration-color: currentcolor !important;
                    text-decoration-line: none !important;
                    text-decoration-style: solid !important;
                    text-emphasis-color: currentcolor !important;
                    text-emphasis-position: over right !important;
                    text-emphasis-style: none !important;
                    text-indent: 0 !important;
                    text-justify: auto !important;
                    text-orientation: mixed !important;
                    text-overflow: clip !important;
                    text-rendering: auto !important;
                    text-shadow: none !important;
                    text-transform: none !important;
                    text-underline-position: auto !important;
                    touch-action: auto !important;
                    transform-box: border-box  !important;
                    transform-origin: 50% 50% 0 !important;
                    transform-style: flat !important;
                    transition-delay: 0s !important;
                    transition-duration: 0s !important;
                    transition-property: all !important;
                    transition-timing-function: ease !important;
                    vertical-align: baseline !important;
                    visibility: visible !important;
                    white-space: normal !important;
                    widows: 2 !important;
                    width: auto !important;
                    will-change: auto !important;
                    word-break: normal !important;
                    word-spacing: normal !important;
                    word-wrap: normal !important;
                    writing-mode: horizontal-tb !important;
                    -webkit-appearance: none !important;
                    -moz-appearance: none !important;
                    -ms-appearance: none !important;
                    appearance: none !important;
                ">Powered by Lexogrine HUD Manager</div>`
				: ''
		}
    </body>
</html>`;
}
