import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ALL_SKILLS = [
  'farming', 'mining', 'combat', 'foraging', 'fishing',
  'enchanting', 'alchemy', 'taming', 'carpentry',
  'runecrafting', 'social'
];

const API_URL = "http://localhost:3000";

export default function CrudMenu() {
  const navigate = useNavigate();

  const [results, setResults] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<string>("");
  
  const [selectedSkill, setSelectedSkill] = useState("combat");
  const [uuidInput, setUuidInput] = useState("");
  
  const [updateSkill, setUpdateSkill] = useState("combat");
  const [updateAmount, setUpdateAmount] = useState(0);

  // 1. Listar TODOS
  const listAll = async () => {
    try {
      const res = await axios.get(`${API_URL}/players`);
      setResults(res.data);
      setViewMode("Listado Completo de Jugadores");
    } catch (e) { alert("Error al listar"); }
  };

  // 2. Leer UNO (Buscar)
  const getOne = async () => {
    if (!uuidInput) return alert("Escribe un UUID");
    try {
      const res = await axios.get(`${API_URL}/player/${uuidInput}`);
      setResults([res.data]);
      setViewMode("Resultado de Búsqueda");
    } catch (e) { alert("Jugador no encontrado"); }
  };

  // 3. Top 5
  const getTop5 = async () => {
    try {
      const res = await axios.get(`${API_URL}/stats/top/${selectedSkill}`);
      setResults(res.data);
      setViewMode(`Top 5 Mejores en ${selectedSkill.toUpperCase()}`);
    } catch (e) { alert("Error al obtener Top 5"); }
  };

  // 4. Media (SOLUCIÓN AL CRASH AQUÍ)
  const getAvg = async () => {
    try {
      const res = await axios.get(`${API_URL}/stats/avg/${selectedSkill}`);
      
      // SOLUCIÓN: El backend devuelve un Array [{}]. Sacamos el primer elemento.
      const data = res.data[0] || { averageLevel: 0, totalPlayers: 0 };
      
      // Forzamos que tenga el campo 'skill' para que no falle el .toUpperCase()
      setResults([{ ...data, isAverage: true, skill: selectedSkill }]); 
      
      setViewMode(`Media del Servidor en ${selectedSkill.toUpperCase()}`);
    } catch (e) { 
        console.error(e);
        alert("Error al calcular media"); 
    }
  };

  // 5. Borrar
  const deletePlayer = async () => {
    if (!uuidInput) return alert("Escribe un UUID");
    if (!confirm("¿SEGURO?")) return;
    try {
      await axios.delete(`${API_URL}/player/${uuidInput}`);
      alert("🗑️ Eliminado");
      setResults([]); 
    } catch (e) { alert("Error al borrar"); }
  };

  // 6. Update
  const updatePlayer = async () => {
    if (!uuidInput) return alert("UUID necesario");
    const fieldName = `${updateSkill}XP`;
    const body = { [fieldName]: Number(updateAmount) };

    try {
      await axios.patch(`${API_URL}/player/${uuidInput}`, body);
      alert(`✅ Actualizado! Recargando...`);
      getOne();
    } catch (e) { alert("Error al actualizar"); }
  };

  return (
    <div className="crud-container">
      <button className="btn-back" onClick={() => navigate('/')}>⬅️ Volver</button>

      <div className="control-panel">
        {/* PANEL IZQUIERDO: STATS */}
        <div className="panel-section">
          <h3>📊 Estadísticas</h3>
          <div className="input-group">
            <label>Skill:</label>
            <select value={selectedSkill} onChange={(e) => setSelectedSkill(e.target.value)}>
              {ALL_SKILLS.map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
            </select>
          </div>
          <div className="btn-row">
            <button onClick={getTop5}>🏆 Top 5</button>
            <button onClick={getAvg}>📈 Media (Nivel)</button>
          </div>
        </div>

        {/* PANEL CENTRAL: GESTIÓN */}
        <div className="panel-section">
          <h3>👤 Gestión por UUID</h3>
          <input 
            type="text" 
            placeholder="UUID..." 
            value={uuidInput}
            onChange={(e) => setUuidInput(e.target.value)}
            className="uuid-input"
          />
          <div className="btn-row">
            <button onClick={getOne}>🔍 Buscar</button>
            <button className="btn-danger" onClick={deletePlayer}>🗑️ Borrar</button>
          </div>
          <hr />
          <h4>🛠️ Modificar XP</h4>
          <div className="update-form">
            <select value={updateSkill} onChange={(e) => setUpdateSkill(e.target.value)}>
              {ALL_SKILLS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <input 
              type="number" 
              placeholder="Nueva XP"
              value={updateAmount}
              onChange={(e) => setUpdateAmount(Number(e.target.value))}
            />
            <button className="btn-update" onClick={updatePlayer}>💾 Guardar</button>
          </div>
        </div>

        {/* PANEL DERECHO: GLOBAL */}
        <div className="panel-section">
          <h3>📂 Todo</h3>
          <button className="btn-block" onClick={listAll}>📜 LISTAR TODOS</button>
        </div>
      </div>

      {/* RESULTADOS */}
      <div className="results-area">
        <h2>{viewMode}</h2>
        <div className="cards-grid">
          {results.map((item, index) => {
            
            // --- VISTA DE MEDIA (NUEVA LÓGICA) ---
            if (item.isAverage) {
              return (
                <div key={index} className="result-card avg-card">
                  <h3>Promedio de {item.skill ? item.skill.toUpperCase() : "SKILL"}</h3>
                  <p className="big-number">Nivel {item.averageLevel ? item.averageLevel.toFixed(2) : "0"}</p>
                  <small>Calculado sobre {item.totalPlayers} jugadores</small>
                </div>
              );
            }

            // --- VISTA DE JUGADOR ---
            return (
              <div key={index} className="result-card">
                <div className="card-header">
                  <strong>{item.username || "Usuario"}</strong><br/>
                  <small className="uuid-text">{item.uuid}</small>
                </div>
                <div className="card-body">
                  {/* SI ES TOP 5 */}
                  {viewMode.includes("Top 5") ? (
                    <div className="highlight-stat">
                      <span>{selectedSkill.toUpperCase()}:</span><br/>
                      <strong>Nivel {item[`${selectedSkill}Level`]}</strong>
                    </div>
                  ) : (
                    /* SI ES LISTAR TODOS O BUSCAR */
                    <div className="all-stats-grid">
                      {ALL_SKILLS.map(skill => (
                        <div key={skill} className="stat-row">
                          <span className="stat-name">{skill}:</span>
                          <span className="stat-val">Lvl <b>{item[`${skill}Level`] || 0}</b></span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}