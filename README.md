# Obsidian Ratio View Plugin


This plugin shows baker's percentages for a file with ingredients in grams, given an ingredient to treat as a base.
Fun for those who really, *really* want to know just how much sugar to put in those cookies as a percentage of the flour content. Works great on bread recipes as well, but really you just need a Markdown file in Obsidian with an Ingredients heading to get going.

## How to use

Let's say we have a file, The-Best-Cookies.md with the following contents:

```
# The Best Cookies
## Ingredients
- 500g all-purpose flour
- 200g butter
- 2 eggs
- 2 tsp vanilla
- 300g granulated sugar
- 2 tsp baking powder

## Instructions
Make the cookies.
```
(Possibly the worst cookies, I made the amounts up.)

After installing the plugin, you'll see a percent icon on the left sidebar.
Click it!

The right sidebar will open a view that shows this!

## Ingredients

- 500g all-purpose flour 100%
- 200g butter 40%
- 2 eggs 20%
- 2 tsp vanilla
- 300g granulated sugar 60%
- 2 tsp baking powder


Plus the generated Ingredient list text gets copied to your clip board.

But, you say! What about the baking powder?

Well, Ratio View works on metric ingredients, but it allows for user input. If you go to settings, you'll see that you can add metric weights for ingredients! Look, there's some already for eggs!
```js
{"egg":50}
```

1 tsp of baking powder is ~ 4.8 grams, let's add it.
```js
{
  "egg":50,
  "tsp baking powder":4.8
}
```
Let's recalculate!
## Ingredients

- 500g all-purpose flour 100%
- 200g butter 40%
- 2 eggs 20%
- 2 tsp vanilla
- 300g granulated sugar 60%
- 2 tsp baking powder 1.9%

Nice!

For recipes that don't have flour in them, we can change or add to the Base Amount Identifier in settings.

Changing the value to "flour|\\\*" means that in any recipe that doesn't have flour listed, the calculator will look for an asterisk (*) in the line that should be the base amount. 


This is using a regex behind the scenes, so you'll probably need to escape any non alpha-numeric characters.

  







## Manually installing the plugin

- Copy over `main.js`, `styles.css`, `manifest.json` to your vault `VaultFolder/.obsidian/plugins/your-plugin-id/`.





## For development
Forked from the sample plugin for Obsidian (https://obsidian.md).

This project uses Typescript to provide type checking and documentation.
The repo depends on the latest plugin API (obsidian.d.ts) in Typescript Definition format, which contains TSDoc comments describing what it does.

**Note:** The Obsidian API is still in early alpha and is subject to change at any time!

This sample plugin demonstrates some of the basic functionality the plugin API can do.
- Adds a ribbon icon, which shows a Notice when clicked.
- Adds a command "Open Sample Modal" which opens a Modal.
- Adds a plugin setting tab to the settings page.
- Registers a global click event and output 'click' to the console.
- Registers a global interval which logs 'setInterval' to the console.

## First time developing plugins?

Quick starting guide for new plugin devs:

- Check if [someone already developed a plugin for what you want](https://obsidian.md/plugins)! There might be an existing plugin similar enough that you can partner up with.
- Make a copy of this repo as a template with the "Use this template" button (login to GitHub if you don't see it).
- Clone your repo to a local development folder. For convenience, you can place this folder in your `.obsidian/plugins/your-plugin-name` folder.
- Install NodeJS, then run `npm i` in the command line under your repo folder.
- Run `npm run dev` to compile your plugin from `main.ts` to `main.js`.
- Make changes to `main.ts` (or create new `.ts` files). Those changes should be automatically compiled into `main.js`.
- Reload Obsidian to load the new version of your plugin.
- Enable plugin in settings window.
- For updates to the Obsidian API run `npm update` in the command line under your repo folder.

## Releasing new releases

- Update your `manifest.json` with your new version number, such as `1.0.1`, and the minimum Obsidian version required for your latest release.
- Update your `versions.json` file with `"new-plugin-version": "minimum-obsidian-version"` so older versions of Obsidian can download an older version of your plugin that's compatible.
- Create new GitHub release using your new version number as the "Tag version". Use the exact version number, don't include a prefix `v`. See here for an example: https://github.com/obsidianmd/obsidian-sample-plugin/releases
- Upload the files `manifest.json`, `main.js`, `styles.css` as binary attachments. Note: The manifest.json file must be in two places, first the root path of your repository and also in the release.
- Publish the release.

> You can simplify the version bump process by running `npm version patch`, `npm version minor` or `npm version major` after updating `minAppVersion` manually in `manifest.json`.
> The command will bump version in `manifest.json` and `package.json`, and add the entry for the new version to `versions.json`

## Adding your plugin to the community plugin list

- Check https://github.com/obsidianmd/obsidian-releases/blob/master/plugin-review.md
- Publish an initial version.
- Make sure you have a `README.md` file in the root of your repo.
- Make a pull request at https://github.com/obsidianmd/obsidian-releases to add your plugin.

## How to use

- Clone this repo.
- `npm i` or `yarn` to install dependencies
- `npm run dev` to start compilation in watch mode.

## Manually installing the plugin

- Copy over `main.js`, `styles.css`, `manifest.json` to your vault `VaultFolder/.obsidian/plugins/your-plugin-id/`.

## Improve code quality with eslint (optional)
- [ESLint](https://eslint.org/) is a tool that analyzes your code to quickly find problems. You can run ESLint against your plugin to find common bugs and ways to improve your code. 
- To use eslint with this project, make sure to install eslint from terminal:
  - `npm install -g eslint`
- To use eslint to analyze this project use this command:
  - `eslint main.ts`
  - eslint will then create a report with suggestions for code improvement by file and line number.
- If your source code is in a folder, such as `src`, you can use eslint with this command to analyze all files in that folder:
  - `eslint .\src\`

## Funding URL

You can include funding URLs where people who use your plugin can financially support it.

The simple way is to set the `fundingUrl` field to your link in your `manifest.json` file:

```json
{
    "fundingUrl": "https://buymeacoffee.com"
}
```

If you have multiple URLs, you can also do:

```json
{
    "fundingUrl": {
        "Buy Me a Coffee": "https://buymeacoffee.com",
        "GitHub Sponsor": "https://github.com/sponsors",
        "Patreon": "https://www.patreon.com/"
    }
}
```

## API Documentation

See https://github.com/obsidianmd/obsidian-api
