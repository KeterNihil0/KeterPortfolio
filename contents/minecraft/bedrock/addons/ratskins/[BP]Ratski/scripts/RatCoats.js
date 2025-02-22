export default class CoatNames {
    static getColours(coatLayer, coatData){
        if (coatLayer==0) { return "Base Coat: " + colours[coatData]; };
        if (coatLayer==1) { return "Top Coat: " + coats[coatData]; };
        if (coatLayer==2) { return colLookUp[coatData]}
    } 
}

const colours = [ 
    "White",
    "Grey",
    "Black",
    "Brown",
    "Red",
    "Blue",
    "Orange",
    "???"
]

const coats = [ 
    "None",
    "Agouti",
    "Capped",
    "Banded",
    "Near Full"
]

const colLookUp = [
    "#ffffff", //White
    "#a7a7a7", //Grey
    "#333333", //Black
    "#913c2c", //Brown
    "#c3654b", //Red
    "#94d0da", //Blue
    "#ff00c7", //Neon
    "#00ff00", //Neon
    "#b4d455" //Kerbal
]