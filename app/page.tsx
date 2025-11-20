"use client"

import { useState } from "react"
import {
  Thermometer,
  Droplets,
  Wind,
  Sun,
  Moon,
  Activity,
  Volume2,
  Clock,
} from "lucide-react"
import { MetricCard } from "@/components/metric-card"
import { StatCard } from "@/components/stat-card"
import { LineChart } from "@/components/line-chart"
import { EstadoModal } from "@/components/estado-modal"
import { EventBadge } from "@/components/event-badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useFetch, useTimeAgo } from "@/lib/hooks"
import { SensorData, HistoricalData, RegistroEstado, Evento, EstadoAnimo } from "@/lib/types"

export default function Dashboard() {
  const [periodo, setPeriodo] = useState("24h")

  // Fetch datos actuales con polling cada 30 seg
  const { data: currentData, loading: loadingCurrent } = useFetch<SensorData>(
    "/api/sensores/current",
    30000
  )

  // Fetch datos históricos
  const { data: historicoData, loading: loadingHistorico } = useFetch<{
    datos: HistoricalData[]
  }>(`/api/sensores/historico?periodo=${periodo}`)

  // Fetch estado actual
  const { data: estadoActual, loading: loadingEstado } = useFetch<RegistroEstado>(
    "/api/estado"
  )

  // Fetch eventos recientes
  const { data: eventosData, loading: loadingEventos } = useFetch<{
    eventos: Evento[]
  }>("/api/eventos/recientes")

  const timeAgo = useTimeAgo(estadoActual?.timestamp || new Date().toISOString())

  // Determinar estado de cada métrica
  const getTemperaturaStatus = (temp: number) => {
    if (temp >= 20 && temp <= 24) return { status: "success" as const, text: "Óptima" }
    if (temp > 24 && temp <= 26) return { status: "warning" as const, text: "Alta" }
    return { status: "error" as const, text: "Fuera de rango" }
  }

  const getHumedadStatus = (hum: number) => {
    if (hum >= 40 && hum <= 60) return { status: "success" as const, text: "Óptima" }
    if (hum > 60 && hum <= 70) return { status: "warning" as const, text: "Alta" }
    return { status: "error" as const, text: "Fuera de rango" }
  }

  const getCO2Status = (co2: number) => {
    if (co2 < 800) return { status: "success" as const, text: "Buena" }
    if (co2 < 1200) return { status: "warning" as const, text: "Moderada" }
    return { status: "error" as const, text: "Mala" }
  }

  const getLuzStatus = (luz: number) => {
    if (luz < 100) return { status: undefined, text: "Noche" }
    return { status: "success" as const, text: "Día" }
  }

  const handleEstadoSubmit = async (estado: EstadoAnimo) => {
    await fetch("/api/estado", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado }),
    })
    // Refrescar datos
    window.location.reload()
  }

  const estadoEmoji = {
    bien: "😊",
    regular: "😐",
    mal: "😞",
  }

  const estadoTexto = {
    bien: "Bien",
    regular: "Regular",
    mal: "Mal",
  }

  // Generar sparkline data (últimas 6 lecturas)
  const sparklineData = historicoData?.datos.slice(-6).map((d) => d.temperatura) || []

  if (loadingCurrent || loadingHistorico || loadingEstado || loadingEventos) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-slate-600">Cargando datos...</div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Hero Section - Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Temperatura"
          value={currentData?.temperatura.toFixed(1) || "0"}
          unit="°C"
          icon={Thermometer}
          status={getTemperaturaStatus(currentData?.temperatura || 0).status}
          statusText={getTemperaturaStatus(currentData?.temperatura || 0).text}
          sparklineData={sparklineData}
        />

        <MetricCard
          title="Humedad"
          value={currentData?.humedad.toFixed(0) || "0"}
          unit="%"
          icon={Droplets}
          status={getHumedadStatus(currentData?.humedad || 0).status}
          statusText={getHumedadStatus(currentData?.humedad || 0).text}
          sparklineData={historicoData?.datos.slice(-6).map((d) => d.humedad) || []}
        />

        <MetricCard
          title="Calidad del Aire"
          value={currentData?.co2.toFixed(0) || "0"}
          unit="ppm"
          icon={Wind}
          status={getCO2Status(currentData?.co2 || 0).status}
          statusText={getCO2Status(currentData?.co2 || 0).text}
          sparklineData={historicoData?.datos.slice(-6).map((d) => d.co2) || []}
        />

        <MetricCard
          title="Luz"
          value={currentData?.luz.toFixed(0) || "0"}
          unit="lux"
          icon={currentData && currentData.luz < 100 ? Moon : Sun}
          status={getLuzStatus(currentData?.luz || 0).status}
          statusText={getLuzStatus(currentData?.luz || 0).text}
          sparklineData={historicoData?.datos.slice(-6).map((d) => d.luz) || []}
        />
      </div>

      {/* Estado Actual */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <span className="text-6xl">
                {estadoActual ? estadoEmoji[estadoActual.estado] : "😊"}
              </span>
              <div>
                <h3 className="text-2xl font-bold text-slate-900">
                  ¿Cómo te sientes?
                </h3>
                <p className="text-slate-600">
                  Último registro:{" "}
                  <span className="font-semibold">
                    {estadoActual ? estadoTexto[estadoActual.estado] : "Bien"}
                  </span>
                </p>
                <p className="text-sm text-slate-500">Reportado {timeAgo}</p>
              </div>
            </div>
            <EstadoModal onSubmit={handleEstadoSubmit} />
          </div>
        </CardContent>
      </Card>

      {/* Métricas Secundarias */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          label="Movimientos detectados hoy"
          value="47"
          icon={Activity}
          trend={{ value: 12, isPositive: true }}
        />

        <StatCard
          label="Eventos de ruido"
          value="8"
          icon={Volume2}
          description="Últimas 24 horas"
        />

        <StatCard
          label="Tiempo en condiciones óptimas"
          value="6.5h"
          icon={Clock}
          description="De 24 horas totales"
        />
      </div>

      {/* Gráfico Principal */}
      <div>
        <div className="flex justify-end mb-4 space-x-2">
          {["6h", "24h", "7d", "30d"].map((p) => (
            <button
              key={p}
              onClick={() => setPeriodo(p)}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-colors
                ${
                  periodo === p
                    ? "bg-primary text-white"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                }
              `}
            >
              {p}
            </button>
          ))}
        </div>

        <LineChart
          title="Evolución de condiciones ambientales"
          data={historicoData?.datos || []}
          xKey="timestamp"
          lines={[
            { name: "Temperatura (°C)", dataKey: "temperatura", color: "#06B6D4" },
            { name: "Humedad (%)", dataKey: "humedad", color: "#3B82F6" },
            { name: "CO2 (ppm / 10)", dataKey: "co2", color: "#F59E0B" },
          ]}
          height={350}
        />
      </div>

      {/* Eventos Recientes */}
      <Card>
        <CardHeader>
          <CardTitle>Eventos Recientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {eventosData?.eventos.map((evento) => (
              <div
                key={evento.id}
                className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0"
              >
                <div className="flex items-center space-x-4 flex-1">
                  <span className="text-sm text-slate-500 w-20">
                    {new Date(evento.timestamp).toLocaleTimeString("es-ES", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <EventBadge type={evento.tipo} text={evento.descripcion} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
