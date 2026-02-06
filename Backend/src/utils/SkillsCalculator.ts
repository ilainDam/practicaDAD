import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';

export let skillsData: Record<string, any[]> = {};
const resourcesPath = path.resolve('src/resources/skillsTable.json');
export async function initSkillCalculator() {
    try {
        const localData = await fs.readFile(resourcesPath, 'utf-8').catch(() => null);
        if (localData) {
            skillsData = JSON.parse(localData);
            console.log("Tablas de skills cargadas desde recursos locales.");
            return;
        }
        console.log("Descargando todas las tablas de skills desde Hypixel API...");
        const response = await axios.get("https://api.hypixel.net/v2/resources/skyblock/skills");
        const apiSkills = response.data.skills;

        for (const skillName in apiSkills) {
            skillsData[skillName.toLowerCase()] = apiSkills[skillName].levels;
        }
        await fs.mkdir(path.dirname(resourcesPath), { recursive: true });
        await fs.writeFile(resourcesPath, JSON.stringify(skillsData, null, 2));
        
        console.log("Todas las tablas de skills guardadas en src/resources/skillsTable.json");
    } catch (error) {
        console.error("Error al inicializar el calculador de skills:", error);
    }
}

export const getLevelFromXP = (skillName: string, xp: number): number => {
    const levels = skillsData[skillName.toLowerCase()];
    if (!levels) return 0;
    
    let currentLevel = 0;
    for (const entry of levels) {
        if (xp >= entry.totalExpRequired) {
            currentLevel = entry.level;
        } else {
            break;
        }
    }
    return currentLevel;
};

export const getXPFromLevel = (skillName: string, level: number): number => {
    const levels = skillsData[skillName.toLowerCase()];
    if (!levels) return 0;
    
    const entry = levels.find(e => e.level === level);
    return entry ? entry.totalExpRequired : 0;
};