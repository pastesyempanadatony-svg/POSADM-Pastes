// ============================================
// Página de prueba de Firebase
// Acceder en: /test-firebase
// ============================================

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { seedDatabase, testFirebaseConnection } from "../lib/seedDatabase";
import { isFirebaseConfigured } from "../lib/firebase";
import { Button } from "../components/ui/button";
import {
    CheckCircle,
    XCircle,
    Database,
    RefreshCw,
    ArrowLeft,
    AlertTriangle
} from "lucide-react";

export function FirebaseTestPage() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState<{
        tested: boolean;
        connected: boolean;
        configured: boolean;
        collections: Record<string, number>;
    } | null>(null);
    const [seedResult, setSeedResult] = useState<{
        success: boolean;
        message: string;
        details: string[];
    } | null>(null);

    const handleTestConnection = async () => {
        setIsLoading(true);
        try {
            const result = await testFirebaseConnection();
            setConnectionStatus({ ...result, tested: true });
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSeedDatabase = async () => {
        setIsLoading(true);
        try {
            const result = await seedDatabase();
            setSeedResult(result);
            // Refresh connection status
            await handleTestConnection();
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const isConfigured = isFirebaseConfigured();

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-8">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Button
                        onClick={() => navigate("/pos")}
                        variant="ghost"
                        className="text-white hover:bg-white/10"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Volver al POS
                    </Button>
                </div>

                <h1 className="text-3xl font-bold mb-2">🔥 Test de Firebase</h1>
                <p className="text-gray-400 mb-8">
                    Verifica la conexión y pobla la base de datos con datos iniciales
                </p>

                {/* Status Card */}
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <Database className="w-5 h-5" />
                        Estado de la Configuración
                    </h2>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between py-2 border-b border-white/10">
                            <span>Credenciales configuradas</span>
                            {isConfigured ? (
                                <span className="flex items-center gap-2 text-green-400">
                                    <CheckCircle className="w-5 h-5" />
                                    Sí
                                </span>
                            ) : (
                                <span className="flex items-center gap-2 text-red-400">
                                    <XCircle className="w-5 h-5" />
                                    No (usando datos mock)
                                </span>
                            )}
                        </div>

                        {connectionStatus?.tested && (
                            <div className="flex items-center justify-between py-2 border-b border-white/10">
                                <span>Conexión a Firestore</span>
                                {connectionStatus.connected ? (
                                    <span className="flex items-center gap-2 text-green-400">
                                        <CheckCircle className="w-5 h-5" />
                                        Conectado
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2 text-red-400">
                                        <XCircle className="w-5 h-5" />
                                        Error
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <Button
                        onClick={handleTestConnection}
                        disabled={isLoading}
                        className="h-14 bg-blue-600 hover:bg-blue-700 rounded-xl"
                    >
                        {isLoading ? (
                            <RefreshCw className="w-5 h-5 animate-spin mr-2" />
                        ) : (
                            <Database className="w-5 h-5 mr-2" />
                        )}
                        Probar Conexión
                    </Button>

                    <Button
                        onClick={handleSeedDatabase}
                        disabled={isLoading || !isConfigured}
                        className="h-14 bg-green-600 hover:bg-green-700 rounded-xl disabled:opacity-50"
                    >
                        {isLoading ? (
                            <RefreshCw className="w-5 h-5 animate-spin mr-2" />
                        ) : (
                            <Database className="w-5 h-5 mr-2" />
                        )}
                        Poblar Base de Datos
                    </Button>
                </div>

                {/* Collections Status */}
                {connectionStatus?.tested && connectionStatus.connected && (
                    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 mb-6">
                        <h2 className="text-xl font-semibold mb-4">📊 Colecciones</h2>
                        <div className="grid grid-cols-2 gap-3">
                            {Object.entries(connectionStatus.collections).map(([name, count]) => (
                                <div
                                    key={name}
                                    className="bg-white/5 rounded-xl p-4 flex items-center justify-between"
                                >
                                    <span className="text-gray-300">{name}</span>
                                    <span className="text-2xl font-bold">{count}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Seed Result */}
                {seedResult && (
                    <div className={`rounded-2xl p-6 mb-6 ${seedResult.success ? "bg-green-900/50" : "bg-red-900/50"
                        }`}>
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            {seedResult.success ? (
                                <CheckCircle className="w-5 h-5 text-green-400" />
                            ) : (
                                <XCircle className="w-5 h-5 text-red-400" />
                            )}
                            {seedResult.message}
                        </h2>
                        <ul className="space-y-1 text-sm text-gray-300">
                            {seedResult.details.map((detail, index) => (
                                <li key={index}>{detail}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Instructions */}
                {!isConfigured && (
                    <div className="bg-yellow-900/50 rounded-2xl p-6">
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-yellow-400" />
                            Instrucciones
                        </h2>
                        <ol className="list-decimal list-inside space-y-2 text-gray-300">
                            <li>Crea un proyecto en Firebase Console</li>
                            <li>Activa Firestore Database</li>
                            <li>Registra una Web App</li>
                            <li>Copia las credenciales a <code className="bg-black/30 px-2 py-1 rounded">.env.local</code></li>
                            <li>Reinicia el servidor de desarrollo</li>
                            <li>Vuelve a esta página y presiona "Poblar Base de Datos"</li>
                        </ol>
                    </div>
                )}

                {/* Test Login */}
                {connectionStatus?.connected && connectionStatus.collections.employees > 0 && (
                    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 mt-6">
                        <h2 className="text-xl font-semibold mb-4">🔐 Probar Login</h2>
                        <p className="text-gray-400 mb-4">
                            Usa estos PINs para probar el login en el POS:
                        </p>
                        <div className="grid grid-cols-3 gap-3">
                            {[
                                { pin: "123456", name: "Edith" },
                                { pin: "567890", name: "Daniel" },
                                { pin: "999999", name: "Admin" },
                            ].map((emp) => (
                                <div
                                    key={emp.pin}
                                    className="bg-white/5 rounded-xl p-3 text-center"
                                >
                                    <p className="text-2xl font-mono font-bold text-green-400">
                                        {emp.pin}
                                    </p>
                                    <p className="text-sm text-gray-400">{emp.name}</p>
                                </div>
                            ))}
                        </div>
                        <Button
                            onClick={() => navigate("/pos")}
                            className="w-full mt-4 h-12 bg-red-600 hover:bg-red-700 rounded-xl"
                        >
                            Ir al POS →
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
