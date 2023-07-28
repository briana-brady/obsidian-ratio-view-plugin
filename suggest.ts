import { FuzzySuggestModal, Notice, TFile, resolveSubpath } from "obsidian";
import { RATIO_VIEW_TYPE } from "view";

//TFile type from Obsidian APi, file on disk
export class RatioSuggest extends FuzzySuggestModal<TFile> {

    getItems(): TFile[] {
        //returns all files of any type;
        //this.app.vault.getFiles


        const files = this.app.vault.getMarkdownFiles();

        //filter based on contents of file
        const ratioFiles = files.filter((file) => {
            /* vault lets you query disk access
                but when it comes to notes, there's 
                sections, headings, frontmatter,etc. 
                that Obsidian chaches for you so 
                you don't
                need to parse the file yourself
            */
            const cache = this.app.metadataCache.getFileCache(file);
            //returns boolean on condition of find for the filter funtion
            return cache?.headings?.find(
                (headingCache) => this.isIngredientHeading(headingCache.heading));

        });

        return ratioFiles;
    }

    isIngredientHeading(heading : string): boolean {
        return heading === "Ingredients";
    }

    //return the text that I want to match on
    getItemText(item: TFile): string {
        //last part of filepath
        return item.basename;
    }

    //what happens when selected
    onChooseItem(item: TFile, evt: MouseEvent | KeyboardEvent): void {
        //adds to a TFile; .modify completely replaces the content of a note
        this.app.workspace.getLeaf()
        this.app.workspace.setActiveLeaf()
        return;
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
}