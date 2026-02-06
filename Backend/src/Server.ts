import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { connectDB } from './connection/DbConnection';
import { initSkillCalculator } from './utils/SkillsCalculator';
import { getPlayers, setDatabase } from './utils/DatabaseFiller';
import { PlayerDAO } from './dao/PlayerDao';

const app = express();
const port = 3000;
const apiKey = process.env.APIKEY;

app.use(express.json());
app.use(cors());

const dao = new PlayerDAO();

async function startServer() {
    try {
        console.log("--- INICIANDO SERVICIOS DEL SISTEMA ---");
        await connectDB();
        await initSkillCalculator();
        app.post('/admin/reload', async (req, res) => {
            if (!apiKey) return res.status(500).json({ error: "APIKEY no configurada en .env" });
            
            try {
                const players = await getPlayers(apiKey);
                await setDatabase(players);
                res.json({ message: "Base de datos actualizada", count: players.length });
            } catch (error) {
                res.status(500).json({ error: "Error durante la recarga de datos" });
            }
        });
        app.get('/players', async (req, res) => {
            const players = await dao.getAllPlayers();
            res.json(players);
        });

        app.get('/player/:uuid', async (req, res) => {
            const player = await dao.getPlayerByUUID(req.params.uuid);
            player ? res.json(player) : res.status(404).json({ error: "Jugador no encontrado" });
        });

        app.delete('/player/:uuid', async (req, res) => {
            try {
                await dao.deletePlayerByUUID(req.params.uuid);
                res.json({ message: "Jugador eliminado con éxito" });
            } catch (error) {
                res.status(500).json({ error: "Error al eliminar el jugador" });
            }
        });
        app.patch('/player/:uuid', async (req, res) => {
            try {
                const updated = await dao.updatePlayer(req.params.uuid, req.body);
                updated ? res.json(updated) : res.status(404).json({ error: "Jugador no encontrado" });
            } catch (error) {
                res.status(500).json({ error: "Error al actualizar (XP/Nivel)" });
            }
        });
        app.get('/stats/top/:skill', async (req, res) => {
            try {
                const top = await dao.getTop5BySkill(req.params.skill);
                res.json(top);
            } catch (error) {
                res.status(400).json({ error: "Error en la consulta de Top 5" });
            }
        });
        app.get('/stats/avg/:skill', async (req, res) => {
            try {
                const avg = await dao.getAverageXPBySkill(req.params.skill);
                res.json(avg);
            } catch (error) {
                res.status(400).json({ error: "Error en la consulta de medias" });
            }
        });
        app.listen(port, () => {
            console.log(`Servidor Express corriendo en: http://localhost:${port}`);
            console.log(`Listo para recibir peticiones del Frontend`);
        });

    } catch (error) {
        console.error("Fallo crítico al iniciar el servidor:", error);
        process.exit(1);
    }
}

startServer();