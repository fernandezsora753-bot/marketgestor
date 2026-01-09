<template>
  <q-page class="q-pa-md">
    <!-- ENCABEZADO -->
    <div class="row items-center q-mb-md">
      <div class="col">
        <h4 class="q-my-none">🚚 Proveedores</h4>
        <p class="text-caption text-grey">Gestiona tus proveedores y contactos</p>
      </div>
      <div class="col-auto">
        <q-btn 
          color="primary" 
          icon="add" 
          label="Nuevo Proveedor"
          @click="abrirDialogoNuevo"
        />
      </div>
    </div>

    <!-- BARRA DE BÚSQUEDA -->
    <q-card class="q-mb-md">
      <q-card-section>
        <q-input 
          v-model="busqueda" 
          placeholder="🔍 Buscar proveedor por nombre, cédula, contacto..."
          outlined
          clearable
          dense
        >
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
        </q-input>
      </q-card-section>
    </q-card>

    <!-- LISTA DE PROVEEDORES -->
    <q-card>
      <q-card-section>
        <!-- CARGA -->
        <div v-if="cargando" class="text-center q-pa-lg">
          <q-spinner color="primary" size="xl" />
          <div class="q-mt-md">Cargando proveedores...</div>
        </div>

        <!-- SIN DATOS -->
        <div v-else-if="proveedoresFiltrados.length === 0" class="text-center q-pa-lg">
          <q-icon name="local_shipping" size="xl" color="grey-5" />
          <div class="q-mt-md text-grey">
            {{ busqueda ? 'No se encontraron proveedores' : 'Aún no hay proveedores registrados' }}
          </div>
          <q-btn 
            v-if="!busqueda"
            color="primary" 
            label="Agregar Primer Proveedor" 
            class="q-mt-md"
            @click="abrirDialogoNuevo"
          />
        </div>

        <!-- LISTA -->
        <div v-else class="row q-col-gutter-md">
          <div 
            v-for="proveedor in proveedoresFiltrados" 
            :key="proveedor.id"
            class="col-12 col-md-6 col-lg-4"
          >
            <q-card class="proveedor-card">
              <q-card-section>
                <!-- NOMBRE Y ESTADO -->
                <div class="row items-center q-mb-sm">
                  <div class="col">
                    <div class="text-h6 text-weight-bold text-primary">
                      {{ proveedor.nombre }}
                    </div>
                  </div>
                  <div class="col-auto">
                    <q-icon 
                      name="check_circle" 
                      color="green" 
                      v-if="proveedor.activo"
                      size="sm"
                    >
                      <q-tooltip>Activo</q-tooltip>
                    </q-icon>
                  </div>
                </div>

                <!-- INFORMACIÓN -->
                <div class="q-gutter-y-sm">
                  <!-- CÉDULA -->
                  <div v-if="proveedor.cedula" class="row items-center">
                    <q-icon name="badge" size="sm" class="q-mr-sm" />
                    <span class="text-caption">Cédula: {{ proveedor.cedula }}</span>
                  </div>

                  <!-- DIRECCIÓN -->
                  <div v-if="proveedor.direccion" class="row items-center">
                    <q-icon name="location_on" size="sm" class="q-mr-sm" />
                    <span class="text-caption">{{ proveedor.direccion }}</span>
                  </div>

                  <!-- CORREO -->
                  <div v-if="proveedor.correo" class="row items-center">
                    <q-icon name="email" size="sm" class="q-mr-sm" />
                    <span class="text-caption">{{ proveedor.correo }}</span>
                  </div>

                  <!-- TELÉFONO 1 -->
                  <div v-if="proveedor.telefono1" class="row items-center">
                    <q-icon name="phone" size="sm" class="q-mr-sm" />
                    <span class="text-caption">{{ formatoTelefono(proveedor.telefono1) }}</span>
                    <q-btn 
                      v-if="proveedor.telefono1"
                      flat 
                      dense 
                      round 
                      size="xs" 
                      color="blue"
                      icon="call"
                      @click="llamarProveedor(proveedor.telefono1)"
                      class="q-ml-xs"
                    >
                      <q-tooltip>Llamar</q-tooltip>
                    </q-btn>
                  </div>

                  <!-- TELÉFONO 2 -->
                  <div v-if="proveedor.telefono2" class="row items-center">
                    <q-icon name="phone_iphone" size="sm" class="q-mr-sm" />
                    <span class="text-caption">{{ formatoTelefono(proveedor.telefono2) }}</span>
                  </div>

                  <!-- OBSERVACIONES -->
                  <div v-if="proveedor.observaciones" class="row items-start q-mt-xs">
                    <q-icon name="note" size="sm" class="q-mr-sm q-mt-xs" />
                    <span class="text-caption text-grey">{{ proveedor.observaciones }}</span>
                  </div>

                  <!-- PRODUCTOS ASOCIADOS -->
                  <div v-if="proveedor.productos && proveedor.productos.length > 0" 
                       class="row items-center q-mt-xs">
                    <q-icon name="inventory" size="sm" class="q-mr-sm" />
                    <span class="text-caption">{{ proveedor.productos.length }} productos</span>
                  </div>

                  <!-- COMPRAS RECIENTES -->
                  <div v-if="ultimaCompra(proveedor.id)" class="row items-center q-mt-xs">
                    <q-icon name="history" size="sm" class="q-mr-sm" />
                    <span class="text-caption text-grey-7">
                      Última compra: {{ formatearFecha(ultimaCompra(proveedor.id)) }}
                    </span>
                  </div>
                </div>
              </q-card-section>

              <!-- ACCIONES -->
              <q-card-actions align="right">
                <!-- VER PRODUCTOS -->
                <q-btn 
                  v-if="proveedor.productos && proveedor.productos.length > 0"
                  flat 
                  dense 
                  color="blue" 
                  icon="visibility"
                  @click="verProductos(proveedor)"
                >
                  <q-tooltip>Ver productos</q-tooltip>
                </q-btn>

                <!-- NUEVO PEDIDO -->
                <q-btn 
                  flat 
                  dense 
                  color="green" 
                  icon="add_shopping_cart"
                  @click="nuevoPedido(proveedor)"
                >
                  <q-tooltip>Nuevo pedido</q-tooltip>
                </q-btn>

                <!-- EDITAR -->
                <q-btn 
                  flat 
                  dense 
                  color="primary" 
                  icon="edit"
                  @click="editarProveedor(proveedor)"
                >
                  <q-tooltip>Editar</q-tooltip>
                </q-btn>

                <!-- ELIMINAR/TOGGLE ACTIVO -->
                <q-btn 
                  flat 
                  dense 
                  :color="proveedor.activo ? 'orange' : 'green'"
                  :icon="proveedor.activo ? 'pause' : 'play_arrow'"
                  @click="toggleActivo(proveedor)"
                >
                  <q-tooltip>{{ proveedor.activo ? 'Desactivar' : 'Activar' }}</q-tooltip>
                </q-btn>
              </q-card-actions>
            </q-card>
          </div>
        </div>

        <!-- CONTADOR -->
        <div v-if="!cargando && proveedores.length > 0" class="q-mt-md text-center">
          <q-chip color="primary" text-color="white" icon="local_shipping">
            {{ proveedoresFiltrados.length }} de {{ proveedores.length }} proveedores
          </q-chip>
          <q-chip color="green" text-color="white">
            {{ proveedoresActivos }} activos
          </q-chip>
        </div>
      </q-card-section>
    </q-card>

    <!-- =========================================== -->
    <!-- DIÁLOGO CREAR/EDITAR PROVEEDOR -->
    <!-- =========================================== -->
    <q-dialog v-model="dialogo" persistent>
      <q-card style="min-width: 450px; max-width: 600px">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">{{ modoEdicion ? '✏️ Editar Proveedor' : '➕ Nuevo Proveedor' }}</div>
          <div class="text-caption">Información del proveedor</div>
        </q-card-section>

        <q-card-section class="q-pt-md">
          <q-form @submit="guardarProveedor" class="q-gutter-md">
            <!-- NOMBRE -->
            <q-input
              v-model="formProveedor.nombre"
              label="Nombre del proveedor *"
              outlined
              dense
              autofocus
              :rules="[val => !!val || 'El nombre es obligatorio']"
            >
              <template v-slot:prepend>
                <q-icon name="store" />
              </template>
            </q-input>

            <!-- CÉDULA -->
            <q-input
              v-model="formProveedor.cedula"
              label="Cédula/NIT"
              outlined
              dense
              hint="Número de identificación"
            >
              <template v-slot:prepend>
                <q-icon name="badge" />
              </template>
            </q-input>

            <!-- DIRECCIÓN -->
            <q-input
              v-model="formProveedor.direccion"
              label="Dirección"
              outlined
              dense
              type="textarea"
              rows="2"
              hint="Dirección completa"
            >
              <template v-slot:prepend>
                <q-icon name="location_on" />
              </template>
            </q-input>

            <!-- CORREO ELECTRÓNICO -->
            <q-input
              v-model="formProveedor.correo"
              label="Correo electrónico"
              outlined
              dense
              type="email"
              :rules="[val => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) || 'Correo inválido']"
            >
              <template v-slot:prepend>
                <q-icon name="email" />
              </template>
            </q-input>

            <!-- TELÉFONO 1 -->
            <q-input
              v-model="formProveedor.telefono1"
              label="Teléfono principal *"
              outlined
              dense
              type="tel"
              mask="### ### ####"
              unmasked-value
              :rules="[val => !!val || 'Teléfono principal es obligatorio']"
            >
              <template v-slot:prepend>
                <q-icon name="phone" />
              </template>
            </q-input>

            <!-- TELÉFONO 2 -->
            <q-input
              v-model="formProveedor.telefono2"
              label="Teléfono secundario (opcional)"
              outlined
              dense
              type="tel"
              mask="### ### ####"
              unmasked-value
            >
              <template v-slot:prepend>
                <q-icon name="phone_iphone" />
              </template>
            </q-input>

            <!-- OBSERVACIONES -->
            <q-input
              v-model="formProveedor.observaciones"
              label="Observaciones"
              outlined
              dense
              type="textarea"
              rows="3"
              hint="Términos de pago, horarios, contacto adicional, etc."
            >
              <template v-slot:prepend>
                <q-icon name="note" />
              </template>
            </q-input>

            <!-- ESTADO -->
            <div class="row items-center">
              <q-toggle
                v-model="formProveedor.activo"
                label="Proveedor activo"
                color="green"
                left-label
              />
            </div>

            <!-- BOTONES -->
            <div class="row q-mt-lg">
              <q-space />
              <q-btn flat label="Cancelar" color="grey" v-close-popup @click="cerrarDialogo" />
              <q-btn 
                label="Guardar" 
                color="primary" 
                type="submit"
                :loading="guardando"
                :disable="!formProveedor.nombre || !formProveedor.telefono1"
                icon="save"
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- =========================================== -->
    <!-- DIÁLOGO PARA PRODUCTOS DEL PROVEEDOR -->
    <!-- =========================================== -->
    <q-dialog v-model="dialogoProductos" persistent>
      <q-card style="min-width: 500px">
        <q-card-section class="bg-blue text-white">
          <div class="text-h6">📦 Productos de {{ proveedorSeleccionado?.nombre }}</div>
        </q-card-section>
        
        <q-card-section>
          <div v-if="productosProveedor.length === 0" class="text-center q-pa-lg">
            <q-icon name="inventory_2" size="xl" color="grey-5" />
            <div class="q-mt-md">Este proveedor no tiene productos asociados</div>
          </div>
          
          <q-list bordered separator v-else>
            <q-item v-for="producto in productosProveedor" :key="producto.id">
              <q-item-section>
                <q-item-label class="text-weight-bold">{{ producto.nombre }}</q-item-label>
                <q-item-label caption>
                  Precio: ${{ formatPrecio(producto.precioCompra) }} | 
                  Stock: {{ producto.stock }}
                </q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-btn 
                  flat 
                  dense 
                  color="primary" 
                  icon="open_in_new"
                  @click="verProducto(producto.id)"
                />
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
        
        <q-card-actions align="right">
          <q-btn flat label="Cerrar" color="grey" v-close-popup />
          <q-btn 
            color="primary" 
            label="Ir a Productos" 
            @click="irAProductos"
            v-close-popup
          />
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
  where
} from 'firebase/firestore'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'

