import { FuzzySuggestModal, Notice, TFile } from "obsidian";

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
            //returns boolean on condition of find
            return cache?.headings?.find(
                (headingCache) => headingCache.heading === "Ingredients");

        });

        return ratioFiles;
    }

    //return the text that I want to match on
    getItemText(item: TFile): string {
        //last part of filepath
        return item.basename;
    }

    //what happens when selected
    onChooseItem(item: TFile, evt: MouseEvent | KeyboardEvent): void {
        //adds to a TFile; .modify completely replaces the content of a note
        this.app.vault.append(item, "\n #recipe");
        return;
    }

}