import { HeadingCache, ItemView, MarkdownRenderer, MarkdownView, Setting, WorkspaceLeaf } from "obsidian";

export const RATIO_VIEW_TYPE = "ratio-view";

export class RatioView extends ItemView {

    constructor(leaf: WorkspaceLeaf) {
        super(leaf);
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

    async render() {


        // extract contentEl - HTML Element where we can put content related to the view
        const { contentEl } = this;
        //clearing the entire contents of the view
        contentEl.empty();
        //All HTML Elements have helper methods for creation.
        contentEl.createEl("h1", { text: "Ratio View" });

        let currentFile = this.app.workspace.getActiveFile();
        console.log(currentFile);
        let isRecipe = false;
        let heading: HeadingCache;
        if (currentFile) {

            const cache = this.app.metadataCache.getFileCache(currentFile);
            cache?.headings?.find(
                (headingCache) => {
                    console.log(headingCache);
                    if (this.isIngredientHeading(headingCache.heading)) {
                        isRecipe = true;
                        heading = headingCache;
                    }
                    console.log(`isRecipe ${isRecipe}`);
                });

            console.log(cache);
            console.log(`isRecipe ${isRecipe}`);
            if (!isRecipe) {
                contentEl.createSpan('No Ingredient List found... :(');
            }
            else {
                let text = await app.vault.cachedRead(currentFile);
                console.log(`This is the text of the file ${text})`);
                let splitAtHeaderRegex = /^#+ [^#]*(?:#(?!#)[^#]*)*/gm;
                console.log(text.match(splitAtHeaderRegex));
                let div = contentEl.createDiv();
                MarkdownRenderer.renderMarkdown(text, div, currentFile.path, this);
            }
        }

        //returns boolean on condition of find for the filter funtion



        //HTMLElement is not aware of state, any logic changes made outside of it
        //need to be reloaded through the render() method.
    }

    isIngredientHeading(heading: string): boolean {
        return heading.contains("Ingredients");
    }
}