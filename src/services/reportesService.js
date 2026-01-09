import { db } from 'boot/firebase'
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp,
  startAt,
  endAt
} from 'firebase/firestore'

export const reportesService = {
  // Obtener ventas por período
  async getVentasPorPeriodo(fechaInicio, fechaFin) {
    try {
      const ventasRef = collection(db, 'ventas')
      let q = query(ventasRef)
      
      if (fechaInicio && fechaFin) {
        q = query(q, 
          where('fecha', '>=', Timestamp.fromDate(new Date(fechaInicio))),
          where('fecha', '<=', Timestamp.fromDate(new Date(fechaFin)))
        )
      }
      
      q = query(q, orderBy('fecha', 'desc'))
      const snapshot = await getDocs(q)
      
      return snapshot.docs.map(doc => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          fecha: data.fecha?.toDate?.() || data.fecha
        }
      })
    } catch (error) {
      console.error('Error obteniendo ventas:', error)
      return []
    }
  },
  
  // Obtener estadísticas resumidas
  async getEstadisticasResumen() {
    try {
      const [ventas, pagos, clientes] = await Promise.all([
        this.getVentasTotales(),
        this.getPagosTotales(),
        this.getClientesActivos()
      ])
      
      const deudas = ventas.reduce((total, venta) => total + (venta.saldoPendiente || 0), 0)
      const ventasTotal = ventas.reduce((total, venta) => total + (venta.total || 0), 0)
      
      return {
        ventasTotales: ventasTotal,
        pagosTotales: pagos.reduce((total, pago) => total + (pago.monto || 0), 0),
        deudasPendientes: deudas,
        clientesActivos: clientes.length,
        ratioDeudas: ventasTotal > 0 ? deudas / ventasTotal : 0
      }
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error)
      return this.getEstadisticasDemo()
    }
  },
  
  // Obtener top clientes
  async getTopClientes(limite = 10) {
    try {
      const ventas = await this.getVentasPorPeriodo()
      const clientesMap = {}
      
      ventas.forEach(venta => {
        if (!venta.clienteId || !venta.clienteNombre) return
        
        if (!clientesMap[venta.clienteId]) {
          clientesMap[venta.clienteId] = {
            id: venta.clienteId,
            nombre: venta.clienteNombre,
            comprasTotales: 0,
            deuda: 0,
            ultimaCompra: venta.fecha
          }
        }
        
        clientesMap[venta.clienteId].comprasTotales += venta.total || 0
        clientesMap[venta.clienteId].deuda += venta.saldoPendiente || 0
        
        if (venta.fecha > clientesMap[venta.clienteId].ultimaCompra) {
          clientesMap[venta.clienteId].ultimaCompra = venta.fecha
        }
      })
      
      return Object.values(clientesMap)
        .sort((a, b) => b.comprasTotales - a.comprasTotales)
        .slice(0, limite)
        .map(cliente => ({
          ...cliente,
          ultimaCompra: cliente.ultimaCompra?.toLocaleDateString?.('es-CO') || cliente.ultimaCompra
        }))
    } catch (error) {
      console.error('Error obteniendo top clientes:', error)
      return this.getTopClientesDemo()
    }
  },
  
  // Obtener ventas mensuales para gráfico
  async getVentasMensuales(meses = 6) {
    try {
      const fechaFin = new Date()
      const fechaInicio = new Date()
      fechaInicio.setMonth(fechaInicio.getMonth() - meses)
      
      const ventas = await this.getVentasPorPeriodo(fechaInicio, fechaFin)
      
      // Agrupar por mes
      const ventasPorMes = {}
      const mesesNombres = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
      
      ventas.forEach(venta => {
        const fecha = venta.fecha instanceof Date ? venta.fecha : new Date(venta.fecha)
        const mesKey = `${fecha.getFullYear()}-${fecha.getMonth()}`
        
        if (!ventasPorMes[mesKey]) {
          ventasPorMes[mesKey] = {
            mes: mesesNombres[fecha.getMonth()],
            ventas: 0
          }
        }
        
        ventasPorMes[mesKey].ventas += venta.total || 0
      })
      
      return Object.values(ventasPorMes)
    } catch (error) {
      console.error('Error obteniendo ventas mensuales:', error)
      return this.getVentasMensualesDemo(meses)
    }
  },
  
  // Métodos auxiliares
  async getVentasTotales() {
    const snapshot = await getDocs(collection(db, 'ventas'))
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  },
  
  async getPagosTotales() {
    const snapshot = await getDocs(collection(db, 'pagos'))
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  },
  
  async getClientesActivos() {
    const snapshot = await getDocs(collection(db, 'clientes'))
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  },
  
  // Métodos de demostración (fallback)
  getEstadisticasDemo() {
    return {
      ventasTotales: 12500000,
      pagosTotales: 9800000,
      deudasPendientes: 2700000,
      clientesActivos: 45,
      ratioDeudas: 0.216
    }
  },
  
  getTopClientesDemo() {
    return [
      { id: 1, nombre: 'Juan Pérez', comprasTotales: 3200000, deuda: 500000, ultimaCompra: '2024-01-15' },
      { id: 2, nombre: 'María González', comprasTotales: 2800000, deuda: 0, ultimaCompra: '2024-01-10' },
      { id: 3, nombre: 'Carlos Rodríguez', comprasTotales: 2500000, deuda: 1200000, ultimaCompra: '2024-01-05' }
    ]
  },
  
  getVentasMensualesDemo(meses) {
    const mesesNombres = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
    const hoy = new Date()
    const resultado = []
    
    for (let i = meses - 1; i >= 0; i--) {
      const fecha = new Date()
      fecha.setMonth(hoy.getMonth() - i)
      const mesIdx = fecha.getMonth()
      
      resultado.push({
        mes: mesesNombres[mesIdx],
        ventas: Math.floor(Math.random() * 3000000) + 1000000
      })
    }
    
    return resultado
  }
}