# Instruction
## Teams
This section is for additional data display in HUD's and HUD Manager itself. It's an interface connected with database, that allows fast editing the team's information - name, logo, country flag.

## Players

This tab allows you to specify displayed name for players, their country, real name and photograph as well. Players are identified during the match by SteamID64.

## Matches

In this section you can specify upcoming matchups you will spectate and choose currently played You have the option to set up teams, that are playing, their map score and veto process.

Additionaly, once the match is live the current score is being saved in the background, and once map is finished, the map score on the correct team goes up. (Note - that map have to be set up in veto in order for the Manager to gather data).

## HUDS

This part is for choosing which HUD you want to use - there is drag'n'drop area for HUDs zip's, so installation of new one is a matter of seconds. Additionaly you can get local's network address for HUD for Browser Source-type screen catching on other PC, access each of the HUD's action panel prepared by the authors, and run transparent window with the HUD directly.

For convenience at the top of the screen you can also generate the command you need to run in CS:GO to hide the HUD, radar, and/or killfeed (each HUD should have the indicator whether they support the custom radar and killfeed or not). However if you don't feel like running the commands on your own, if Manager will detect CS:GO on your PC the option to run CS:GO with all configs executed automatically will enable.

Note - to use killfeed you need to run CS:GO through HLAE, and if you check the "Use custom killfeed" option you will have to have HLAE.exe path specified in Settings section.

## Live

In here you will find the list of players currently on the server. If you couldn't get their SteamIDs before the matc or information you have in database is incorrect, just click on a player you want to edit, and you will be redirected to the Players tab, with selected player already loaded in.

## Settings

To use the Manager correct configuration is required - you need free port to use at least. To use Steam's avatars additionaly you need to get your own Steam API key, and you can additionaly specify the GSI token to filter out payloads in case you are using more than one Gamestate Integration system.

Below you can specify the HLAE.exe path - it is required to use automatic CS:GO launch with killfeed enabled.

Moreover, you don't need to bother your head with copying the config files. You can see the status of both GSI and config files live, and if they are missing, invalid, or otherwise broken you can just click one button and done - they are installed (provided that Manager found CS:GO's location). Important fact to mention - when you change GSI port, you will need to restart the Manager, so it will start listening on the new one.

In situation when config installation doesn't success or Manager doesn't find the CS:GO, you can download the GSI config and archive with all of the required cfg files using two buttons at the bottom of this section.

# Technicalities

HUD Manager uses, among the others, Express.js for REST API and GSI endpoints, `csgogsi` `csgogsi-socket` for data parsing, joining the additional info about teams and players and listening for events such as end of round.

HUD Manager exposes port specified in settings as entry point for WebSockets, and sends `update` event that comes with CSGOParsed object, which definition you can find here: https://www.npmjs.com/package/csgogsi

In the background, HUD Manager also regurarly checks if the port 3000 is taken, and if yes - it tries to see if the HUD in dev mode works there. If yes, it will show it in HUDs tab and allow to use it locally as any other HUD.

Local data is stored in Nedb.js database locally in %HOME%\hud_manager directory. It includes config, teams, players and match data.

For looking up the Steam's and CS:GO's directory it uses `steam-game-path` package.

HUD Manager was written with Windows environment in mind. It probably works on Linux and Mac after compilation, however no promises.

# REST API
