import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import { RATIO_VIEW_TYPE, RatioView } from 'view';
// Remember to rename these classes and interfaces!

interface RatioViewSettings {
	baseAmountIdentifier: string,
	roundToPlace: number,
	ingredientsToGrams: { [key: string]: number },
}

const DEFAULT_SETTINGS: RatioViewSettings = {
	baseAmountIdentifier: 'flour',
	roundToPlace: 1,
	ingredientsToGrams: {
		'egg': 50,
	}
}



export default class RatioViewPlugin extends Plugin {
	settings: RatioViewSettings;

	async onload() {
		await this.loadSettings();
		console.log("plugin loaded");

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: 'open-ratio-view',
			name: 'Open Ratio View',
			callback: () => {
				this.openView();
			}
		});
		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: 'add-ratio-base-identifier-to-line',
			name: 'Add Ratio Base Identifier to Selected Text',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				let currentText = editor.getSelection();
				currentText += ' ' + this.settings.baseAmountIdentifier;
				editor.replaceSelection(currentText);
			}
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new RatioViewSettingTab(this.app, this));

		//callback function returns a new instance of your view
		//takes a leaf as a parameter
		//callback might be called multiple times
		this.registerView(RATIO_VIEW_TYPE, (leaf) => new RatioView(leaf, this));


		this.addRibbonIcon('percent', 'Ratio View', (evt: MouseEvent) => {
			// Called when the user clicks the icon.
			this.openView();
		});


	}

	//create a leaf that will hold our view
	openView() {

		//remove present leaf instancess of my type
		this.app.workspace.detachLeavesOfType(RATIO_VIEW_TYPE);

		//creates a new leaf for you, not getting one, false on splitting
		const leaf = this.app.workspace.getRightLeaf(false);

		leaf.setViewState({
			type: RATIO_VIEW_TYPE,
		});

		//we're going to keep adding views
		this.app.workspace.revealLeaf(leaf);

	}
	onunload() {
		console.log("plugin unloaded");
		this.app.workspace.detachLeavesOfType(RATIO_VIEW_TYPE);
	}


	async loadSettings() {
		//load data is data in data.json, if no data.json just DEFAULT_SETTINGS
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}


}

class RatioViewSettingTab extends PluginSettingTab {
	plugin: RatioViewPlugin;

	constructor(app: App, plugin: RatioViewPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Base Amount Identifier')
			.setDesc('What will identify a line containing the base amount for the recipe? Default is "flour" but it can be any character or word.')
			.addText(text => text
				.setValue(this.plugin.settings.baseAmountIdentifier)
				.onChange(async (value) => {
					console.log('Base Amount Identifier ' + value);
					this.plugin.settings.baseAmountIdentifier = value;
					await this.plugin.saveSettings();
				}));
		new Setting(containerEl)
			.setName('Round To The ... Place')
			.setDesc('How many decimals do you want after whole digits?')
			.addText(text => text
				.setValue(this.plugin.settings.roundToPlace.toString())
				.onChange(async (value) => {
					console.log('Rounding with ' + value + ' decimals');
					this.plugin.settings.roundToPlace = Number(value);
					await this.plugin.saveSettings();
				}));
		new Setting(containerEl)
			.setName("Add metric weight for an ingredient")
			.addTextArea(text => text
				.setValue(JSON.stringify(this.plugin.settings.ingredientsToGrams))
				.onChange(async (value) => {
					try {
						this.plugin.settings.ingredientsToGrams = JSON.parse(value);
					} catch (e) {

					}
					await this.plugin.saveSettings();
				}));

	}
}
