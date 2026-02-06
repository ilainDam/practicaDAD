import { Schema, model } from 'mongoose';
import { getLevelFromXP, getXPFromLevel } from "../utils/SkillsCalculator"; 

const playerSchema = new Schema({
    uuid: { type: String, required: true, unique: true },
    username: { type: String, required: true },
    farmingXP: { type: Number, default: 0 },
    farmingLevel: { type: Number, default: 0 },
    miningXP: { type: Number, default: 0 },
    miningLevel: { type: Number, default: 0 },
    combatXP: { type: Number, default: 0 },
    combatLevel: { type: Number, default: 0 },
    foragingXP: { type: Number, default: 0 },
    foragingLevel: { type: Number, default: 0 },    
    fishingXP: { type: Number, default: 0 },
    fishingLevel: { type: Number, default: 0 },
    enchantingXP: { type: Number, default: 0 },
    enchantingLevel: { type: Number, default: 0 },
    alchemyXP: { type: Number, default: 0 },
    alchemyLevel: { type: Number, default: 0 },
    tamingXP: { type: Number, default: 0 },
    tamingLevel: { type: Number, default: 0 },
    carpentryXP: { type: Number, default: 0 },
    carpentryLevel: { type: Number, default: 0 },
    runecraftingXP: { type: Number, default: 0 },
    runecraftingLevel: { type: Number, default: 0 },
    socialXP: { type: Number, default: 0 },
    socialLevel: { type: Number, default: 0 }
}, { 
    collection: 'Hypixel', 
    timestamps: true 
});

const skills = [
    'farming', 'mining', 'combat', 'foraging', 'fishing', 
    'enchanting', 'alchemy', 'taming', 'carpentry', 
    'runecrafting', 'social'
];


//Middleware que se encarga de actualizar de forma dinamica la xp y o el nivel en caso de que cambies uno de los 2 

playerSchema.pre('save', function(this: any, next: any) {
    skills.forEach(skill => {
        const xpField = `${skill}XP`;
        const levelField = `${skill}Level`;

        // Xp Modificado
        if (this.isModified(xpField) && !this.isModified(levelField)) {
            const currentXP = Number(this.get(xpField));
            const calculatedLevel = getLevelFromXP(skill, currentXP);
            this.set(levelField, calculatedLevel);
        } 
        // Nivel modificado
        else if (this.isModified(levelField) && !this.isModified(xpField)) {
            const currentLevel = Number(this.get(levelField));
            const calculatedXP = getXPFromLevel(skill, currentLevel);
            this.set(xpField, calculatedXP);
        }
    });
    
    next();
});

export const PlayerModel = model('Player', playerSchema);