export default {
  name: 'ProveedoresPage',
  
  setup() {
    const $q = useQuasar()
    const router = useRouter()
    
    // DATOS REACTIVOS
    const proveedores = ref([])
    const productos = ref([])
    const compras = ref([])
    const busqueda = ref('')
    const cargando = ref(false)
    const dialogo = ref(false)
    const dialogoProductos = ref(false)
    const guardando = ref(false)
    const modoEdicion = ref(false)
    const proveedorActual = ref(null)
    const proveedorSeleccionado = ref(null)
    
    // FORMULARIO
    const formProveedor = ref({
      nombre: '',
      cedula: '',
      direccion: '',
      correo: '',
      telefono1: '',
      telefono2: '',
      observaciones: '',
      activo: true
    })
    
    // CARGAR DATOS
    const cargarProveedores = async () => {
      cargando.value = true
      try {
        const querySnapshot = await getDocs(collection(db, 'proveedores'))
        proveedores.value = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        
        // Ordenar alfabéticamente
        proveedores.value.sort((a, b) => a.nombre.localeCompare(b.nombre))
      } catch (error) {
        console.error('Error cargando proveedores:', error)
        $q.notify({
          type: 'negative',
          message: 'Error cargando proveedores'
        })
      } finally {
        cargando.value = false
      }
    }
    
    const cargarProductos = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'productos'))
        productos.value = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      } catch (error) {
        console.error('Error cargando productos:', error)
      }
    }
    
    const cargarCompras = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'compras'))
        compras.value = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      } catch (error) {
        console.error('Error cargando compras:', error)
      }
    }
    
    // FILTRAR PROVEEDORES
    const proveedoresFiltrados = computed(() => {
      if (!busqueda.value.trim()) return proveedores.value
      
      const termino = busqueda.value.toLowerCase()
      return proveedores.value.filter(p => 
        (p.nombre && p.nombre.toLowerCase().includes(termino)) ||
        (p.cedula && p.cedula.toLowerCase().includes(termino)) ||
        (p.direccion && p.direccion.toLowerCase().includes(termino)) ||
        (p.correo && p.correo.toLowerCase().includes(termino)) ||
        (p.telefono1 && p.telefono1.includes(termino)) ||
        (p.telefono2 && p.telefono2.includes(termino)) ||
        (p.observaciones && p.observaciones.toLowerCase().includes(termino))
      )
    })
    
    // ESTADÍSTICAS
    const proveedoresActivos = computed(() => {
      return proveedores.value.filter(p => p.activo !== false).length
    })
    
    // PRODUCTOS DEL PROVEEDOR SELECCIONADO
    const productosProveedor = computed(() => {
      if (!proveedorSeleccionado.value) return []
      return productos.value.filter(p => 
        p.proveedorId === proveedorSeleccionado.value.id || 
        p.proveedor === proveedorSeleccionado.value.nombre
      )
    })
    
    // ÚLTIMA COMPRA DE UN PROVEEDOR
    const ultimaCompra = (proveedorId) => {
      const comprasProveedor = compras.value.filter(c => c.proveedorId === proveedorId)
      if (comprasProveedor.length === 0) return null
      
      // Ordenar por fecha descendente
      comprasProveedor.sort((a, b) => {
        const fechaA = a.fecha?.toDate?.() || new Date(a.fecha)
        const fechaB = b.fecha?.toDate?.() || new Date(b.fecha)
        return fechaB - fechaA
      })
      
      return comprasProveedor[0].fecha
    }
    
    // ABRIR DIÁLOGO NUEVO
    const abrirDialogoNuevo = () => {
      modoEdicion.value = false
      proveedorActual.value = null
      formProveedor.value = {
        nombre: '',
        cedula: '',
        direccion: '',
        correo: '',
        telefono1: '',
        telefono2: '',
        observaciones: '',
        activo: true
      }
      dialogo.value = true
    }
    
    // EDITAR PROVEEDOR
    const editarProveedor = (proveedor) => {
      modoEdicion.value = true
      proveedorActual.value = proveedor
      formProveedor.value = {
        nombre: proveedor.nombre || '',
        cedula: proveedor.cedula || '',
        direccion: proveedor.direccion || '',
        correo: proveedor.correo || '',
        telefono1: proveedor.telefono1 || '',
        telefono2: proveedor.telefono2 || '',
        observaciones: proveedor.observaciones || '',
        activo: proveedor.activo !== false
      }
      dialogo.value = true
    }
    
    // GUARDAR PROVEEDOR
    const guardarProveedor = async () => {
      if (!formProveedor.value.nombre.trim()) {
        $q.notify({
          type: 'warning',
          message: 'El nombre es obligatorio'
        })
        return
      }
      
      if (!formProveedor.value.telefono1.trim()) {
        $q.notify({
          type: 'warning',
          message: 'El teléfono principal es obligatorio'
        })
        return
      }
      
      guardando.value = true
      
      try {
        const proveedorData = {
          nombre: formProveedor.value.nombre.trim(),
          cedula: formProveedor.value.cedula ? formProveedor.value.cedula.trim() : '',
          direccion: formProveedor.value.direccion ? formProveedor.value.direccion.trim() : '',
          correo: formProveedor.value.correo ? formProveedor.value.correo.trim().toLowerCase() : '',
          telefono1: formProveedor.value.telefono1 ? formProveedor.value.telefono1.replace(/\s/g, '') : '',
          telefono2: formProveedor.value.telefono2 ? formProveedor.value.telefono2.replace(/\s/g, '') : '',
          observaciones: formProveedor.value.observaciones ? formProveedor.value.observaciones.trim() : '',
          activo: formProveedor.value.activo,
          updatedAt: serverTimestamp()
        }
        
        if (modoEdicion.value && proveedorActual.value) {
          // ACTUALIZAR
          const proveedorRef = doc(db, 'proveedores', proveedorActual.value.id)
          await updateDoc(proveedorRef, proveedorData)
          
          $q.notify({
            type: 'positive',
            message: '✅ Proveedor actualizado',
            icon: 'check_circle'
          })
        } else {
          // CREAR
          proveedorData.createdAt = serverTimestamp()
          await addDoc(collection(db, 'proveedores'), proveedorData)
          
          $q.notify({
            type: 'positive',
            message: '✅ Proveedor agregado',
            icon: 'check_circle'
          })
        }
        
        cerrarDialogo()
        await cargarProveedores()
        
      } catch (error) {
        console.error('Error guardando proveedor:', error)
        $q.notify({
          type: 'negative',
          message: '❌ Error al guardar',
          caption: error.message
        })
      } finally {
        guardando.value = false
      }
    }
    
    // TOGGLE ACTIVO/INACTIVO
    const toggleActivo = async (proveedor) => {
      try {
        const nuevoEstado = !proveedor.activo
        const proveedorRef = doc(db, 'proveedores', proveedor.id)
        
        await updateDoc(proveedorRef, {
          activo: nuevoEstado,
          updatedAt: serverTimestamp()
        })
        
        // Actualizar localmente
        proveedor.activo = nuevoEstado
        
        $q.notify({
          type: 'info',
          message: nuevoEstado ? '✅ Proveedor activado' : '⏸️ Proveedor desactivado',
          icon: nuevoEstado ? 'play_arrow' : 'pause'
        })
        
      } catch (error) {
        console.error('Error cambiando estado:', error)
        $q.notify({
          type: 'negative',
          message: '❌ Error al cambiar estado'
        })
      }
    }
    
    // VER PRODUCTOS DEL PROVEEDOR
    const verProductos = (proveedor) => {
      proveedorSeleccionado.value = proveedor
      dialogoProductos.value = true
    }
    
    // NUEVO PEDIDO/COMPRA
    const nuevoPedido = (proveedor) => {
      $q.dialog({
        title: '📦 Nuevo Pedido',
        message: `¿Qué quieres hacer con ${proveedor.nombre}?`,
        options: {
          type: 'radio',
          model: 'productos',
          items: [
            { label: 'Ver productos disponibles', value: 'productos' },
            { label: 'Registrar nueva compra', value: 'compra' },
            { label: 'Llamar para consultar', value: 'llamar' }
          ]
        },
        cancel: true,
        persistent: true
      }).onOk(accion => {
        if (accion === 'productos') {
          verProductos(proveedor)
        } else if (accion === 'compra') {
          // Redirigir a módulo de compras (crear si no existe)
          $q.notify({
            type: 'info',
            message: 'Módulo de compras en desarrollo',
            caption: 'Próximamente podrás registrar compras'
          })
        } else if (accion === 'llamar' && proveedor.telefono1) {
          llamarProveedor(proveedor.telefono1)
        }
      })
    }
    
    // LLAMAR PROVEEDOR
    const llamarProveedor = (telefono) => {
      const numeroLimpio = telefono.replace(/\D/g, '')
      window.location.href = `tel:${numeroLimpio}`
    }
    
    // VER PRODUCTO ESPECÍFICO
    const verProducto = (productoId) => {
      router.push(`/productos?producto=${productoId}`)
    }
    
    // IR A PRODUCTOS
    const irAProductos = () => {
      router.push('/productos')
    }
    
    // FUNCIONES DE FORMATO
    const formatoTelefono = (telefono) => {
      if (!telefono) return ''
      const limpio = telefono.replace(/\D/g, '')
      if (limpio.length === 10) {
        return `${limpio.substring(0, 3)} ${limpio.substring(3, 6)} ${limpio.substring(6)}`
      }
      return telefono
    }
    
    const formatearFecha = (fecha) => {
      if (!fecha) return 'Nunca'
      const fechaObj = fecha.toDate ? fecha.toDate() : new Date(fecha)
      return fechaObj.toLocaleDateString('es-CO')
    }
    
    const formatPrecio = (precio) => {
      return new Intl.NumberFormat('es-CO').format(precio || 0)
    }
    
    // CERRAR DIÁLOGO
    const cerrarDialogo = () => {
      dialogo.value = false
      formProveedor.value = {
        nombre: '',
        cedula: '',
        direccion: '',
        correo: '',
        telefono1: '',
        telefono2: '',
        observaciones: '',
        activo: true
      }
      modoEdicion.value = false
      proveedorActual.value = null
    }
    
    // INICIALIZAR
    onMounted(async () => {
      await cargarProveedores()
      await cargarProductos()
      await cargarCompras()
    })
    
    return {
      // Datos
      proveedores,
      busqueda,
      cargando,
      dialogo,
      dialogoProductos,
      guardando,
      modoEdicion,
      formProveedor,
      proveedorSeleccionado,
      productosProveedor,
      
      // Computadas
      proveedoresFiltrados,
      proveedoresActivos,
      
      // Métodos
      abrirDialogoNuevo,
      editarProveedor,
      guardarProveedor,
      toggleActivo,
      verProductos,
      nuevoPedido,
      llamarProveedor,
      verProducto,
      irAProductos,
      cerrarDialogo,
      formatoTelefono,
      formatearFecha,
      formatPrecio,
      ultimaCompra
    }
  }
}
</script>

<style scoped>
.proveedor-card {
  border-radius: 12px;
  transition: transform 0.2s, box-shadow 0.2s;
  height: 100%;
  border-left: 4px solid var(--q-primary);
}

.proveedor-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

/* Estilo para proveedores inactivos */
.proveedor-card:has(+ .inactivo) {
  border-left-color: var(--q-negative);
  opacity: 0.8;
}
</style>