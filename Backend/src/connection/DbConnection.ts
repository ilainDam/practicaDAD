import mongoose from 'mongoose';

export async function connectDB() {
    const url = process.env.MONGO_URI;
    if (!url) {
        console.error("ERROR: La variable MONGO_URI no está definida en el archivo .env");
        process.exit(1); 
    }
    if (mongoose.connection.readyState === 1) return;
    try {
        await mongoose.connect(url);
        console.log("[Database]: Conexión segura establecida");
    } catch (error) {
        console.error("[Database]: Error al conectar a MongoDB:", error);
        process.exit(1);
    }
}