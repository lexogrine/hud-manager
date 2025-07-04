# [**LHM.gg**](http://LHM.gg) **\- Lexogrine HUD Manager**

LHM.gg is a powerful esports cloud platform: all-in-one broadcasting, observing, spectating, production, events, HUDs, overlays, analytics, and esports tournament Manager for CS2, Dota 2, League of Legends, Valorant, Rocket League, and Apex Legends.

It automates production, offers advanced features like cloud synchronization, players' cameras, AI observers, and manages spectator overlays and HUDs.

LHM is created by Lexogrine, a leading AI software company, offering top-tier [AI](https://www.lexogrine.com/services/ai-data-science), [web](https://www.lexogrine.com/services/web-software-development), and [mobile development](https://www.lexogrine.com/services/mobile-development) services.

#### **Content**

- [Features](#features)
- [Installation](#installation)
- [HUDs and Overlays](#huds-and-overlays)
  - [Ultra HUDs](#ultra-huds)
  - [Premium HUDs](#premium-huds)
  - [Open-source React HUDs](#open-source-react-huds)
- [Usage](#usage)
  - [Teams](#teams)
  - [Players](#players)
  - [Matches](#matches)
  - [Testing](#testing)
  - [Custom database fields](#custom-database-fields)
  - [LHM Cameras](#lhm-cameras)
  - [LHM Signals](#lhm-signals)
- [Easy Data Import](#easy-data-import)
- [LHM Cloud \- Cloud Storage](#lhm-cloud---cloud-storage-for-your-huds-overlays-and-data)
- [Supported games](#supported-games)
- [Signing HUDs](#signing-huds)
- [Settings](#settings)
- [Custom HUD structure](#custom-hud-structure)
- [Technicalities](#technicalities)
- [REST API](#rest-api)
- [About Lexogrine](#about-lexogrine)

#### **Features**

- Player database
- Team database
- Match data collection
- Support for player avatars (custom and Steam)
- Killfeed API
- Tournament ladder
- Custom database fields
- Custom HUD support
- Player cam feed support (experimental)
- Keybinding API

#### **Installation**

Download the latest version of LHM from the GitHub repository or directly from the [LHM.gg](http://LHM.gg) website. Once installed, LHM will automatically connect itself to most of the supported games. Some games require a few additional steps, you can read more about them in our Guide.

#### **HUDs and Overlays**

All LHM HUDs are automatically stored in LHM Cloud, so once you upload the HUD, you no longer need to worry about manually sending it from one event to the next. Each subscription plan comes with its own storage limit, so the more HUDs and overlays you have, the bigger the storage you will need. Simply drag'n'drop area for HUD .zip files, so installation of new ones is a matter of seconds.

LHM is both a fully automated platform and programming environment, so you can both use Lexogrine-created HUDs and overlays, ready to be used with just a few simple clicks, or develop your own HUDs and overlays from scratch, thanks to the availability of open source default React HUDs for every supported game.

You can find them here:

- [CS2 default React HUD](https://github.com/lexogrine/cs2-react-hud/)
- [Dota 2 default React HUD](https://github.com/lexogrine/dota2-react-hud)
- [League of Legends default React HUD](https://github.com/lexogrine/league_of_legends_react_hud)
- [Valorant default React HUD](https://github.com/lexogrine/valorant-react-hud)
- [Rocket League default React HUD](https://github.com/lexogrine/rl-react-hud)
- [Apex Legends default React HUD](https://github.com/lexogrine/apex-hud)

Additionally, you can use a local network address for the Browser Source-type screen to grab the HUD view on another PC, access each of the HUD's action panels prepared by the authors, and directly run a transparent window with the HUD.

##### **Ultra HUDs**

Ultra HUD is the most advanced and automated HUD that you can use for the esport tournament. It supports Counter-Strike 2, Dota 2, and League of Legends, and offers several layouts and color schemes to choose from, dedicated overlays for draft and map veto, pre match and post match summaries and information overlays, dedicated comparisons and analytics and advanced HUD editor that allows you to change colors and elements of the HUD and save each config as separate preset in LHM Cloud.

Ultra HUD is as flexible and advanced as you need it to be and allows you to create a top-tier CS2, Dota 2, and LoL esport event with just a few simple steps.

It offers dedicated map veto overlays for Counter-Strike 2 and dedicated draft overlays for League of Legends and Dota 2\.

You can find more information here:

- [CS2 Ultra HUD](https://lhm.gg/features/ultra-hud/cs2)
- [Dota 2 Ultra HUD](https://lhm.gg/features/ultra-hud/dota2)
- [League of Legends Ultra HUD](https://lhm.gg/features/ultra-hud/league-of-legends)

##### **Premium HUDs**

For those looking for a simpler solution, Premium HUD is a perfect choice. It comes with several color schemes, advanced data analysis, and comparisons, available based on your subscription plan. Each major supported game comes with its own Premium HUD, so all you need to do is purchase the subscription, and you are ready to stream and observe esport matches.

Premium HUDs are available for:

- [CS2 Premium HUD](https://lhm.gg/features/premium-hud/cs2)
- [Dota 2 Premium HUD](https://lhm.gg/features/premium-hud/dota-2)
- [League of Legends Premium HUD](https://lhm.gg/features/premium-hud/league-of-legends)
- [Valorant Premium HUD](https://lhm.gg/features/premium-hud/valorant)
- [Rocket League Premium HUD](https://lhm.gg/features/premium-hud/rocket-league)

##### **Open source React HUDs**

LHM is a perfect developer environment that allows you to create your very own HUDs and overlays, fully aligned with your needs and preferences. All you need to do is use our default React HUD for each supported game and modify it using leading developer tools and technologies.

#### **Usage**

The best way to start your journey with LHM is by following the [Installation & First Use guide](https://guide.lhm.gg/docs/lhm-basics/installation-and-first-use/), and we’ve also prepared a [video walkthrough over all basic LHM features](https://www.youtube.com/watch?v=5-PuyoaeZ68) \- both of them will help you get started quickly and without friction.

If you’re interested in Valorant and/or League of Legends integrations that LHM provides, we deeply recommend you check out their own dedicated video tutorials \- you’ll find both on [our YouTube channel](https://www.youtube.com/@Lexogrine).

If you encounter any problems or have questions, send us a message on [LHM.gg](http://LHM.gg) or join [our Discord server](https://discord.com/invite/CHrg33UMs3) and post in one of the troubleshooting channels \- our passionate community is well-versed in LHM usage and surely either us or one of our users will help you with any issues you’re facing.

LHM comes with advanced features that can automate most of your production:

- [Scout AI \- AI observer, cinematics, and match predictions](https://lhm.gg/features/scout-ai)
- [LHM Replays \- automatic replays for CS2 and Dota 2](https://lhm.gg/features/replays)
- [LHM Cameras \- players’ cameras](https://lhm.gg/features/hud-cameras)
- [LHM Signals \- automatic game event capture and Companion automation](https://lhm.gg/features/signals)
- [LHM Addons \- plugins to extend LHM functionalities based on in-game events and LHM environment](https://lhm.gg/features/addons)
- [LHM Map Veto \- automated LAN and online map veto with dedicated overlays for CS2 and Valorant](https://lhm.gg/veto)

##### **Teams**

Team management includes the team name, short description, country, and the team logo. You can also search for a specific team with a search bar, and by clicking on any field, you can filter your teams.

You can also add your own custom fields for your needs. To do so, click on this icon and add your own filter. This feature is mainly dedicated to programming usage.

##### **Players**

Player management allows you to define first name, last name, nickname, country, team, and pictures. Depending on the game's technicalities, some information may vary:

- CS2 \- SteamID \- First name, last name, nickname, and avatar of a player displayed on a HUD and Cameras feature
- Dota 2 \- Steam ID \- First name, last name, nickname, and avatar of a player displayed on a HUD "Cameras" feature
- League of Legends \- In-game nickname \- Custom nickname and avatar displayed on HUD "Cameras" feature
- Rocket League \- In-game nickname \- Custom nickname and avatar displayed on HUD "Cameras" feature
- Apex Legends \- In-game nickname \- First name, last name, nickname, and avatar of a player displayed on a HUD "Cameras" feature

##### **Matches**

Matches come with score management, BO configuration, date, and vetos. You can specify upcoming matchups you will spectate and choose which one is currently being played. You have the option to set up teams taking part, their map scores, and the veto or draft \- depending on the game \- process.

Additionally, while the match is live the current score is being saved in the background and once a map finishes, its match score for the winning team increases. This way you don't have to worry, if the match score is up-to-date. You can see the current map score in the veto view, and reset it if needed. Current map score is updated each time it detects end of the round from the CS:GO, unless the map has been marked as finished \- in that case the score won't be updated, but still can be resetted, which will set the map back to a non-finished state.

Note \- a match has to be set as active and a used map has to be set up in veto in order for the Lexogrine HUD Manager to gather data.

##### **Testing**

LHM allows for easy preview and testing of HUDs even if you don’t have the respective game running. Just click on the “Run Test Data” button (and optionally on “Enable test loop”), and LHM will start feeding prerecorded data from a real game match to all running HUDs.

This allows for quick and easy preview of any HUD and is a great tool for custom HUD development, as you don’t have to have the game running in the background at all times.

##### **Custom database fields**

LHM allows you to expand the default database structure for greater flexibility. You can add custom fields \- such as text, match, player, team, color, or image \- to both players and teams. These values are stored in an extra object, so for example, a custom color field named theme for a team would be accessible in the HUD as team.extra.color. If you use these custom fields regularly, you can also display them as additional columns alongside standard properties for easier access.

##### **LHM Cameras**

The LHM Cameras module is built into LHM, allowing you to display player webcams using LHM itself in all HUDs supporting this module \- no external tool is needed.

All Premium and Ultra HUDs made by Lexogrine include support for LHM Cameras, and you’re free to add this functionality to your custom HUDs too.

More information about LHM Cameras can be found on its [dedicated LHM Guide page](https://guide.lhm.gg/docs/lhm-basics/cameras/).

##### **LHM Signals**

LHM Signals lets you automatically detect key events from top esports titles and trigger actions in the Companion tool with just a few clicks. You can create custom Presets for various events and production setups, defining triggers like round wins, round ends, or hero bans, with branching options for faster confirmations. Everything is saved securely in the LHM Cloud, so your workflows are accessible from anywhere.

#### **Easy Data Import**

LHM provides extended support for data import, including different formats. You can use our API with POST and PATCH, import data from XLS and CSV files, and more\!

And if our import methods don’t support your case, just contact us directly at [LHM.gg](http://LHM.gg) \- we’ll provide the necessary path for data migration.

#### **LHM Cloud \- Cloud Storage for your HUDs, overlays, and data**

LHM Cloud allows you to store your spectator and observer HUDs, matches, tournaments, and more in the cloud with seamless synchronization between your devices, so you no longer need to worry about manual file transferring.

Read more about [LHM Cloud](https://www.lhm.gg/features/cloud-storage) and how it can automate your esport production and HUD management.

#### **Supported games**

LHM supports CS2, Dota 2, League of Legends, Valorant, Rocket League, PUBG Mobile, and Apex Legends.

Each supported game comes with its own specific adjustments and support to make sure every observer, esport production company, and event organization can use and offer the most for each.

Read more about each integration:

- [CS2 game support and features for HUD management and esport production](https://www.lhm.gg/features/multiple-game-support/cs2)
- [Dota 2 game support and features for HUD management and esport production](https://www.lhm.gg/features/multiple-game-support/dota2)
- [League of Legends game support and features for HUD management and esport production](https://www.lhm.gg/features/multiple-game-support/league-of-legends)
- [Valorant game support and features for HUD management and esport production](https://www.lhm.gg/features/multiple-game-support/valorant)
- [Rocket League game support and features for HUD management and esport production](https://www.lhm.gg/features/multiple-game-support/rocket-league)
- [PUBG Mobile game support and features for HUD management and esport production](https://www.lhm.gg/features/multiple-game-support/apex-legends)
- [Apex Legends game support and features for HUD management and esport production](https://www.lhm.gg/features/multiple-game-support/pubg-mobile)

#### **Signing HUDs**

Custom HUD developers working with LHM are given the option to protect their creations with the use of HUD signing. Signed HUDs are secured with a generated signature that prevents unauthorized modifications of your HUD. Any HUDs using default Lexogrine HUDs as a base \- be it [CS2 React HUD](https://github.com/lexogrine/cs2-react-hud/), [Valorant React HUD](https://github.com/lexogrine/valorant-react-hud), [Dota 2 React HUD](https://github.com/lexogrine/dota2-react-hud) or [League of Legends React HUD](https://github.com/lexogrine/league_of_legends_react_hud) \- can be automatically signed by running \`npm run sign\`.

LHM verifies HUD signatures during their upload to LHM Cloud, and will not run HUDs that it detects have been tampered with.

#### **Settings**

LHM automates as much of the game configuration process as possible, but depending on the game, there may be some manual steps that you have to follow before your game is ready to be used with LHM.

If this is your first time using LHM, we recommend you to watch the [LHM.gg \- Initial Configuration & Basic Features video](https://www.youtube.com/watch?v=5-PuyoaeZ68), which will lead you through the whole process.

The configuration process for all games is detailed in our dedicated guides, and for the more tricky integrations, such as for Valorant and League of Legends observing, we’ve prepared easy-to-follow videos describing all necessary steps, which you can watch on [our YouTube channel](https://www.youtube.com/@Lexogrine).

Read more in our game configuration guides:

- [Counter-Strike 2 configuration](https://guide.lhm.gg/docs/lhm-basics/games-configurations/counter-strike/)
- [Dota 2 configuration](https://guide.lhm.gg/docs/lhm-basics/games-configurations/dota-2/)
- [League of Legends configuration](https://guide.lhm.gg/docs/lhm-basics/games-configurations/league-of-legends/)
- [Valorant configuration](https://guide.lhm.gg/docs/lhm-basics/games-configurations/valorant/)
- [PUBG Mobile configuration](https://guide.lhm.gg/docs/lhm-basics/games-configurations/pubgmobile/)
- [Rocket League configuration](https://guide.lhm.gg/docs/lhm-basics/games-configurations/rocket-league/)
- [Apex Legends configuration](https://guide.lhm.gg/docs/lhm-basics/games-configurations/apex-legends/)

Watch one of our video tutorials:

- [LHM.gg \- Valorant Integration Overview & Setup](https://www.youtube.com/watch?v=h8AcB_Pfc2k)
- [LHM.gg \- League of Legends Integration Overview & Setup](https://www.youtube.com/watch?v=OWVcHv7tsbQ)

#### **Custom HUD structure**

When uploading or developing a HUD, it must have a \`hud.json\` in its root (or in \`/public\`, or \`/static\` directory in case of development). This file contains metadata describing basic properties of the HUD so that it can be properly recognized by LHM. All custom HUDs made for use with LHM must contain this file.

LHM also supports \`panel.json\` files for managing custom inputs \- buttons, text inputs, player selectors, image pickers etc., and \`keybinds.json\` files for creating custom keybindings for various actions, such as displaying a scoreboard panel with a key combination.

Last but not least, the \`thumb.png\` file contains the image that will be displayed in the HUD list, allowing you to easily find the HUD you’re looking for.

All information about HUD file structure can be found [in our dedicated documentation](https://guide.lhm.gg/docs/spec/rest-api/huds/).

#### **Technicalities**

LHM is written with the latest versions of Microsoft Windows in mind \- currently, Windows 10 and Windows 11 are supported. We can’t guarantee compatibility with older versions and different operating systems.

In order to communicate with supported games, LHM makes use of various methods depending on the game, so for more information regarding the details, we recommend you to check out their respective subpages [in our game configuration guide](https://guide.lhm.gg/docs/category/game-configuration/).

When running LHM from behind a firewall, you may have to take into account various different ports that are required for it to work properly. More information about network ports used by LHM can be found [in the Network Ports section of LHM Docs](https://guide.lhm.gg/docs/spec/rest-api/network-ports/).

LHM makes use of various open-source components at its core. The list of software used and their respective licenses can be found at [THIRD PARTY NOTICES](https://github.com/lexogrine/hud-manager/blob/main/THIRD%20PARTY%20NOTICES).

#### **REST API**

LHM provides a simple REST API allowing for control of its basic functions without a graphical user interface.

| Endpoint                               | Method | Returns                                                                                                                                               |
| -------------------------------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/api/teams`                           | GET    | Array of teams                                                                                                                                        |
| `/api/players`                         | GET    | Array of players                                                                                                                                      |
| `/api/players/:id`                     | GET    | Find player by ID                                                                                                                                     |
| `/api/players/avatar/:id`              | GET    | Find avatar of player by ID                                                                                                                           |
| `/api/players/avatar/steamid/:steamid` | GET    | Find avatar of player with SteamID                                                                                                                    |
| `/api/teams/:id`                       | GET    | Find team by ID                                                                                                                                       |
| `/api/teams/logo/:id`                  | GET    | Find team logo by ID                                                                                                                                  |
| `/api/config`                          | GET    | Get manager config                                                                                                                                    |
| `/api/match`                           | GET    | Array of matches. Add `?full` to get also last entry of GSI data for each match                                                                       |
| `/api/match/current`                   | GET    | Current match                                                                                                                                         |
| `/api/match/:id`                       | GET    | Find match by ID                                                                                                                                      |
| `/api/huds/action/:hudDir/:action`     | POST   | Send action to the HUD. Simulates actions from HUD settings panel if body exists on the request, or keybind action if body is empty                   |
| `/api/huds`                            | GET    | Array of available HUDs                                                                                                                               |
| `/api/maps`                            | GET    | Map pool array                                                                                                                                        |
| `/api/gsi`                             | GET    | Check if GSI file is loaded                                                                                                                           |
| `/api/cfg`                             | GET    | Check if config files are loaded                                                                                                                      |
| `/api/game`                            | GET    | Get latest data from CS:GO                                                                                                                            |
| `/api/players`                         | POST   | Adding Player. Body must by player object without \_id                                                                                                |
| `/api/players/:id`                     | PATCH  | Updating Player                                                                                                                                       |
| `/api/teams`                           | POST   | Adding Team. Body must by Team object without \_id                                                                                                    |
| `/api/teams/:id`                       | PATCH  | Updating Team                                                                                                                                         |
| `/api/timeline/:game`                  | GET    | Get Timeline for given game. Dota 2 only                                                                                                              |
| `/api/scout`                           | GET    | Gets current state of Scout modules                                                                                                                   |
| `/api/scout`                           | POST   | Toggles Scout modules. Requires body with keys "vision", "cinematic", "predict". Values are boolean for forcing ON / OFF state or `null` for toggling |

#### **About Lexogrine**

[Lexogrine](https://lexogrine.com) is an AI software development company, offering top-tier AI, web, and mobile design and development services for international companies. Alongside that, Lexogrine offers a set of web and mobile applications \- including [LHM.gg](http://LHM.gg) \- that revolutionize the way experts and specialists from different industries work together on a daily basis.

[Lexogrine](https://lexogrine.com) specializes in AI development, alongside web, mobile, and cloud development with technologies like TypeScript, Python, LLM, React, React Native, Node.js, Prisma, Medusa, Pytorch, AWS, and Google Cloud Platform.

With over 5 years of experience, Lexogrine delivered hundreds of projects, supporting companies and enterprises from all over the world.
