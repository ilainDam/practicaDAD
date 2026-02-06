import * as Types from "../Types.js";
import fs from "fs/promises";
import path from "path";
import axios from "axios";
import { PlayerModel } from "../models/Player.js";
import { getLevelFromXP } from "./SkillsCalculator.js";

export async function getPlayers(ApiKey: string): Promise<any[]> {
    let cleanPlayerList: any[] = [];
    const skillsList = [
        'farming', 'mining', 'combat', 'foraging', 'fishing',
        'enchanting', 'alchemy', 'taming', 'carpentry',
        'runecrafting', 'social'
    ];

    try {
        console.log("Iniciando escaneo de subastas...");
        let auctionList = await (await axios.get<Types.AuctionAnswer>("https://api.hypixel.net/v2/skyblock/auctions")).data;
        let auctions = auctionList.auctions;

        for (const auction of auctions) {
            if (cleanPlayerList.length >= 100) break;

            let userUUID = auction.auctioneer;
            if (cleanPlayerList.find((p) => p.uuid == userUUID)) continue;

            try {
                let uuidToName = await axios.get(`https://api.ashcon.app/mojang/v2/user/${userUUID}`);
                let userName = uuidToName.data.username;

                let profileData = (await axios.get<Types.Profiles>(
                    `https://api.hypixel.net/v2/skyblock/profiles?uuid=${userUUID}`,
                    { headers: { "API-Key": ApiKey } }
                )).data;

                if (profileData.profiles && profileData.profiles.length > 0) {
                    let member = profileData.profiles[0].members[userUUID];
                    if (member?.player_data?.experience) {
                        const exp = member.player_data.experience;

                        let newPlayer: any = {
                            uuid: userUUID,
                            username: userName,
                        };

                        skillsList.forEach(skill => {
                            const apiSkillName = `SKILL_${skill.toUpperCase()}`;
                            const xpValue = exp[apiSkillName as keyof typeof exp] || 0;
                            const levelValue = getLevelFromXP(skill, xpValue);
                            newPlayer[`${skill}XP`] = xpValue;
                            newPlayer[`${skill}Level`] = levelValue;
                        });

                        cleanPlayerList.push(newPlayer);
                        console.log(`[${cleanPlayerList.length}/100] ${userName} añadido.`);
                    }
                }
                await new Promise(resolve => setTimeout(resolve, 100));
            } catch (error) { continue; }
        }
    } catch (error) { console.error(error); }
    return cleanPlayerList;
}

export async function setDatabase(players: any[]) {
    if (players.length === 0) {
        console.log("No hay jugadores para guardar.");
        return;
    }
    try {
        const resourcesPath = path.resolve("src/resources/playerInfo.json");
        await fs.mkdir(path.dirname(resourcesPath), { recursive: true });
        await fs.writeFile(resourcesPath, JSON.stringify(players, null, 2));
        console.log("✅ JSON creado localmente.");
        console.log("Iniciando volcado a MongoDB...");
        await PlayerModel.deleteMany({}); 
        console.log("   > Colección antigua limpiada.");
        await PlayerModel.insertMany(players);
        console.log("✅ Datos cargados con éxito en MongoDB Atlas.");

    } catch (error: any) {
        console.error("❌ ERROR CRÍTICO EN DATABASE:");
        console.error("Mensaje:", error.message);

    }
}