
import RatioViewPlugin from "main";

const GRAMS_REGEX = /\d+(?= *grams| *g[^a-zA-Z]*)/;

export class Ingredients {
  
    plugin: RatioViewPlugin;
    ingredientText: string;
    ingredientTextWithRatios: string;

    constructor(plugin: RatioViewPlugin, ingredientText: string){
        this.plugin = plugin;
        this.ingredientText = ingredientText;
        this.ingredientTextWithRatios = this.getTextWithRatiosOfIngredients(ingredientText);
    }

    getTextWithRatios(): string {
        return this.ingredientTextWithRatios;
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


    getIndividualLines(text: string): Array<string> {
        let newlineRegex = /\r?\n/;
        return text.split(newlineRegex);
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

    
    getWeightPerIngredient(line: string): number {
        let knownIngredient: string = this.getKnownIngredientInLine(line);
        if (knownIngredient) {
            let amountOfKnownIngredient: number = this.getAmountOfKnownIngredient(line, knownIngredient);
            let weightPerIngredient: number = this.calculateWeightOfIngredient(knownIngredient, amountOfKnownIngredient);
            return weightPerIngredient;
        }

        return 0;
    }

    
    getKnownIngredientInLine(line: string): string {
        let ingredientWeightsKnown = this.plugin.settings.ingredientsToGrams;
        let ingredientsKnown = Object.keys(ingredientWeightsKnown);
        let knownIngredient = ''
        ingredientsKnown.forEach((key) => {
            if (line.contains(key)) {
                knownIngredient = key;
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
        if (weightOfKnownIngredient) {
            let weight = amountOfKnownIngredient * weightOfKnownIngredient;

            return weight;
        }
        return 0;
    }




    isBaseIngredient(ingredient: string): boolean {
        var identifier = this.plugin.settings.baseAmountIdentifier;
        let baseAmountRegex = new RegExp(identifier, "g");
        let isBase = baseAmountRegex.test(ingredient);
        return isBase;
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


    roundToPlace(amount: number, place: number): number {
        return Number(amount.toFixed(place));
    }

    formatTextWithRatio(ratioAmount: number) {
        let ratioText = '';
        if (ratioAmount) {
            ratioText = ratioText.concat(' ', ratioAmount.toString(), '%');
        }
        return ratioText;
    }


}