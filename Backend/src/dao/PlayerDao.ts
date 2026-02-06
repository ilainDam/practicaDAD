import { PlayerModel } from '../models/Player';

export class PlayerDAO {
    async getTop5BySkill(skill: string) {
        const levelField = `${skill}Level`;
        const xpField = `${skill}XP`;
        return await PlayerModel.aggregate([
            { $sort: { [levelField]: -1 } }, 
            { $limit: 5 }, 
            { 
                $project: { 
                    _id: 0,
                    username: 1, 
                    [levelField]: 1, 
                    [xpField]: 1 
                } 
            }
        ]);
    }
    async getAverageXPBySkill(skill: string) {
        const levelField = `${skill}Level`;
        return await PlayerModel.aggregate([
            { 
                $group: { 
                    _id: null, 
                    averageLevel: { $avg: `$${levelField}` },
                    totalPlayers: { $sum: 1 }
                } 
            },
            {
                $project: {
                    _id: 0,
                    skill: { $literal: skill },
                    averageLevel: 1, 
                    totalPlayers: 1
                }
            }
        ]);
    }
    async getAllPlayers() {
        return await PlayerModel.find({});
    }
    async getPlayerByUUID(uuid: string) {
        return await PlayerModel.findOne({ uuid: uuid });
    }
    async deletePlayerByUUID(uuid: string): Promise<any> {
        return await PlayerModel.deleteOne({ uuid: uuid });
    }
    async updatePlayer(uuid: string, updateData: any) {
        const player = await PlayerModel.findOne({ uuid: uuid });
        if (!player) return null;
        Object.keys(updateData).forEach(key => {
            player.set(key, updateData[key]);
        });
        return await player.save();
    }
}