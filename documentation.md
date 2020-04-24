
# HUD Manager

If you are in the business of broadcasting professional CS:GO matches, the HUD Manager is a tool right for you. It allows for the easy management of data during the tournament; you can set up matches, vetos, team photographs, and then use it in any compatible HUD you have.

  

## Features
- Players' database
- Teams' database
- Matches' data collection
- Support for custom & steam avatars of players
- Killfeed API
- Boltobserv minimap support
- Custom HUD support
- Key bind API
  
## Installation
 Simply get Manager's installation file from github page and run it

## Usage

By default, Manager runs on 1337 port, however if on the startup it detects that it is being used by other process, it will use first random free port. After startup you want to check if the config files are loaded into the CS:GO in the Settings tab (more about it below).

Once you want to setup the manager for the upcoming match, usually you would want to follow the points below in order: Teams -> Players -> Matches -> HUDs.
### Teams

This section is for additional data display in HUD's and HUD Manager itself. It's an interface connected with database, that allows fast editing the team's information - name, logo, country flag.

  

### Players

  

This tab allows you to specify displayed name for players, their country, real name and photograph as well. Players are identified during the match by SteamID64.

  

### Matches

  

In this section you can specify upcoming matchups you will spectate and choose currently played You have the option to set up teams, that are playing, their map score and veto process.

  

Additionaly, once the match is live the current score is being saved in the background, and once map is finished, the map score on the correct team goes up. (Note - that map have to be set up in veto in order for the Manager to gather data).

  

### HUDS

  

This part is for choosing which HUD you want to use - there is drag'n'drop area for HUDs zip's, so installation of new one is a matter of seconds. Additionaly you can get local's network address for HUD for Browser Source-type screen catching on other PC, access each of the HUD's action panel prepared by the authors, and run transparent window with the HUD directly.

  

For convenience at the top of the screen you can also generate the command you need to run in CS:GO to hide the HUD, radar, and/or killfeed (each HUD should have the indicator whether they support the custom radar and killfeed or not). However if you don't feel like running the commands on your own, if Manager will detect CS:GO on your PC the option to run CS:GO with all configs executed automatically will enable.

  

>Note - to use killfeed you need to run CS:GO through HLAE, and if you check the "Use custom killfeed" option you will have to have HLAE.exe path specified in Settings section.

  

>Note #2 - it's impossible to set custom loader/settings for HLAE if you launch HLAE CS:GO through the manager, so in that case you still need to do it manually with HLAE.

  

### Live

  

In here you will find the list of players currently on the server. If you couldn't get their SteamIDs before the matc or information you have in database is incorrect, just click on a player you want to edit, and you will be redirected to the Players tab, with selected player already loaded in.

  

### Settings

  

To use the Manager correct configuration is required - you need free port to use at least. To use Steam's avatars additionaly you need to get your own Steam API key, and you can additionaly specify the GSI token to filter out payloads in case you are using more than one Gamestate Integration system.

  

Below you can specify the HLAE.exe path - it is required to use automatic CS:GO launch with killfeed enabled.

  

Moreover, you don't need to bother your head with copying the config files. You can see the status of both GSI and config files live, and if they are missing, invalid, or otherwise broken you can just click one button and done - they are installed (provided that Manager found CS:GO's location). Important fact to mention - when you change GSI port, you will need to restart the Manager, so it will start listening on the new one.

  

In situation when config installation doesn't success or Manager doesn't find the CS:GO, you can download the GSI config and archive with all of the required cfg files using two buttons at the bottom of this section.

## HUD API
### Structure
HUD **must have** a valid `hud.json` to be considered valid. For optional functionalities, there are `panel.json` and `keybinds.json`
#### hud.json
  HUD Manager upload field accepts HUD zip files that contain proper `hud.json` file. It should look like that:
  ```json
  {
"name":"Example HUD", //Name of the HUD
"version":"1.0.0", //Version
"author":"osztenkurden", //Author(s)
"legacy": false, //Specify whether it was created for old system - it should work, but you shouldnt expect that
"radar": true, //Does the HUD include radar support
"killfeed": true, //Does the HUD include killfeed support
"css":true //Does the HUD include css file for radar
}
  ```
  HUD Manager will not accept any zip files that do not have correct `hud.json` in their root.
