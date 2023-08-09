import RatioViewPlugin from "main";
import { RatioFile } from "ratio-file";
import { ItemView, MarkdownRenderer, TFile, WorkspaceLeaf} from "obsidian";

export const RATIO_VIEW_TYPE = "ratio-view";



export class RatioView extends ItemView {
    plugin: RatioViewPlugin;
    constructor(leaf: WorkspaceLeaf, plugin: RatioViewPlugin) {
        super(leaf);
        this.plugin = plugin;
    }
    //an id for how to uniquely identify your view
    getViewType(): string {
        return RATIO_VIEW_TYPE;
    }
    //what ends up as the title of your view
    getDisplayText(): string {
        return "Ratio View";
    }

    //called whenever the view is activated
    async onOpen() {
        this.render();
        //need to manually render the view for it to show when you change content
    }

    //render is rendering the text with ratios for a list of ingredients
    async render() {
        // extract contentEl - HTML Element where we can put content related to the view
        const { contentEl } = this;
        //clearing the entire contents of the view
        contentEl.empty();
        //All HTML Elements have helper methods for creation.
        contentEl.createEl("h1", { text: "Ratio View" });

        let currentFile: TFile | null = this.app.workspace.getActiveFile();

        if (currentFile) {
            let ratioFile = new RatioFile(this.app,  this.plugin, currentFile);
            if (!ratioFile.hasIngredientHeadingInFile()) {
                contentEl.createEl('p', { text: 'No Ingredient List found... :(' });
            }
            else {
                let ingredientsTextWithRatios = await ratioFile.getRatioText();
                navigator.clipboard.writeText(ingredientsTextWithRatios);
                let div = contentEl.createDiv();
                MarkdownRenderer.renderMarkdown(ingredientsTextWithRatios, div, currentFile.path, this);
            }
        } else {
            contentEl.createEl('p', { text: 'No Active File found...Try openening a new page' });
        }

        //returns boolean on condition of find for the filter funtion
        //HTMLElement is not aware of state, any logic changes made outside of it
        //need to be reloaded through the render() method.
    }






}