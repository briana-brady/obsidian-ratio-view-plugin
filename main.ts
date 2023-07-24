import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import { RatioText } from "./ratio";
import { RATIO_VIEW_TYPE, RatioView } from 'view';
// Remember to rename these classes and interfaces!

interface MyPluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: 'default'
}

export default class MyBeautifulPlugin extends Plugin {
	settings: MyPluginSettings;

	async onload() {
		await this.loadSettings();
		console.log("plugin loaded");
		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon('dice', 'Sample Plugin', (evt: MouseEvent) => {
			// Called when the user clicks the icon.
			new Notice('Alright alright, you clicked me.');
		});
		// Perform additional things with the ribbon
		ribbonIconEl.addClass('my-plugin-ribbon-class');

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText('Status Bar Text');

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: 'open-sample-modal-simple',
			name: 'Open sample modal (simple)',
			callback: () => {
				new SampleModal(this.app).open();
			}
		});
		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: 'sample-editor-command',
			name: 'Sample editor command',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				console.log(editor.getSelection());
				editor.replaceSelection('Sample Editor Command');
			}
		});
		// This adds a complex command that can check whether the current state of the app allows execution of the command
		this.addCommand({
			id: 'open-sample-modal-complex',
			name: 'Open sample modal (complex)',
			checkCallback: (checking: boolean) => {
				// Conditions to check
				const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (markdownView) {
					// If checking is true, we're simply "checking" if the command can be run.
					// If checking is false, then we want to actually perform the operation.
					if (!checking) {
						new SampleModal(this.app).open();
					}

					// This command will only show up in Command Palette when the check function returns true
					return true;
				}
			}
		});



		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));

		//callback function returns a new instance of your view
		//takes a leaf as a parameter
		//callback might be called multiple times
		this.registerView(RATIO_VIEW_TYPE, (leaf) => new RatioView(leaf));
		
		
		const ratioIcon = this.addRibbonIcon('percent', 'Ratio View', (evt: MouseEvent) => {
			// Called when the user clicks the icon.
			this.openView();
		});
		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		// this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
		// 	console.log('click', evt);
		// });

		
		// this.registerMarkdownPostProcessor((element, context) => {
			
		// 	const innerElements = element.querySelectorAll("p");
			
		// 	for (let i = 0; i < innerElements.length; i++) {

		// 	  const codeblockElement = innerElements.item(i);

		// 	  const text = codeblockElement.innerText.trim();
			  
	  
		// 	  if (this.isAnIngredientListing(text)) {
		// 		context.addChild(new RatioText(codeblockElement, text));
		// 	  }
		// 	}
		//   });
		}

	//create a leaf that will hold our view
	openView(){

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

	isAnIngredientListing(text: string): boolean {
		return text[0] === ":" && text[text.length - 1] === ":";
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}


}


class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const {contentEl} = this;
		contentEl.setText('Woah!');
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}

class SampleSettingTab extends PluginSettingTab {
	plugin: MyBeautifulPlugin;

	constructor(app: App, plugin: MyBeautifulPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		containerEl.createEl('h2', {text: 'Settings for my awesome plugin.'});

		new Setting(containerEl)
			.setName('Setting #1')
			.setDesc('It\'s a secret')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.mySetting)
				.onChange(async (value) => {
					console.log('Secret: ' + value);
					this.plugin.settings.mySetting = value;
					await this.plugin.saveSettings();
				}));
	}
}