#### panel.json
`panel.json` controls the custom data inputs you want to have in the HUD, for example - tournament logo, torunament name, etc, so any data that you want to set up on match to match basis. The example file looks like that:
  ```json
  [{
	"label": "Trivia",
	"name":"trivia",
	"inputs": [
		{
			"type": "text",
			"name": "title",
			"label": "Trivia title"
		},
		{
			"type": "text",
			"name": "content",
			"label": "Trivia content"
		},
		{
			"type": "action",
			"name": "triviaState",
			"values": [
				{
				"name": "show",
				"label": "Show trivia"
				},
				{
				"name": "hide",
				"label": "Hide trivia"
				}
			]
		}
	]
},
{
	"label": "Display settings",
	"name":"display_settings",
	"inputs": [
		{
			"type": "text",
			"name": "left_title",
			"label": "Left box's title"
		},
		{
			"type": "text",
			"name": "right_title",
			"label": "Right box's title"
		},
		{
			"type":"image",
			"name":"left_image",
			"label":"Left box's image logo"
		},
		{
			"type":"image",
			"name":"right_image",
			"label":"Right box's image logo"
		}
	]
}]
  ```
  And gives the result of:
  ![enter image description here](https://i.imgur.com/qmhSrXt.png)
  This file is basically an array of section objects. Each section object looks like this:
  ```json
{
	"label":"Displayed name of sections",
	"name":"id_name",
	"inputs": [] //Array of Inputs
}
```
And each input object looks like this:
  ```json
{
	"type":"text" | "image",
	"name":"id_name",
	"label": "Displayed name of the input"
}
```
Additional there is an action input that sends predetermined data and renders as a buttons - it's useful for toggling on-screen effects.
  ```json
{
	"type":"action",
	"name":"id_name",
	"values": [
		"name":"id_name" //It is used as value for id_name action",
		"label":"Displayed name" //Label of the button
	]
}
```
Each value in the action input is seperate button. To see how to listen for data from the HUD side please this part of the CSGO React HUD documentation.
#### keybinds.json
This file is basically another way to communicate with the HUD. Lets look at the example file:
```json
[
	{
		"bind":"Ctrl+B",
		"action":"toggleRadar"
	},
	{
		"bind":"Alt+B",
		"action":"radarBigger"
	},
	{
		"bind":"Alt+S",
		"action":"radarSmaller"
	},
	{
		"bind":"Alt+T",
		"action":"toggleTrivia"
	}
]
```
It's one more time just an array of the actions. Each bind has only `bind` and `action` property. Bind is of course key bind you want to use, and action is the identifier of the action. What makes difference from the `panel.json` action input, is that in here we don't have additional data packed with the action name.
#### Radar
Radar is hosted by the HUD Manager, so you don't have to include it yourself. You can access it on `/radar`. To load HUDs custom radar.css you should add `?hud=` query with the directory name of the HUD to the URL, unless you work on the dev mode of the HUD - in this case you should add `?isDev=true` to the URL. If you are using the `csgo-react-hud` repo you don't have to think about those things, as it adds query params by itself.
#### radar.css
This file works as `custom.css` file from `boltobserv` and loads itself into the radar for any given HUD. It requires for `css` property in `hud.json` to be set to `true`.
#### thumb.png	
For nice display in the HUDs tab in  the Manager you should include this file, as it will be displayed next to its name. Recommended size: 64px x 64px
## Technicalities

  

HUD Manager uses, among the others, Express.js for REST API and GSI endpoints, `csgogsi`  `csgogsi-socket` for data parsing, joining the additional info about teams and players and listening for events such as end of round.

  

HUD Manager exposes port specified in settings as entry point for WebSockets, and sends `update` event that comes with CSGOParsed object, which definition you can find here: https://www.npmjs.com/package/csgogsi

  

In the background, HUD Manager also regurarly checks if the port 3500 is taken, and if yes - it tries to see if the HUD in dev mode works there. If yes, it will show it in HUDs tab and allow to use it locally as any other HUD.

  

Local data is stored in Nedb.js database locally in `%HOME%\hud_manager` directory. It includes config, teams, players and match data.

  

For looking up the Steam's and CS:GO's directory it uses `steam-game-path` package.

  

HUD Manager was written with Windows environment in mind. It probably works on Linux and Mac after compilation, however no promises.
### Sockets
Once connected to the HUD Manager with sockets, Manager sends events:

|Name|Data|Description|
|--|--|--|
|`readyToRegister`||Manager then expects to get `register` event with two argument: `name: string` and `isDev: boolean`. `isDev` should only be true if you are in development mode AND on port 3500.
|`update`|CSGO GSI data
|`update_mirv`|MIRV `player_death` gameEvent
|`hud_config`|Data from `panel.json` filled form|
|`hud_action`|Action name and action type from `panel.json`
|`keybindAction`|Name of the action from `keybinds.json`


  

## REST API
|Endpoint| Method | Returned|
|--|--|--|
| `/api/teams` | GET | Array of  teams
|`/api/players`| GET | Array of players
|`/api/players/:id`|GET|Find player of id|
|`/api/players/avatar/:id`|GET|Find avatar of player with id|
|`/api/players/avatar/steamid/:steamid`|GET|Find avatar of player with steamid|
|`/api/teams/:id`|GET|Find team of id|
|`/api/teams/logo/:id`|GET|Find logo of team with id|
|`/api/config`|GET|Get manager config|
|`/api/match`|GET|Array of matches|
|`/api/huds`|GET|Array of available HUDs|
|`/api/maps`|GET|Array of map pool|
|`/api/gsi`|GET|Check if GSI file is loaded|
|`/api/cfg`|GET|Check if configs file are loaded|
|`/api/csgo`|GET|Get latest data from CSGO|
