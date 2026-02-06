import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function MainMenu() {
  const navigate = useNavigate();
  const API_URL = "http://localhost:3000";

  const handleReset = async () => {
    if (confirm("¿Estás seguro de que quieres borrar la DB y descargar todo de nuevo?")) {
      try {
        alert("Iniciando recarga... espera confirmación.");
        await axios.post(`${API_URL}/admin/reload`);
        alert("✅ Base de datos reiniciada con éxito.");
      } catch (error) {
        alert("❌ Error al conectar con el servidor.");
      }
    }
  };

  return (
    <div className="menu-card">
      <h2>Panel de Control Principal</h2>
      <div className="button-stack">
        <button className="btn-nav" onClick={() => navigate('/crud')}>
          📂 Ir a Gestión de Jugadores (CRUD)
        </button>
        <button className="btn-danger" onClick={handleReset}>
          🔄 Reiniciar Base de Datos
        </button>
      </div>
    </div>
  );
}