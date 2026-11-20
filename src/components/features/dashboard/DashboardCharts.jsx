import { useEffect, useRef, useMemo } from 'react'
import {
  Chart,
  BarController,
  BarElement,
  DoughnutController,
  ArcElement,
  CategoryScale,
  LinearScale,
  Legend,
  Tooltip,
} from 'chart.js'

// ✅ تسجيل يدوي — توفير ~80-100KB
Chart.register(
  BarController,
  BarElement,
  DoughnutController,
  ArcElement,
  CategoryScale,
  LinearScale,
  Legend,
  Tooltip
)

const DEGREE_LABELS = {
  '1st': 'درجة أولى',
  '2nd': 'درجة ثانية',
  '3rd': 'درجة ثالثة',
  International: 'دولي',
  New: 'جدد',
}

// ============================================
// Chart 1
// ============================================
export function CompetitionChart({ data = [] }) {
  const canvasRef = useRef(null)
  const chartRef = useRef(null)

  const chartData = useMemo(() => ({
    labels: data.map((d) => d.name),
    values: data.map((d) => d.count),
  }), [data])

  useEffect(() => {
    if (!canvasRef.current) return
    if (chartRef.current) {
      chartRef.current.destroy()
      chartRef.current = null
    }
    if (chartData.labels.length === 0) return

    chartRef.current = new Chart(canvasRef.current, {
      type: 'bar',
      data: {
        labels: chartData.labels,
        datasets: [{
          label: 'عدد المباريات',
          data: chartData.values,
          backgroundColor: 'rgba(0, 200, 83, 0.7)',
          borderColor: 'rgb(0, 200, 83)',
          borderWidth: 2,
          borderRadius: 6,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 300 },
        plugins: { legend: { display: false } },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { stepSize: 1, color: '#ffffff80' },
            grid: { color: 'rgba(255,255,255,0.05)' },
          },
          x: {
            ticks: { color: '#ffffff80' },
            grid: { display: false },
          },
        },
      },
    })

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy()
        chartRef.current = null
      }
    }
  }, [chartData])

  return (
    <div style={{ position: 'relative', height: '250px' }}>
      <canvas ref={canvasRef} />
    </div>
  )
}

// ============================================
// Chart 2
// ============================================
export function DegreeChart({ data = {} }) {
  const canvasRef = useRef(null)
  const chartRef = useRef(null)

  const chartData = useMemo(() => ({
    labels: Object.keys(data).map((k) => DEGREE_LABELS[k] || k),
    values: Object.values(data),
  }), [data])

  useEffect(() => {
    if (!canvasRef.current) return
    if (chartRef.current) {
      chartRef.current.destroy()
      chartRef.current = null
    }
    if (chartData.labels.length === 0) return

    chartRef.current = new Chart(canvasRef.current, {
      type: 'doughnut',
      data: {
        labels: chartData.labels,
        datasets: [{
          data: chartData.values,
          backgroundColor: ['#00c853', '#2196f3', '#ff9800', '#9c27b0', '#f44336'],
          borderWidth: 2,
          borderColor: '#0f1724',
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 300 },
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 15,
              usePointStyle: true,
              color: '#ffffff80',
              font: { size: 11 },
            },
          },
        },
        cutout: '65%',
      },
    })

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy()
        chartRef.current = null
      }
    }
  }, [chartData])

  return (
    <div style={{ position: 'relative', height: '250px' }}>
      <canvas ref={canvasRef} />
    </div>
  )
}