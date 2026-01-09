import Papa from 'papaparse'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

// Función para exportar a CSV
export const exportToCSV = (data, filename = 'export') => {
  if (!data || data.length === 0) {
    return false
  }
  
  const csv = Papa.unparse(data, {
    quotes: true,
    delimiter: ',',
    header: true
  })
  
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  
  if (navigator.msSaveBlob) {
    navigator.msSaveBlob(blob, `${filename}.csv`)
  } else {
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${filename}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
  
  return true
}

// Función para exportar a Excel (simulado con CSV)
export const exportToExcel = (data, filename = 'export') => {
  return exportToCSV(data, filename)
}

// Función para exportar a PDF
export const exportToPDF = (data, columns, title, filename = 'export') => {
  const doc = new jsPDF('p', 'mm', 'a4')
  
  // Título
  doc.setFontSize(16)
  doc.text(title, 14, 15)
  
  // Fecha
  const fecha = new Date().toLocaleDateString('es-CO')
  doc.setFontSize(10)
  doc.text(`Fecha: ${fecha}`, 14, 25)
  
  // Tabla
  const tableData = data.map(row => {
    return columns.map(col => row[col.field] || '')
  })
  
  const tableColumns = columns.map(col => col.label)
  
  doc.autoTable({
    head: [tableColumns],
    body: tableData,
    startY: 30,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 2
    },
    headStyles: {
      fillColor: [25, 118, 210], // Color primario
      textColor: 255
    }
  })
  
  // Guardar
  doc.save(`${filename}.pdf`)
}

// Función para exportar datos de Firestore
export const exportFirestoreCollection = async (collectionName, db, filters = {}) => {
  const { collection: firestoreCollection, query: firestoreQuery, where, orderBy, getDocs } = await import('firebase/firestore')
  
  try {
    let q = firestoreQuery(firestoreCollection(db, collectionName))
    
    // Aplicar filtros
    if (filters.fechaDesde && filters.fechaHasta) {
      q = firestoreQuery(q, where('fecha', '>=', new Date(filters.fechaDesde)))
      q = firestoreQuery(q, where('fecha', '<=', new Date(filters.fechaHasta)))
    }
    
    if (filters.orderBy) {
      q = firestoreQuery(q, orderBy(filters.orderBy, filters.orderDir || 'desc'))
    }
    
    const snapshot = await getDocs(q)
    const data = snapshot.docs.map(doc => {
      const docData = doc.data()
      // Convertir Timestamps a fechas legibles
      Object.keys(docData).forEach(key => {
        if (docData[key]?.toDate) {
          docData[key] = docData[key].toDate().toLocaleString('es-CO')
        }
      })
      return { id: doc.id, ...docData }
    })
    
    return data
  } catch (error) {
    console.error(`Error exportando ${collectionName}:`, error)
    return []
  }
}

// Función para generar reporte ejecutivo
export const generarReporteEjecutivo = (estadisticas) => {
  const doc = new jsPDF('p', 'mm', 'a4')
  
  // Encabezado
  doc.setFontSize(20)
  doc.setTextColor(25, 118, 210)
  doc.text('Reporte Ejecutivo', 105, 20, { align: 'center' })
  
  doc.setFontSize(10)
  doc.setTextColor(100, 100, 100)
  doc.text(`Generado: ${new Date().toLocaleString('es-CO')}`, 105, 30, { align: 'center' })
  
  // Sección de KPIs
  doc.setFontSize(14)
  doc.setTextColor(0, 0, 0)
  doc.text('📊 Indicadores Clave', 20, 45)
  
  doc.setFontSize(10)
  doc.text(`Ventas Totales: $${formatNumber(estadisticas.ventasTotales)}`, 30, 55)
  doc.text(`Ingresos por Pagos: $${formatNumber(estadisticas.pagosTotales)}`, 30, 60)
  doc.text(`Deudas Pendientes: $${formatNumber(estadisticas.deudasPendientes)}`, 30, 65)
  doc.text(`Clientes Activos: ${estadisticas.clientesActivos}`, 30, 70)
  
  // Línea divisoria
  doc.setDrawColor(200, 200, 200)
  doc.line(20, 75, 190, 75)
  
  // Resumen
  doc.setFontSize(14)
  doc.text('📋 Resumen de Gestión', 20, 85)
  
  doc.setFontSize(10)
  const resumen = `
Este reporte presenta un resumen ejecutivo del estado actual del negocio:

• Total de ventas generadas: $${formatNumber(estadisticas.ventasTotales)}
• Monto recuperado a través de pagos: $${formatNumber(estadisticas.pagosTotales)}
• Deudas pendientes por cobrar: $${formatNumber(estadisticas.deudasPendientes)}
• Porcentaje de mora: ${(estadisticas.ratioDeudas * 100).toFixed(2)}%
• Clientes activos en el sistema: ${estadisticas.clientesActivos}

Recomendaciones:
${estadisticas.ratioDeudas > 0.3 ? '⚠️ Atención: El nivel de mora es elevado. Revisar política de crédito.' : '✅ Nivel de mora dentro de límites aceptables.'}
${estadisticas.pagosTotales / estadisticas.ventasTotales < 0.7 ? '⚠️ Evaluar estrategias de cobro para mejorar flujo de caja.' : '✅ Flujo de caja saludable.'}
`
  
  doc.text(resumen, 20, 95, { maxWidth: 170 })
  
  // Pie de página
  doc.setFontSize(8)
  doc.setTextColor(150, 150, 150)
  doc.text('Reporte generado por MarketGestor - Sistema de Gestión Comercial', 105, 280, { align: 'center' })
  
  return doc
}

const formatNumber = (num) => {
  return new Intl.NumberFormat('es-CO').format(Math.round(num || 0))
}