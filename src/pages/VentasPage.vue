<template>
  <q-page class="q-pa-md">
    <!-- ENCABEZADO -->
    <div class="row items-center q-mb-md">
      <div class="col">
        <h4 class="q-my-none">💰 Gestión de Ventas</h4>
        <p class="text-caption text-grey">Registra y administra tus ventas/pedidos</p>
      </div>
      <div class="col-auto">
        <q-btn 
          color="primary" 
          icon="add_shopping_cart" 
          label="Nueva Venta"
          @click="abrirDialogoNuevo"
        />
      </div>
    </div>

    <!-- FILTROS Y BÚSQUEDA -->
    <q-card class="q-mb-md">
      <q-card-section>
        <div class="row q-col-gutter-md">
          <!-- Búsqueda -->
          <div class="col-12 col-md-6">
            <q-input 
              v-model="busqueda" 
              placeholder="🔍 Buscar por cliente o producto..."
              outlined
              dense
              clearable
            >
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>

          <!-- Filtro por Estado -->
          <div class="col-6 col-md-3">
            <q-select
              v-model="filtroEstado"
              :options="opcionesEstado"
              label="Filtrar por estado"
              outlined
              dense
              emit-value
              map-options
              clearable
            />
          </div>

          <!-- Ordenar -->
          <div class="col-6 col-md-3">
            <q-select
              v-model="ordenar"
              :options="opcionesOrden"
              label="Ordenar por"
              outlined
              dense
              emit-value
              map-options
            />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- ESTADÍSTICAS RÁPIDAS -->
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="bg-blue-1">
          <q-card-section>
            <div class="text-h6">{{ estadisticas.total }}</div>
            <div class="text-caption text-grey">Total Ventas</div>
          </q-card-section>
        </q-card>
      </div>
      
      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="bg-orange-1">
          <q-card-section>
            <div class="text-h6">{{ estadisticas.pendientes }}</div>
            <div class="text-caption text-grey">Pendientes</div>
          </q-card-section>
        </q-card>
      </div>
      
      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="bg-green-1">
          <q-card-section>
            <div class="text-h6">{{ formatearMoneda(estadisticas.totalVentas) }}</div>
            <div class="text-caption text-grey">Total en Ventas</div>
          </q-card-section>
        </q-card>
      </div>
      
      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="bg-purple-1">
          <q-card-section>
            <div class="text-h6">{{ formatearMoneda(estadisticas.totalPagado) }}</div>
            <div class="text-caption text-grey">Total Pagado</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- LISTA DE VENTAS -->
    <q-card>
      <q-card-section>
        <div v-if="cargando" class="text-center q-pa-lg">
          <q-spinner color="primary" size="xl" />
          <div class="q-mt-md">Cargando ventas...</div>
        </div>

        <div v-else-if="ventasFiltradas.length === 0" class="text-center q-pa-lg">
          <q-icon name="shopping_cart" size="xl" color="grey-5" />
          <div class="q-mt-md text-grey">
            {{ busqueda || filtroEstado ? 'No se encontraron ventas' : 'Aún no hay ventas registradas' }}
          </div>
          <q-btn 
            v-if="!busqueda && !filtroEstado"
            color="primary" 
            label="Registrar Primera Venta" 
            class="q-mt-md"
            @click="abrirDialogoNuevo"
          />
        </div>

        <q-list v-else bordered separator>
          <q-item 
            v-for="venta in ventasFiltradas" 
            :key="venta.id"
            clickable
            v-ripple
            @click="verDetalles(venta)"
          >
            <q-item-section avatar>
              <q-avatar :color="getColorEstado(venta.estado)" text-color="white">
                <q-icon :name="getIconoEstado(venta.estado)" />
              </q-avatar>
            </q-item-section>

            <q-item-section>
              <q-item-label class="text-weight-bold">
                {{ venta.clienteNombre || 'Cliente sin nombre' }}
              </q-item-label>
              <q-item-label caption>
                {{ venta.producto || venta.descripcion }}
              </q-item-label>
              <q-item-label caption>
                📅 {{ formatearFecha(venta.fecha) }}
              </q-item-label>
            </q-item-section>

            <q-item-section side>
              <div class="column items-end">
                <div class="text-h6 text-primary">{{ formatearMoneda(venta.precio) }}</div>
                <q-chip 
                  :color="getColorEstado(venta.estado)" 
                  text-color="white" 
                  size="sm"
                  dense
                >
                  {{ venta.estado }}
                </q-chip>
              </div>
            </q-item-section>

            <q-item-section side>
              <div class="row q-gutter-xs">
                <q-btn 
                  round 
                  dense 
                  flat 
                  color="blue" 
                  icon="edit"
                  @click.stop="editarVenta(venta)"
                >
                  <q-tooltip>Editar</q-tooltip>
                </q-btn>

                <q-btn 
                  round 
                  dense 
                  flat 
                  color="red" 
                  icon="delete"
                  @click.stop="confirmarEliminar(venta)"
                >
                  <q-tooltip>Eliminar</q-tooltip>
                </q-btn>
              </div>
            </q-item-section>
          </q-item>
        </q-list>

        <div v-if="!cargando && ventas.length > 0" class="q-mt-md text-center text-caption text-grey">
          Mostrando {{ ventasFiltradas.length }} de {{ ventas.length }} ventas
        </div>
      </q-card-section>
    </q-card>

    <!-- DIÁLOGO CREAR/EDITAR VENTA -->
    <q-dialog v-model="dialogo" persistent>
      <q-card style="min-width: 450px">
        <q-card-section>
          <div class="text-h6">{{ modoEdicion ? 'Editar Venta' : 'Nueva Venta' }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <!-- Seleccionar Cliente -->
          <q-select
            v-model="formVenta.clienteId"
            :options="clientesOptions"
            label="Cliente *"
            outlined
            dense
            emit-value
            map-options
            :loading="cargandoClientes"
            :rules="[val => !!val || 'El cliente es obligatorio']"
          >
            <template v-slot:prepend>
              <q-icon name="person" />
            </template>
            <template v-slot:no-option>
              <q-item>
                <q-item-section class="text-grey">
                  No hay clientes registrados
                </q-item-section>
              </q-item>
            </template>
          </q-select>

          <!-- Producto/Descripción -->
          <q-input
            v-model="formVenta.producto"
            label="Producto o descripción *"
            outlined
            dense
            class="q-mt-md"
            type="textarea"
            rows="2"
            :rules="[val => !!val || 'El producto es obligatorio']"
          >
            <template v-slot:prepend>
              <q-icon name="shopping_bag" />
            </template>
          </q-input>

          <!-- Precio -->
          <q-input
            v-model.number="formVenta.precio"
            label="Precio al cliente *"
            outlined
            dense
            type="number"
            min="0"
            step="0.01"
            prefix="$"
            class="q-mt-md"
            :rules="[val => val > 0 || 'El precio debe ser mayor a 0']"
          >
            <template v-slot:prepend>
              <q-icon name="attach_money" />
            </template>
          </q-input>

          <!-- Estado -->
          <q-select
            v-model="formVenta.estado"
            :options="estadosVenta"
            label="Estado *"
            outlined
            dense
            class="q-mt-md"
            emit-value
            map-options
          >
            <template v-slot:prepend>
              <q-icon name="info" />
            </template>
          </q-select>

          <!-- Fecha -->
          <q-input
            v-model="formVenta.fecha"
            label="Fecha *"
            outlined
            dense
            type="date"
            class="q-mt-md"
          >
            <template v-slot:prepend>
              <q-icon name="event" />
            </template>
          </q-input>

          <!-- Observaciones -->
          <q-input
            v-model="formVenta.observaciones"
            label="Observaciones (opcional)"
            outlined
            dense
            type="textarea"
            rows="2"
            class="q-mt-md"
          >
            <template v-slot:prepend>
              <q-icon name="note" />
            </template>
          </q-input>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="grey" v-close-popup @click="cerrarDialogo" />
          <q-btn 
            label="Guardar" 
            color="primary" 
            :loading="guardando"
            @click="guardarVenta"
            :disable="!formValido"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- DIÁLOGO DETALLES -->
    <q-dialog v-model="dialogoDetalles">
      <q-card style="min-width: 400px">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">Detalles de la Venta</div>
        </q-card-section>

        <q-card-section v-if="ventaSeleccionada">
          <div class="q-gutter-sm">
            <div>
              <strong>Cliente:</strong> {{ ventaSeleccionada.clienteNombre }}
            </div>
            <div>
              <strong>Producto:</strong> {{ ventaSeleccionada.producto }}
            </div>
            <div>
              <strong>Precio:</strong> {{ formatearMoneda(ventaSeleccionada.precio) }}
            </div>
            <div>
              <strong>Estado:</strong>
              <q-chip 
                :color="getColorEstado(ventaSeleccionada.estado)" 
                text-color="white" 
                size="sm"
              >
                {{ ventaSeleccionada.estado }}
              </q-chip>
            </div>
            <div>
              <strong>Fecha:</strong> {{ formatearFecha(ventaSeleccionada.fecha) }}
            </div>
            <div v-if="ventaSeleccionada.observaciones">
              <strong>Observaciones:</strong> {{ ventaSeleccionada.observaciones }}
            </div>
            <div class="text-caption text-grey">
              Registrado: {{ formatearFechaCompleta(ventaSeleccionada.createdAt) }}
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cerrar" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { db } from 'boot/firebase'
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp,
  query,
  orderBy
} from 'firebase/firestore'
import { useQuasar } from 'quasar'

