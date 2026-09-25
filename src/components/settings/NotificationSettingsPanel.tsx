'use client';

import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Send, 
  Webhook, 
  Mail, 
  Flame, 
  CheckCircle2, 
  AlertTriangle, 
  Loader2, 
  ExternalLink, 
  HelpCircle,
  Smartphone,
  Save,
  Radio
} from 'lucide-react';

interface NotificationConfig {
  webhookUrl: string;
  telegramBotToken: string;
  telegramChatId: string;
  notificationEmail: string;
  hotScoreThreshold: number;
  telegramEnabled: boolean;
  webhookEnabled: boolean;
  emailEnabled: boolean;
}

interface NotificationSettingsPanelProps {
  agencyName?: string;
}

export function NotificationSettingsPanel({ agencyName = "Inmobia 360" }: NotificationSettingsPanelProps) {
  const [config, setConfig] = useState<NotificationConfig>({
    webhookUrl: '',
    telegramBotToken: '',
    telegramChatId: '',
    notificationEmail: '',
    hotScoreThreshold: 80,
    telegramEnabled: false,
    webhookEnabled: false,
    emailEnabled: false
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ ok: boolean; message: string } | null>(null);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string; details?: any } | null>(null);
  const [showTelegramHelp, setShowTelegramHelp] = useState(false);

  useEffect(() => {
    async function loadConfig() {
      try {
        const res = await fetch('/api/settings/notifications');
        const json = await res.json();
        if (json.ok && json.data) {
          setConfig({
            webhookUrl: json.data.webhookUrl || '',
            telegramBotToken: json.data.telegramBotToken || '',
            telegramChatId: json.data.telegramChatId || '',
            notificationEmail: json.data.notificationEmail || '',
            hotScoreThreshold: json.data.hotScoreThreshold ?? 80,
            telegramEnabled: Boolean(json.data.telegramEnabled),
            webhookEnabled: Boolean(json.data.webhookEnabled),
            emailEnabled: Boolean(json.data.emailEnabled)
          });
        }
      } catch (err) {
        console.warn('Error al cargar configuración de notificaciones:', err);
      } finally {
        setLoading(false);
      }
    }
    loadConfig();
  }, []);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    setSaveStatus(null);
    try {
      const res = await fetch('/api/settings/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      const data = await res.json();
      if (data.ok) {
        setSaveStatus({ ok: true, message: '¡Configuración de notificaciones guardada con éxito!' });
      } else {
        setSaveStatus({ ok: false, message: data.error || 'Error al guardar la configuración.' });
      }
    } catch (err: any) {
      setSaveStatus({ ok: false, message: err.message || 'Error de conexión al servidor.' });
    } finally {
      setSaving(false);
      setTimeout(() => setSaveStatus(null), 5000);
    }
  };

  const handleSendTestAlert = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/notifications/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...config,
          agencyName
        })
      });
      const data = await res.json();
      setTestResult({
        ok: data.ok,
        message: data.message || (data.ok ? 'Alerta enviada correctamente' : 'Fallo al despachar alerta'),
        details: data.results
      });
    } catch (err: any) {
      setTestResult({
        ok: false,
        message: err.message || 'Error de conexión al emitir prueba.'
      });
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600 mr-2" />
        <span className="text-slate-500 font-medium text-sm">Cargando canales de alerta...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-xs space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">Alertas Inmediatas de Leads Calientes</h2>
              <span className="px-2.5 py-0.5 text-xs font-semibold bg-red-100 text-red-700 rounded-full flex items-center gap-1">
                <Radio className="w-3 h-3 animate-pulse" /> Tiempo Real
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Despacha avisos directos a tu móvil (Telegram/Webhook) con botón de 1-toque WhatsApp cuando el Lead supere el {config.hotScoreThreshold}% de temperatura.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSendTestAlert}
            disabled={testing}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-xs transition-all disabled:opacity-50 cursor-pointer"
          >
            {testing ? <Loader2 className="w-4 h-4 animate-spin text-slate-500" /> : <Send className="w-4 h-4 text-blue-600" />}
            Probar Alerta Ahora
          </button>
          <button
            type="button"
            onClick={() => handleSave()}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-all shadow-xs disabled:opacity-50 cursor-pointer"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Guardar Cambios
          </button>
        </div>
      </div>

      {/* Feedback Messages */}
      {saveStatus && (
        <div className={`p-4 rounded-2xl text-xs font-semibold flex items-center gap-2.5 animate-in fade-in ${
          saveStatus.ok ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {saveStatus.ok ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
          <span>{saveStatus.message}</span>
        </div>
      )}

      {testResult && (
        <div className={`p-4 rounded-2xl text-xs flex flex-col gap-2 animate-in fade-in ${
          testResult.ok ? 'bg-blue-50 text-blue-900 border border-blue-200' : 'bg-amber-50 text-amber-900 border border-amber-200'
        }`}>
          <div className="flex items-center gap-2 font-bold">
            {testResult.ok ? <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" /> : <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />}
            <span>{testResult.message}</span>
          </div>
          {testResult.details && (
            <div className="bg-white/80 p-3 rounded-xl font-mono text-[11px] text-slate-600 border border-slate-200/60 overflow-x-auto">
              <pre>{JSON.stringify(testResult.details, null, 2)}</pre>
            </div>
          )}
        </div>
      )}

      {/* Threshold Setting */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-orange-50/60 to-red-50/60 border border-orange-200/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-600" />
              <h3 className="text-sm font-bold text-slate-900">Umbral de Temperatura Cognitiva (Hot Score)</h3>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Las alertas inmediatas solo se dispararán cuando el score calculado por la IA sea igual o superior a este valor.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <input 
              type="range" 
              min="50" 
              max="95" 
              step="5"
              value={config.hotScoreThreshold}
              onChange={(e) => setConfig({ ...config, hotScoreThreshold: Number(e.target.value) })}
              className="w-36 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-red-600"
            />
            <span className="px-3 py-1 bg-white border border-slate-200 font-bold text-sm text-red-600 rounded-xl min-w-[58px] text-center shadow-xs">
              ≥ {config.hotScoreThreshold}%
            </span>
          </div>
        </div>
      </div>

      {/* Grid of Channels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Telegram Channel */}
        <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-all flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-sky-100 text-sky-600 rounded-xl">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Bot de Telegram al Móvil</h4>
                  <p className="text-[11px] text-slate-500">Notificación Push instantánea con enlace directo a WhatsApp</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={config.telegramEnabled} 
                  onChange={(e) => setConfig({ ...config, telegramEnabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="space-y-3 pt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Telegram Bot Token
                </label>
                <input
                  type="password"
                  placeholder="1234567890:ABCdefGhIJKlmNoPQRsTUVwxyZ"
                  value={config.telegramBotToken}
                  onChange={(e) => setConfig({ ...config, telegramBotToken: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Telegram Chat ID (Grupo o Chat Personal)
                </label>
                <input
                  type="text"
                  placeholder="Ej: 987654321 o -1001234567890"
                  value={config.telegramChatId}
                  onChange={(e) => setConfig({ ...config, telegramChatId: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <button
                type="button"
                onClick={() => setShowTelegramHelp(!showTelegramHelp)}
                className="text-[11px] text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium mt-1 cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                {showTelegramHelp ? "Ocultar guía de configuración" : "¿Cómo obtener el Bot Token y Chat ID en 2 minutos?"}
              </button>

              {showTelegramHelp && (
                <div className="p-3.5 bg-blue-50/80 border border-blue-100 rounded-xl text-[11px] text-blue-900 space-y-1.5 animate-in fade-in">
                  <p><strong>1. Crea tu Bot:</strong> Abre Telegram, busca <code>@BotFather</code>, envía <code>/newbot</code> y copia el <em>Token</em> generado.</p>
                  <p><strong>2. Obtén tu Chat ID:</strong> Inicia tu bot o añádelo a tu grupo comercial. Luego habla con <code>@userinfobot</code> para ver tu ID numérico.</p>
                  <p><strong>3. Listo:</strong> Pega ambos valores aquí y pulsa <em>Probar Alerta Ahora</em>.</p>
                </div>
              )}
            </div>
          </div>

          <div className="pt-2">
            <div className="p-3 bg-white rounded-xl border border-slate-200/80 text-[11px] text-slate-600">
              💡 <strong>Incluye:</strong> Nombre, teléfono, presupuesto, inmueble de interés y botón con respuesta comercial preescrita lista para enviar en WhatsApp.
            </div>
          </div>
        </div>

        {/* Webhook Channel */}
        <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-all flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-purple-100 text-purple-600 rounded-xl">
                  <Webhook className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Webhook HTTP (Make / Zapier / n8n / CRM)</h4>
                  <p className="text-[11px] text-slate-500">Envío instantáneo de JSON en tiempo real a tus automatizaciones</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={config.webhookEnabled} 
                  onChange={(e) => setConfig({ ...config, webhookEnabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>

            <div className="space-y-3 pt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Webhook URL (POST Endpoint)
                </label>
                <input
                  type="url"
                  placeholder="https://hook.eu1.make.com/... o https://hooks.zapier.com/..."
                  value={config.webhookUrl}
                  onChange={(e) => setConfig({ ...config, webhookUrl: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Notificación por Correo de Emergencia (Opcional)
                </label>
                <input
                  type="email"
                  placeholder="alertas@tuagencia.com"
                  value={config.notificationEmail}
                  onChange={(e) => setConfig({ ...config, notificationEmail: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
          </div>

          <div className="pt-2">
            <div className="p-3 bg-white rounded-xl border border-slate-200/80 text-[11px] text-slate-600 space-y-1">
              <p>📡 <strong>Evento emitido:</strong> <code>lead.hot_detected</code></p>
              <p>El webhook recibe el payload completo del lead, el score de temperatura y el enlace <code>whatsapp_quick_reply_url</code>.</p>
            </div>
          </div>
        </div>

      </div>

      {/* Simulated Live Alert Preview */}
      <div className="border border-slate-200 rounded-2xl p-5 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
        <div className="flex items-center justify-between pb-3 border-b border-slate-700/60 mb-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
            <Smartphone className="w-4 h-4 text-emerald-400" />
            <span>Vista Previa: Notificación en tu Teléfono Móvil</span>
          </div>
          <span className="text-[10px] text-slate-400">Respuesta en &lt;15 min recomendada</span>
        </div>
        <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-700 font-mono text-[11px] text-slate-200 space-y-1.5 leading-relaxed">
          <p className="text-red-400 font-bold">🔥 ¡NUEVO LEAD CALIENTE DETECTADO!</p>
          <p>🏢 <strong>Agencia:</strong> {agencyName}</p>
          <p>👤 <strong>Cliente:</strong> Alejandro Mendoza (Inversor)</p>
          <p>📞 <strong>Teléfono:</strong> +34 622 334 455</p>
          <p>💰 <strong>Presupuesto:</strong> 700.000 €</p>
          <p>🎯 <strong>Hot Score:</strong> <span className="text-emerald-400 font-bold">98 / 100</span></p>
          <p>⚡ <strong>Acción Sugerida:</strong> Llamar en menos de 15 minutos para asegurar exclusividad.</p>
          <div className="pt-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold cursor-pointer transition-all">
              <Send className="w-3 h-3" /> Contactar por WhatsApp en 1 Toque
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
