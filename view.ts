import RatioViewPlugin from "main";
import { HeadingCache, ItemView, MarkdownRenderer, MarkdownView, Setting, WorkspaceLeaf, } from "obsidian";
import { RatioText } from "ratio";

export const RATIO_VIEW_TYPE = "ratio-view";
const GRAMS_REGEX = /\d+(?= *grams| *g[^a-zA-Z]*)/;

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
                    if (this.isIngredientHeading(headingCache.heading)) {
                        isRecipe = true;
                        heading = headingCache;
                    }
                });

            console.log(`isRecipe ${isRecipe}`);
            if (!isRecipe) {
                contentEl.createEl('p', { text: 'No Ingredient List found... :(' });
            }
            else {
                let text = await app.vault.cachedRead(currentFile);

                let textSplitByHeaders = this.splitTextByHeaders(text);


                let ingredientText = this.getTextOfIngredients(textSplitByHeaders);

                let ingredientsTextWithRatios = this.getTextWithRatiosOfIngredients(ingredientText);
                navigator.clipboard.writeText(ingredientsTextWithRatios);
                let div = contentEl.createDiv();
                MarkdownRenderer.renderMarkdown(ingredientsTextWithRatios, div, currentFile.path, this);
            }
        }

        //returns boolean on condition of find for the filter funtion



        //HTMLElement is not aware of state, any logic changes made outside of it
        //need to be reloaded through the render() method.
    }

    isIngredientHeading(heading: string): boolean {
        return heading.contains("Ingredients");
    }

    splitTextByHeaders(text: string): RegExpMatchArray {
        let splitAtHeaderRegex = /^#+ [^#]*(?:#(?!#)[^#]*)*/gm;
        return text.match(splitAtHeaderRegex) || [''];
    }

    getFirstLineOf(text: string): string {
        return text.trim().split('\n')[0];
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

    getLevelOfText(text: string) {
        let firstLine = this.getFirstLineOf(text);
        let levelofText = firstLine ? firstLine.split(/\s/)[0].length : 1;

        return levelofText;
    }


    getChunksUnderneathLevel(textChunks: Array<string>, level: number): Array<string> {
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

    getTextUnderneathLevel(textChunks: Array<string>, level: number): string {
        //get chunks while we haven't come across the level yet, excluding the first instance of level
        //keep track of first instance of level, only increase if the current level is less than our desired level

        let textUnderneathLevel = '';
        let chunksUnderneathLevel = this.getChunksUnderneathLevel(textChunks, level);

        chunksUnderneathLevel.forEach((chunk) => {
            textUnderneathLevel += chunk;
        });

        return textUnderneathLevel;
    }

    getTextOfIngredients(textSplitByHeaders: RegExpMatchArray): string {

        let ingredientChunkIndex = this.getIngredientsChunkIndex(textSplitByHeaders);

        let remainingText = textSplitByHeaders.slice(ingredientChunkIndex);


        let ingredientLevel = this.getLevelOfText(textSplitByHeaders[ingredientChunkIndex]);

        return this.getTextUnderneathLevel(remainingText, ingredientLevel);
    }




    getIndividualLines(text: string): Array<string> {
        let newlineRegex = /\r?\n/;
        return text.split(newlineRegex);
    }


    getKnownIngredientInLine(line: string): string {
        let ingredientWeightsKnown = this.plugin.settings.ingredientsToGrams;
        let ingredientsKnown = Object.keys(ingredientWeightsKnown);
        let knownIngredient = ''
        ingredientsKnown.forEach((key) => {
            if (line.contains(key)) {
                knownIngredient =  key;
            }
        })
        return knownIngredient;
    }

    getAmountOfKnownIngredient(line: string, knownIngredient: string): number {

        let specialAmountRegex = new RegExp(/\d+/);
        let specialAmountInString = line.match(specialAmountRegex);
        

        let amountOfKnownIngredient = Number(specialAmountInString);
        return amountOfKnownIngredient;
    }

    calculateWeightOfIngredient(knownIngredient: string, amountOfKnownIngredient: number): number {
        let weightOfKnownIngredient = this.plugin.settings.ingredientsToGrams[knownIngredient];
        if(weightOfKnownIngredient){
            let weight = amountOfKnownIngredient * weightOfKnownIngredient;

            return weight;
        }
        return 0;
    }

    getWeightPerIngredient(line: string): number {
        let knownIngredient: string = this.getKnownIngredientInLine(line);
        if (knownIngredient) {
            let amountOfKnownIngredient: number = this.getAmountOfKnownIngredient(line, knownIngredient);
            let weightPerIngredient: number = this.calculateWeightOfIngredient(knownIngredient, amountOfKnownIngredient);
            return weightPerIngredient;
        }

        return 0;
    }




    getGramAmountOfLine(line: string): number {
        let cleanedLine = line.replace(/[^a-zA-Z0-9 ]/g, '');
        let firstGramAmountInString = cleanedLine.match(GRAMS_REGEX);
        let gramAmount = Number(firstGramAmountInString);
        if (!gramAmount) {
            let gramsOfSpecialIngredient = this.getWeightPerIngredient(line);
            gramAmount = gramsOfSpecialIngredient;
        }
        return gramAmount || 0;

    }


    isBaseIngredient(ingredient: string): boolean {
        var identifier = this.plugin.settings.baseAmountIdentifier;
        let baseAmountRegex = new RegExp(identifier, "g");
        let isBase = baseAmountRegex.test(ingredient);
        return isBase;
    }

    getBaseAmountForIngredients(ingredients: Array<string>): number {
        let baseAmount = 0;
        ingredients.forEach((ingredient) => {
            let gramAmount = this.getGramAmountOfLine(ingredient);
            if (gramAmount && this.isBaseIngredient(ingredient)) {
                baseAmount = gramAmount;
            }
        });
        return baseAmount;
    }

    roundToPlace(amount: number, place: number): number {
        return Number(amount.toFixed(place));
    }

    getRatioAmountOfLine(line: string, baseAmountInGrams: number): number {
        let gramAmountOfLine = this.getGramAmountOfLine(line);
        if (gramAmountOfLine && baseAmountInGrams) {
            let ratioAmount = (gramAmountOfLine / baseAmountInGrams) * 100;
            let roundToXxPlace = this.plugin.settings.roundToPlace;
            return this.roundToPlace(ratioAmount, roundToXxPlace);
        }

        return 0;
    }

    formatTextWithRatio(ratioAmount: number) {
        let ratioText = '';
        if (ratioAmount) {
            ratioText = ratioText.concat(' ', ratioAmount.toString(), '%');
        }
        return ratioText;
    }

    getTextWithRatiosOfIngredients(ingredientText: string): string {
        let individualLines = this.getIndividualLines(ingredientText);
        let baseAmount = this.getBaseAmountForIngredients(individualLines);

        let textWithRatios = individualLines.map((line) => {
            let ratioAmount = this.getRatioAmountOfLine(line, baseAmount);
            let ratioText = this.formatTextWithRatio(ratioAmount);
            return line.concat(ratioText);
        }).join('\n');

        return textWithRatios;
    }



}