import RatioViewPlugin from "main";
import {TFile, App } from "obsidian";
import { Ingredients } from "ingredients";

export class RatioFile {
    file: TFile;
    app: App;
    plugin: RatioViewPlugin;

    constructor(app: App, plugin: RatioViewPlugin, file: TFile) {
        this.app = app;
        this.file = file;
        this.plugin = plugin;
    }

    hasIngredientHeadingInFile(): boolean {
        const cache = this.app.metadataCache.getFileCache(this.file);
        return cache?.headings?.find(
            (headingCache) => {
                return this.isIngredientHeading(headingCache.heading)
            }) ? true : false;
    }

    isIngredientHeading(heading: string): boolean {
        return heading.contains("Ingredients");
    }

    async getRatioText(): Promise<string> {
        let text = await app.vault.cachedRead(this.file);
        let textSplitByHeaders = this.splitTextByHeaders(text);
        // TODO new Ingredients(textSplitByHeaders);
        // return Ingredients.getTextWithRatios();

        let ingredientText = this.getTextOfIngredients(textSplitByHeaders);
        let ingredients = new Ingredients(this.plugin, ingredientText);
        return ingredients.getTextWithRatios();
    }

    splitTextByHeaders(text: string): RegExpMatchArray {
        let splitAtHeaderRegex = /^#+ [^#]*(?:#(?!#)[^#]*)*/gm;
        return text.match(splitAtHeaderRegex) || [''];
    }

    getTextOfIngredients(textSplitByHeaders: RegExpMatchArray): string {

        let ingredientChunkIndex = this.getIngredientsChunkIndex(textSplitByHeaders);

        let remainingText = textSplitByHeaders.slice(ingredientChunkIndex);


        let ingredientLevel = this.getLevelOfText(textSplitByHeaders[ingredientChunkIndex]);

        return this.getTextUnderneathLevel(remainingText, ingredientLevel);
    }

    getIngredientsChunkIndex(textChunks: RegExpMatchArray): number {
        for (let index = 0; index < textChunks.length; index++) {
            let chunk = textChunks[index];
            let firstLine = this.getFirstLineOf(chunk);
            if (this.isIngredientHeading(firstLine)) {
                return index;
            }
        }
        return -Infinity;
    }


    getFirstLineOf(text: string): string {
        return text.trim().split('\n')[0];
    }


    getLevelOfText(text: string) {
        let firstLine = this.getFirstLineOf(text);
        let levelofText = firstLine ? firstLine.split(/\s/)[0].length : 1;

        return levelofText;
    }

    getTextUnderneathLevel(textChunks: Array<string>, level: number): string {
        let textUnderneathLevel = '';
        let chunksUnderneathLevel = this.getChunksUnderneathLevel(textChunks, level);

        chunksUnderneathLevel.forEach((chunk) => {
            textUnderneathLevel += chunk;
        });

        return textUnderneathLevel;
    }

    getChunksUnderneathLevel(textChunks: Array<string>, level: number): Array<string> {
        //get chunks while we haven't come across the level yet, excluding the first instance of level
        //keep track of first instance of level, only increase if the current level is less than our desired level
        let chunksUnderneathLevel = [];
        let counter = 0;
        for (let index = 0; index < textChunks.length; index++) {

            let chunk = textChunks[index];
            let levelOfChunk = this.getLevelOfText(chunk);
            if (levelOfChunk > level) {
                chunksUnderneathLevel.push(chunk);
            } else if (levelOfChunk == level && counter < 1) {
                chunksUnderneathLevel.push(chunk);
                counter++;
            } else {
                counter++;
            }
        }
        return chunksUnderneathLevel;
    }

  
  

}