export default {
  name: 'VentasPage',
  
  setup() {
    const $q = useQuasar()
    
    // DATOS REACTIVOS
    const ventas = ref([])
    const clientes = ref([])
    const busqueda = ref('')
    const filtroEstado = ref(null)
    const ordenar = ref('fecha-desc')
    const cargando = ref(false)
    const cargandoClientes = ref(false)
    const dialogo = ref(false)
    const dialogoDetalles = ref(false)
    const guardando = ref(false)
    const modoEdicion = ref(false)
    const ventaActual = ref(null)
    const ventaSeleccionada = ref(null)
    
    const formVenta = ref({
      clienteId: null,
      producto: '',
      precio: 0,
      estado: 'pendiente',
      fecha: new Date().toISOString().split('T')[0],
      observaciones: ''
    })
    
    // OPCIONES
    const estadosVenta = [
      { label: '⏳ Pendiente', value: 'pendiente' },
      { label: '💵 Pagado', value: 'pagado' },
      { label: '📦 Entregado', value: 'entregado' },
      { label: '❌ Cancelado', value: 'cancelado' }
    ]
    
    const opcionesEstado = [
      { label: 'Todos', value: null },
      ...estadosVenta
    ]
    
    const opcionesOrden = [
      { label: 'Fecha (más reciente)', value: 'fecha-desc' },
      { label: 'Fecha (más antiguo)', value: 'fecha-asc' },
      { label: 'Precio (mayor)', value: 'precio-desc' },
      { label: 'Precio (menor)', value: 'precio-asc' },
      { label: 'Cliente (A-Z)', value: 'cliente-asc' }
    ]
    
    // CARGAR CLIENTES
    const cargarClientes = async () => {
      cargandoClientes.value = true
      try {
        const querySnapshot = await getDocs(collection(db, 'clientes'))
        clientes.value = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      } catch (error) {
        console.error('Error cargando clientes:', error)
      } finally {
        cargandoClientes.value = false
      }
    }
    
    // OPCIONES DE CLIENTES PARA SELECT
    const clientesOptions = computed(() => {
      return clientes.value.map(c => ({
        label: c.nombre,
        value: c.id
      }))
    })
    
    // CARGAR VENTAS
    const cargarVentas = async () => {
      cargando.value = true
      try {
        const querySnapshot = await getDocs(collection(db, 'ventas'))
        ventas.value = querySnapshot.docs.map(doc => {
          const data = doc.data()
          // Buscar nombre del cliente
          const cliente = clientes.value.find(c => c.id === data.clienteId)
          return {
            id: doc.id,
            ...data,
            clienteNombre: cliente?.nombre || 'Cliente desconocido'
          }
        })
      } catch (error) {
        console.error('Error cargando ventas:', error)
        $q.notify({
          type: 'negative',
          message: 'Error al cargar ventas',
          caption: error.message
        })
      } finally {
        cargando.value = false
      }
    }
    
    // FILTRAR Y ORDENAR VENTAS
    const ventasFiltradas = computed(() => {
      let resultado = [...ventas.value]
      
      // Filtrar por búsqueda
      if (busqueda.value.trim()) {
        const termino = busqueda.value.toLowerCase()
        resultado = resultado.filter(v => 
          (v.clienteNombre && v.clienteNombre.toLowerCase().includes(termino)) ||
          (v.producto && v.producto.toLowerCase().includes(termino)) ||
          (v.descripcion && v.descripcion.toLowerCase().includes(termino))
        )
      }
      
      // Filtrar por estado
      if (filtroEstado.value) {
        resultado = resultado.filter(v => v.estado === filtroEstado.value)
      }
      
      // Ordenar
      switch (ordenar.value) {
        case 'fecha-desc':
          resultado.sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
          break
        case 'fecha-asc':
          resultado.sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
          break
        case 'precio-desc':
          resultado.sort((a, b) => b.precio - a.precio)
          break
        case 'precio-asc':
          resultado.sort((a, b) => a.precio - b.precio)
          break
        case 'cliente-asc':
          resultado.sort((a, b) => a.clienteNombre.localeCompare(b.clienteNombre))
          break
      }
      
      return resultado
    })
    
    // ESTADÍSTICAS
    const estadisticas = computed(() => {
      return {
        total: ventas.value.length,
        pendientes: ventas.value.filter(v => v.estado === 'pendiente').length,
        totalVentas: ventas.value.reduce((sum, v) => sum + (v.precio || 0), 0),
        totalPagado: ventas.value
          .filter(v => v.estado === 'pagado' || v.estado === 'entregado')
          .reduce((sum, v) => sum + (v.precio || 0), 0)
      }
    })
    
    // VALIDACIÓN DEL FORMULARIO
    const formValido = computed(() => {
      return formVenta.value.clienteId && 
             formVenta.value.producto && 
             formVenta.value.precio > 0 &&
             formVenta.value.fecha
    })
    
    // FORMATEAR MONEDA
    const formatearMoneda = (valor) => {
      return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
      }).format(valor || 0)
    }
    
    // FORMATEAR FECHA
    const formatearFecha = (fecha) => {
      if (!fecha) return 'Sin fecha'
      return new Date(fecha).toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }
    
    // FORMATEAR FECHA COMPLETA
    const formatearFechaCompleta = (timestamp) => {
      if (!timestamp) return 'Sin fecha'
      const fecha = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
      return fecha.toLocaleString('es-CO')
    }
    
    // COLOR SEGÚN ESTADO
    const getColorEstado = (estado) => {
      const colores = {
        pendiente: 'orange',
        pagado: 'green',
        entregado: 'blue',
        cancelado: 'red'
      }
      return colores[estado] || 'grey'
    }
    
    // ICONO SEGÚN ESTADO
    const getIconoEstado = (estado) => {
      const iconos = {
        pendiente: 'schedule',
        pagado: 'paid',
        entregado: 'local_shipping',
        cancelado: 'cancel'
      }
      return iconos[estado] || 'help'
    }
    
    // ABRIR DIÁLOGO NUEVO
    const abrirDialogoNuevo = () => {
      modoEdicion.value = false
      ventaActual.value = null
      formVenta.value = {
        clienteId: null,
        producto: '',
        precio: 0,
        estado: 'pendiente',
        fecha: new Date().toISOString().split('T')[0],
        observaciones: ''
      }
      dialogo.value = true
    }
    
    // EDITAR VENTA
    const editarVenta = (venta) => {
      modoEdicion.value = true
      ventaActual.value = venta
      formVenta.value = {
        clienteId: venta.clienteId,
        producto: venta.producto,
        precio: venta.precio,
        estado: venta.estado,
        fecha: venta.fecha,
        observaciones: venta.observaciones || ''
      }
      dialogo.value = true
    }
    
    // VER DETALLES
    const verDetalles = (venta) => {
      ventaSeleccionada.value = venta
      dialogoDetalles.value = true
    }
    
    // GUARDAR VENTA
    const guardarVenta = async () => {
      if (!formValido.value) {
        $q.notify({
          type: 'warning',
          message: 'Por favor completa todos los campos obligatorios'
        })
        return
      }
      
      guardando.value = true
      
      try {
        const ventaData = {
          clienteId: formVenta.value.clienteId,
          producto: formVenta.value.producto.trim(),
          precio: Number(formVenta.value.precio),
          estado: formVenta.value.estado,
          fecha: formVenta.value.fecha,
          observaciones: formVenta.value.observaciones.trim(),
          updatedAt: serverTimestamp()
        }
        
        if (modoEdicion.value && ventaActual.value) {
          // ACTUALIZAR
          const ventaRef = doc(db, 'ventas', ventaActual.value.id)
          await updateDoc(ventaRef, ventaData)
          
          $q.notify({
            type: 'positive',
            message: '✅ Venta actualizada correctamente'
          })
        } else {
          // CREAR
          ventaData.createdAt = serverTimestamp()
          await addDoc(collection(db, 'ventas'), ventaData)
          
          $q.notify({
            type: 'positive',
            message: '✅ Venta registrada correctamente'
          })
        }
        
        cerrarDialogo()
        await cargarVentas()
        
      } catch (error) {
        console.error('Error guardando venta:', error)
        $q.notify({
          type: 'negative',
          message: 'Error al guardar venta',
          caption: error.message
        })
      } finally {
        guardando.value = false
      }
    }
    
    // CONFIRMAR ELIMINAR
    const confirmarEliminar = (venta) => {
      $q.dialog({
        title: 'Confirmar eliminación',
        message: `¿Estás seguro de eliminar esta venta de ${venta.clienteNombre}?`,
        cancel: {
          label: 'Cancelar',
          flat: true,
          color: 'grey'
        },
        ok: {
          label: 'Eliminar',
          color: 'negative'
        },
        persistent: true
      }).onOk(async () => {
        await eliminarVenta(venta)
      })
    }
    
    // ELIMINAR VENTA
    const eliminarVenta = async (venta) => {
      try {
        await deleteDoc(doc(db, 'ventas', venta.id))
        
        $q.notify({
          type: 'positive',
          message: '✅ Venta eliminada correctamente'
        })
        
        await cargarVentas()
      } catch (error) {
        console.error('Error eliminando venta:', error)
        $q.notify({
          type: 'negative',
          message: 'Error al eliminar venta',
          caption: error.message
        })
      }
    }
    
    // CERRAR DIÁLOGO
    const cerrarDialogo = () => {
      dialogo.value = false
      formVenta.value = {
        clienteId: null,
        producto: '',
        precio: 0,
        estado: 'pendiente',
        fecha: new Date().toISOString().split('T')[0],
        observaciones: ''
      }
      modoEdicion.value = false
      ventaActual.value = null
    }
    
    // INICIALIZAR
    onMounted(async () => {
      await cargarClientes()
      await cargarVentas()
    })
    
    return {
      ventas,
      busqueda,
      filtroEstado,
      ordenar,
      cargando,
      cargandoClientes,
      dialogo,
      dialogoDetalles,
      guardando,
      modoEdicion,
      formVenta,
      ventaSeleccionada,
      ventasFiltradas,
      estadisticas,
      formValido,
      estadosVenta,
      opcionesEstado,
      opcionesOrden,
      clientesOptions,
      formatearMoneda,
      formatearFecha,
      formatearFechaCompleta,
      getColorEstado,
      getIconoEstado,
      abrirDialogoNuevo,
      editarVenta,
      verDetalles,
      guardarVenta,
      confirmarEliminar,
      cerrarDialogo
    }
  }
}
</script>

<style scoped>
.q-item {
  border-radius: 8px;
  margin-bottom: 4px;
}

.q-item:hover {
  background-color: rgba(0, 0, 0, 0.03);
}
</style>