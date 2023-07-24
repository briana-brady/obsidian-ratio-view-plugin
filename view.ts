import { ItemView, Setting } from "obsidian";

export const RATIO_VIEW_TYPE = "ratio-view";

export class RatioView extends ItemView {
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

    async render(){
         // extract contentEl - HTML Element where we can put content related to the view
         const { contentEl } = this;
         //clearing the entire contents of the view
        contentEl.empty();
         //All HTML Elements have helper methods for creation.
         contentEl.createEl("h1", { text: "Ratio View" });
         new Setting(contentEl).setName("Let's calculate").addButton(item => {
             item.setButtonText("Calculate").onClick(() => {
                item.setButtonText("Calculating");
             });
             
         })
         //HTMLElement is not aware of state, any logic changes made outside of it
         //need to be reloaded through the render() method.
    }
}